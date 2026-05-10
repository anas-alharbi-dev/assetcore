from django.urls import path
from rest_framework.routers import DefaultRouter 
from .views import (
    AssetViewSet,
    EmployeeViewSet,
    AssignmentViewSet,
    export_assets_excel,
    export_assignments_excel,
    export_employees_excel,
    import_assets_excel,
    reports_summary
)

router = DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'assignments', AssignmentViewSet, basename='assignment')


urlpatterns = [
    path("reports/export-excel/", export_assets_excel),

    path("reports/assignments-excel/", export_assignments_excel),
    path("reports/employees-excel/", export_employees_excel),
path("assets/import-excel/", import_assets_excel),
    path("reports/summary/", reports_summary),
] + router.urls

