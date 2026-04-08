from rest_framework import viewsets
from .models import Asset, Employee, Assignment
from .serializers import AssetSerializer, EmployeeSerializer, AssignmentSerializer


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['available_assets'] = Asset.objects.filter(is_assigned=False)
        return context