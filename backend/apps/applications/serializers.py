from rest_framework import serializers
from .models import Application, ApplicantProfile, AuditLog

class ApplicantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantProfile
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    applicant_full_name = serializers.SerializerMethodField()
    applicant_username = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('id', 'reference_number', 'applicant', 'status', 'fraud_score', 'eligibility_score', 'awarded_amount')

    def get_applicant_full_name(self, obj):
        if obj.applicant:
            name = f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
            return name if name else obj.applicant.username
        return 'N/A'

    def get_applicant_username(self, obj):
        return obj.applicant.username if obj.applicant else 'N/A'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
