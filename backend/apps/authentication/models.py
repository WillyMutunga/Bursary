from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.TextChoices):
    APPLICANT = 'APPLICANT', 'Applicant/Student'
    SCHOOL_OFFICER = 'SCHOOL_OFFICER', 'School Officer'
    VERIFICATION_OFFICER = 'VERIFICATION_OFFICER', 'Verification Officer'
    FIELD_OFFICER = 'FIELD_OFFICER', 'Field Officer'
    COMMITTEE_MEMBER = 'COMMITTEE_MEMBER', 'Committee Member'
    FINANCE_OFFICER = 'FINANCE_OFFICER', 'Finance Officer'
    ADMINISTRATOR = 'ADMINISTRATOR', 'Administrator'
    SUPER_ADMINISTRATOR = 'SUPER_ADMINISTRATOR', 'Super Administrator'
    AUDITOR = 'AUDITOR', 'Auditor'

class User(AbstractUser):
    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.APPLICANT
    )
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    national_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # We can add more profile fields or keep them in an Applicant profile model later.
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
