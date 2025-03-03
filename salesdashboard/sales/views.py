from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.views import LoginView
from .models import Profile, Sale
from .forms import UserRegisterForm
from django.utils.timezone import localtime
import pytz
import datetime
import logging
import json

# Configure logger
logger = logging.getLogger(__name__)

# Custom Login View
class CustomLoginView(LoginView):
    template_name = 'sales/login.html'  # Path to your login template
    redirect_authenticated_user = True  # Redirect authenticated users to the home page

    def form_valid(self, form):
        # Check if the user is authenticated
        if self.request.user.is_authenticated:
            username = self.request.user.username  # Get the username
            email = self.request.user.email  # Get the email (if needed)
            messages.success(self.request, f'Welcome, {username}!')  # Use username or email
        return super().form_valid(form)

        
# Home Page (Protected)
@login_required
def home(request):
    context = {
        'username': request.user.username,  # Pass the username to the template
        'email': request.user.email,  # Pass the email to the template (optional)
    }
    return render(request, 'sales/home.html', context)


    

# Login Page (Public)
def custom_login(request):
    if request.user.is_authenticated:  # If user is already logged in, redirect to home
        return redirect('home')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'sales/login.html')

# Registration Page (Public)
def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()  # Save the user
            Profile.objects.create(user=user)  # Create a profile for the new user
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
        else:
            # If the form is not valid, display error messages
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = UserRegisterForm()
    
    return render(request, 'sales/register.html', {'form': form})

# Sales Data Endpoint (Protected)
@login_required
def sales_data(request):
    try:
        current_month = datetime.datetime.now().month
        sales = Sale.objects.values('date').annotate(total_sales=Sum('sales')).order_by('date')
        logger.info(f"Sales data: {list(sales)}")  # Log the fetched data
        labels = [sale['date'].strftime('%Y-%m-%d') for sale in sales]
        data = [sale['total_sales'] for sale in sales]
        return JsonResponse({'labels': labels, 'data': data})
    except Exception as e:
        logger.error(f"Error fetching sales data: {e}")
        return JsonResponse({'error': 'An error occurred while fetching sales data.'}, status=500)

# Add Sale Endpoint (Protected)
@csrf_exempt
@login_required
def add_sale(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            date = data.get('date')
            sales = data.get('sales')

            # Validate the data
            if not date or not sales:
                return JsonResponse({'success': False, 'error': 'Missing date or sales data'}, status=400)

            # Create a new Sale object
            Sale.objects.create(date=date, sales=sales)
            return JsonResponse({'success': True})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)



@csrf_exempt
def fetch_sales_data(request):
    if request.method == 'GET':
        selected_date = request.GET.get('date')  # Get the selected date from the request
        if selected_date:
            # Filter sales data by the selected date
            sales = Sale.objects.filter(date=selected_date).values('id', 'date','submission_time', 'sales')
        else:
            # If no date is selected, fetch all sales data
            sales = Sale.objects.all().values('id', 'date','submission_time', 'sales')
        
        # Convert QuerySet to a list of dictionaries
        sales_data = list(sales)

        dublin_tz = pytz.timezone('Europe/Dublin')
        for sale in sales_data:
            sale['submission_time'] = localtime(sale['submission_time'], dublin_tz).strftime('%Y-%m-%d %I:%M %p')  # Full format
            
        return JsonResponse(sales_data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def delete_sale(request, id):
    if request.method == 'DELETE':
        try:
            sale = Sale.objects.get(id=id)
            sale.delete()
            return JsonResponse({'status': 'success'})
        except Sale.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Sale not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

@csrf_exempt
def edit_sale(request, id):
    if request.method == 'PUT':
        try:
            sale = Sale.objects.get(id=id)
            data = json.loads(request.body)
            sale.sales = data['sales']
            sale.save()
            return JsonResponse({'status': 'success'})
        except Sale.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Sale not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)



# Logout Page (Protected)
@login_required
def custom_logout(request):
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('login')  # Redirect to login page after logout