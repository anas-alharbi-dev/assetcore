from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Asset, Employee, Assignment
from .serializers import AssetSerializer, EmployeeSerializer, AssignmentSerializer
from django.http import HttpResponse
import openpyxl 

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