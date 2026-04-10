from django.contrib import admin
from .models import Asset, Employee, Assignment


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("full_name", "employee_id", "email", "department", "user")
    search_fields = ("full_name", "employee_id", "email")


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("name", "asset_tag", "device_type", "is_assigned")
    search_fields = ("name", "asset_tag", "serial_number")
    list_filter = ("device_type", "is_assigned")


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("asset", "employee", "assigned_at", "returned_at")
    search_fields = ("asset__asset_tag", "employee__full_name")
    list_filter = ("assigned_at",)
