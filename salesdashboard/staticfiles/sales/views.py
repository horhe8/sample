from django.shortcuts import render, redirect
from .models import Sale
from .forms import SaleForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum
import datetime
import logging
import json



def home(request):
    return render(request, 'sales/home.html')


logger = logging.getLogger(__name__)

def sales_data(request):
    current_month = datetime.datetime.now().month
    sales = Sale.objects.values('date').annotate(total_sales=Sum('sales')).order_by('date')
    logger.info(f"Sales data: {list(sales)}")  # Log the fetched data
    labels = [sale['date'].strftime('%Y-%m-%d') for sale in sales]
    data = [sale['total_sales'] for sale in sales]
    return JsonResponse({'labels': labels, 'data': data})

@csrf_exempt
def add_sale(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            date = data.get('date')
            sales = data.get('sales')
            Sale.objects.create(date=date, sales=sales)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})