from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class Employee(models.Model):
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"

    class Meta:
        ordering = ['-created_at']


class Asset(models.Model):
    DEVICE_TYPE_CHOICES = [
        ('laptop', 'Laptop'),
        ('desktop', 'Desktop'),
        ('monitor', 'Monitor'),
        ('printer', 'Printer'),
        ('phone', 'Phone'),
        ('tablet', 'Tablet'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('maintenance', 'Maintenance'),
        ('retired', 'Retired'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, choices=DEVICE_TYPE_CHOICES)

    serial_number = models.CharField(max_length=100, unique=True)
    asset_tag = models.CharField(max_length=100, unique=True)

    purchase_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    is_assigned = models.BooleanField(default=False)
    assigned_to = models.CharField(max_length=200, blank=True, null=True)

    location = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # 🔥 أهم إضافة (multi-user system)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.asset_tag})"

class Assignment(models.Model):
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    assigned_at = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.asset.asset_tag} -> {self.employee.full_name}"

    def clean(self):
        if self.asset.is_assigned and self.returned_at is None and not self .pk:
            raise ValidationError("This asset is already assigned to another employee.")

    def save(self, *args, **kwargs):
        self.clean()
        if self.returned_at:
            self.asset.is_assigned = False
        else:
            self.asset.is_assigned = True

        self.asset.save()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-assigned_at']