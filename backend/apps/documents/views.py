from rest_framework import viewsets, parsers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
import hashlib

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'APPLICANT':
            return Document.objects.filter(application__applicant=user)
        return Document.objects.all()

    def perform_create(self, serializer):
        # Calculate file hash for security/duplicate detection before saving
        file_obj = self.request.data.get('file')
        file_hash = ''
        if file_obj:
            hasher = hashlib.sha256()
            for chunk in file_obj.chunks():
                hasher.update(chunk)
            file_hash = hasher.hexdigest()
            
        serializer.save(file_hash=file_hash)
