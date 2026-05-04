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
from rest_framework.parsers import MultiPartParser
from io import BytesIO

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
        queryset = Assignment.objects.select_related("asset", "employee")

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
                "asset_name": assignment.asset.name,
                "asset_tag": assignment.asset.asset_tag,
                "employee_name": assignment.employee.full_name,
                "employee_id": assignment.employee.employee_id,
                "assigned_at": assignment.assigned_at,
                "returned_at": assignment.returned_at,
                "status": "Returned" if assignment.returned_at else "Assigned",
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

    assets_sheet = workbook.active
    assets_sheet.title = "Assets"

    assets_sheet.append(["Name", "Type", "Serial Number", "Asset Tag", "Purchase Date", "Status"])

    status = request.GET.get("status")
    device_type = request.GET.get("type")

    assets = Asset.objects.all()

    if status == "available":
        assets = assets.filter(is_assigned=False)
    elif status == "assigned":
        assets = assets.filter(is_assigned=True)

    if device_type:
        assets = assets.filter(device_type__iexact=device_type)

    for asset in assets:
        assets_sheet.append([
            asset.name,
            asset.device_type,
            asset.serial_number,
            asset.asset_tag,
            str(asset.purchase_date) if asset.purchase_date else "",
            "Assigned" if asset.is_assigned else "Available"
        ])

    # Auto width
    for column in assets_sheet.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        assets_sheet.column_dimensions[column_letter].width = max_length + 2


    # =========================
    # 2. EMPLOYEES SHEET
    # =========================
    employees_sheet = workbook.create_sheet("Employees")

    employees_sheet.append(["Name", "Employee ID", "Department", "Email"])

    employee_id = request.GET.get("employee_id")
    search = request.GET.get("search")

    employees = Employee.objects.all()

    if employee_id:
        employees = employees.filter(employee_id=employee_id)

    if search:
        employees = employees.filter(full_name__icontains=search)

    for emp in employees:
        employees_sheet.append([
            emp.full_name,
            emp.employee_id,
            emp.department,
            emp.email
        ])

    # Auto width
    for column in employees_sheet.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        employees_sheet.column_dimensions[column_letter].width = max_length + 2


  
    assignments_sheet = workbook.create_sheet("Assignments")

    assignments_sheet.append(["Asset", "Employee", "Assigned At", "Returned At", "Status"])

    assignment_status = request.GET.get("assignment_status")

    assignments = Assignment.objects.select_related("asset", "employee")

    if assignment_status == "active":
        assignments = assignments.filter(returned_at__isnull=True)
    elif assignment_status == "returned":
        assignments = assignments.filter(returned_at__isnull=False)

    for a in assignments:
        assignments_sheet.append([
            a.asset.name,
            a.employee.full_name,
            str(a.assigned_at),
            str(a.returned_at) if a.returned_at else "",
            "Returned" if a.returned_at else "Assigned"
        ])

    # Auto width
    for column in assignments_sheet.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        assignments_sheet.column_dimensions[column_letter].width = max_length + 2


    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    response["Content-Disposition"] = "attachment; filename=full_report.xlsx"

    return response({
            "message": "Assets import completed",
            "created": created,
            "updated": updated,
            "errors": errors,
        })