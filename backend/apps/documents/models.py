from django.db import models
from apps.applications.models import Application
import uuid

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=100) # e.g., ID_CARD, ADMISSION_LETTER, FEE_STRUCTURE
    file = models.FileField(upload_to='bursary_documents/%Y/%m/%d/')
    file_hash = models.CharField(max_length=256, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Verification & OCR
    verification_status = models.CharField(max_length=50, default='PENDING')
    ocr_status = models.CharField(max_length=50, default='NOT_SCANNED')
    ocr_extracted_text = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.document_type} - {self.application.reference_number}"
