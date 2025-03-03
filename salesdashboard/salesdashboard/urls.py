"""
URL configuration for salesdashboard project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from sales import views
from sales.views import CustomLoginView
from sales.views import register


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('sales/data/', views.sales_data, name='sales_data'),
    path('sales/add/', views.add_sale, name='add_sale'),
    path('fetch-sales-data/', views.fetch_sales_data, name='fetch_sales_data'),
    path('login/', CustomLoginView.as_view(template_name='sales/login.html'), name='login'),
    path('register/', register, name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('accounts/', include('allauth.urls')),
    path('delete-sale/<int:id>/', views.delete_sale, name='delete_sale'),
    path('edit-sale/<int:id>/', views.edit_sale, name='edit_sale'),
]