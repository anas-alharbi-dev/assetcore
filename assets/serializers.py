from rest_framework import serializers
from .models import Asset, Employee, Assignment


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')

        if request and request.method in ['POST', 'PUT', 'PATCH']:
            self.fields['asset'].queryset = Asset.objects.filter(is_assigned=False)

    def validate(self, data):
        asset = data.get('asset')
        returned_at = data.get('returned_at')

        if asset and asset.is_assigned and returned_at is None:
            raise serializers.ValidationError(
                "This asset is already assigned to another employee."
            )

        return data