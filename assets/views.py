from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Asset, Employee, Assignment
from .serializers import AssetSerializer, EmployeeSerializer, AssignmentSerializer
from django.http import HttpResponse
import openpyxl 
from django.db.models import Count
from rest_framework.views import APIView

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Asset.objects.all()

        try:
            employee = user.employee
            return Asset.objects.filter(assignments__employee=employee).distinct()
        except Employee.DoesNotExist:
            return Asset.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # الأدمن يشوف كل الموظفين
        if user.is_staff:
            return Employee.objects.all()
        return Employee.objects.filter(user=user)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # الأدمن يشوف كل عمليات الإسناد
        if user.is_staff:
            return Assignment.objects.all()

        # المستخدم العادي يشوف فقط الإسنادات الخاصة به
        try:
            employee = user.employee
            return Assignment.objects.filter(employee=employee)
        except Employee.DoesNotExist:
            return Assignment.objects.none()



    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['available_assets'] = Asset.objects.filter(is_assigned=False)
        return context
    


class EmployeeReportView(APIView):
    def get(self, request):
        queryset = Employee.objects.all()

        # filters
        department = request.GET.get("department")
        employee_id = request.GET.get("employee_id")
        search = request.GET.get("search")

        if department:
            queryset = queryset.filter(department__icontains=department)

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        if search:
            queryset = queryset.filter(full_name__icontains=search)

        # count assignments (devices)
        queryset = queryset.annotate(
            total_devices=Count("assignments")
        )

        data = [
            {
                "id": emp.id,
                "full_name": emp.full_name,
                "employee_id": emp.employee_id,
                "email": emp.email,
                "department": emp.department,
                "job_title": emp.job_title,
                "total_devices": emp.total_devices,
            }
            for emp in queryset
        ]

        return Response(data)


class AssignmentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Assignment.objects.select_related("asset", "employee").all()

        employee_id = request.GET.get("employee_id")
        asset_tag = request.GET.get("asset_tag")
        status = request.GET.get("status")  # active / returned

        if employee_id:
            queryset = queryset.filter(employee__employee_id=employee_id)

        if asset_tag:
            queryset = queryset.filter(asset__asset_tag=asset_tag)

        if status == "active":
            queryset = queryset.filter(returned_at__isnull=True)

        if status == "returned":
            queryset = queryset.filter(returned_at__isnull=False)

        data = [
            {
                "id": assignment.id,
                "asset_name": assignment.asset.name,
                "asset_tag": assignment.asset.asset_tag,
                "employee_name": assignment.employee.full_name,
                "employee_id": assignment.employee.employee_id,
                "assigned_at": assignment.assigned_at,
                "returned_at": assignment.returned_at,
                "status": "Returned" if assignment.returned_at else "Active",
                "notes": assignment.notes,
            }
            for assignment in queryset
        ]

        return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reports_summary(request):
    total_assets = Asset.objects.count()
    assigned_assets = Asset.objects.filter(is_assigned=True).count()
    available_assets = Asset.objects.filter(is_assigned=False).count()
    total_employees = Employee.objects.count()
    total_assignments = Assignment.objects.count()




    return Response({
        "total_assets": total_assets,
        "assigned_assets": assigned_assets,
        "available_assets": available_assets,
        "total_employees": total_employees,
        "total_assignments": total_assignments,
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_assets_excel(request):

    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Assets Report"

    headers = [
        "Name",
        "Type",
        "Serial Number",
        "Asset Tag",
        "Purchase Date",
        "Status",
    ]

    sheet.append(headers)

    status = request.GET.get("status")
    device_type = request.GET.get("type")

    assets = Asset.objects.all()

    if status:
        if status == "available":
            assets = assets.filter(is_assigned=False)
        elif status == "assigned":
            assets = assets.filter(is_assigned=True)

    if device_type:
        assets = assets.filter(device_type__iexact=device_type)

    for asset in assets:
        sheet.append([
            asset.name,
            asset.device_type,
            asset.serial_number,
            asset.asset_tag,
            str(asset.purchase_date) if asset.purchase_date else "",
            "Assigned" if asset.is_assigned else "Available",
        ])

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    response["Content-Disposition"] = 'attachment; filename="assets_report.xlsx"'

    workbook.save(response)
    return response