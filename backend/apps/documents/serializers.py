from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('id', 'file_hash', 'uploaded_at', 'verification_status', 'ocr_status', 'ocr_extracted_text')
