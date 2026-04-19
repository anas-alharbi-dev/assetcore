from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Asset, Employee, Assignment
from .serializers import AssetSerializer, EmployeeSerializer, AssignmentSerializer

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