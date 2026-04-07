from django.db import models


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

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, choices=DEVICE_TYPE_CHOICES)
    serial_number = models.CharField(max_length=100, unique=True)
    asset_tag = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField(null=True, blank=True)
    is_assigned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.asset_tag}"

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

    def _str_(self):
        return f"{self.asset.asset_tag} -> {self.employee.full_name}"

    def save(self, *args, **kwargs):
        if self.returned_at is not None:
            self.asset.is_assigned = False
        else:
            self.asset.is_assigned = True

        self.asset.save()
        super().save(*args, **kwargs)