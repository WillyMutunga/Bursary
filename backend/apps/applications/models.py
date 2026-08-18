# Recompile trigger: 2026-08-18 10:15:00
from django.db import models
from django.conf import settings
import uuid

class ApplicantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applicant_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)
    constituency = models.CharField(max_length=100, null=True, blank=True)
    ward = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    sub_location = models.CharField(max_length=100, null=True, blank=True)
    village = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"Profile: {self.user.username}"

class Application(models.Model):
    WARD_CHOICES = [
        ('Emali/Mulala', 'Emali/Mulala'),
        ('Makindu', 'Makindu'),
        ('Nguu/Masumba', 'Nguu/Masumba'),
        ('Nguumo', 'Nguumo'),
        ('Kikumbulyu North', 'Kikumbulyu North'),
        ('Kikumbulyu South', 'Kikumbulyu South'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('VERIFICATION', 'Verification'),
        ('COMMITTEE_REVIEW', 'Committee Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('FLAGGED', 'Flagged'),
        ('PAID', 'Paid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Location / Administrative Information
    ward = models.CharField(max_length=100, choices=WARD_CHOICES, null=True, blank=True)
    polling_station = models.CharField(max_length=200, null=True, blank=True)
    
    # Step 2: Education Information
    institution_name = models.CharField(max_length=200, null=True, blank=True)
    institution_type = models.CharField(max_length=100, null=True, blank=True)
    course = models.CharField(max_length=200, null=True, blank=True)
    year_of_study = models.CharField(max_length=50, null=True, blank=True)
    admission_number = models.CharField(max_length=100, null=True, blank=True)
    
    # Step 3: Parent/Guardian
    guardian_name = models.CharField(max_length=200, null=True, blank=True)
    guardian_relationship = models.CharField(max_length=100, null=True, blank=True)
    guardian_phone = models.CharField(max_length=20, null=True, blank=True)
    guardian_occupation = models.CharField(max_length=100, null=True, blank=True)
    
    # Step 4: Household / Vulnerability
    income_category = models.CharField(max_length=100, null=True, blank=True)
    vulnerability_status = models.TextField(null=True, blank=True) # e.g., orphan, disabled
    
    # Step 5: Financial
    fee_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amount_applied = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Step 7: Previous Support
    previous_support = models.BooleanField(default=False)
    previous_support_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Step 6: Documents
    id_document = models.FileField(upload_to='applications/documents/id/', null=True, blank=True)
    fee_structure = models.FileField(upload_to='applications/documents/fee/', null=True, blank=True)
    admission_letter = models.FileField(upload_to='applications/documents/admission/', null=True, blank=True)
    
    # Review & System
    fraud_score = models.CharField(max_length=20, default='LOW_RISK')
    eligibility_score = models.IntegerField(null=True, blank=True)
    awarded_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference_number and self.status != 'DRAFT':
            # Generate reference number upon submission
            # Use short UUID to prevent collisions from simply counting rows
            import uuid
            unique_suffix = str(uuid.uuid4().hex)[:6].upper()
            self.reference_number = f"CDF/BURS/2026/{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"App {self.reference_number or 'Draft'} - {self.applicant.username}"

class BursaryBudget(models.Model):
    financial_year = models.CharField(max_length=20, default='2026/2027', unique=True)
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=20000000.00) # KSh 20,000,000 default
    is_window_open = models.BooleanField(default=True)

    def __str__(self):
        return f"Budget FY {self.financial_year}: KSh {self.total_budget} (Window: {'OPEN' if self.is_window_open else 'LOCKED'})"

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=150, null=True, blank=True)
    role = models.CharField(max_length=50, null=True, blank=True)
    action = models.CharField(max_length=255)
    details = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.user_name or 'System'} - {self.action}"
