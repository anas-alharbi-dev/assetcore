from rest_framework import serializers
from .models import Asset, Employee, Assignment


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ["created_by"]


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

    def _init_(self, *args, **kwargs):
        super()._init_(*args, **kwargs)
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

    def create(self, validated_data):
        assignment = Assignment.objects.create(**validated_data)

        if assignment.returned_at is None:
            assignment.asset.is_assigned = True
        else:
            assignment.asset.is_assigned = False

        assignment.asset.save()
        return assignment

    def update(self, instance, validated_data):
        instance.assigned_at = validated_data.get('assigned_at', instance.assigned_at)
        instance.returned_at = validated_data.get('returned_at', instance.returned_at)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.asset = validated_data.get('asset', instance.asset)
        instance.employee = validated_data.get('employee', instance.employee)

        if instance.returned_at is None:
            instance.asset.is_assigned = True
        else:
            instance.asset.is_assigned = False

        instance.asset.save()
        instance.save()
        return instance