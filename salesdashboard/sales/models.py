from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  # Add this import


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)  # Admin validation field

    def __str__(self):
        return self.user.username



class Sale(models.Model):
    date = models.DateField()
    sales = models.DecimalField(max_digits=10, decimal_places=2)
    submission_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.sales}"