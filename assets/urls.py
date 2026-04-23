from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AssetViewSet,
    EmployeeViewSet,
    AssignmentViewSet,
    reports_summary,
    export_assets_excel,
)

router = DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path("reports/summary/", reports_summary),
    path("reports/export-excel/", export_assets_excel),
] + router.urls