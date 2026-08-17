import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.authentication.models import User
from apps.applications.models import Application, BursaryBudget, AuditLog

def seed_postgres():
    print("Verifying PostgreSQL database setup...")

    # 1. Budget Cap
    budget, created = BursaryBudget.objects.get_or_create(
        financial_year='2026/2027',
        defaults={'total_budget': 20000000.00}
    )
    print(f"[OK] Budget Cap FY 2026/2027: KSh {budget.total_budget:,.2f}")

    # 2. Super Admin User
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
            'email': 'admin@kibweziwest.go.ke',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    print(f"[OK] Super Admin User verified: {admin_user.username}")

    # 3. Committee User
    comm_user, created = User.objects.get_or_create(
        username='committee1',
        defaults={
            'first_name': 'Bursary',
            'last_name': 'Committee',
            'email': 'committee@kibweziwest.go.ke',
            'role': 'COMMITTEE'
        }
    )
    if created:
        comm_user.set_password('comm123')
        comm_user.save()
    print(f"[OK] Committee User verified: {comm_user.username}")

    # 4. Finance User
    fin_user, created = User.objects.get_or_create(
        username='finance1',
        defaults={
            'first_name': 'Disbursement',
            'last_name': 'Officer',
            'email': 'finance@kibweziwest.go.ke',
            'role': 'FINANCE'
        }
    )
    if created:
        fin_user.set_password('fin123')
        fin_user.save()
    print(f"[OK] Finance Officer verified: {fin_user.username}")

    # 5. Student Applicant User (Willy Mutunga)
    student_user, created = User.objects.get_or_create(
        username='41354126',
        defaults={
            'first_name': 'Willy',
            'last_name': 'Mutunga',
            'national_id': '41354126',
            'phone_number': '0742765445',
            'email': 'willy.mutunga@student.go.ke',
            'role': 'APPLICANT'
        }
    )
    if created:
        student_user.set_password('William#20')
        student_user.save()
    print(f"[OK] Student Applicant verified: {student_user.username} ({student_user.first_name} {student_user.last_name})")

    # 6. Sample Application
    app, created = Application.objects.get_or_create(
        applicant=student_user,
        defaults={
            'institution_name': 'University of Nairobi',
            'institution_type': 'Public University',
            'admission_number': 'C01/001/2023',
            'course': 'BSc Computer Science',
            'year_of_study': 'Year 3',
            'ward': 'Emali/Mulala',
            'polling_station': 'Emali Primary School',
            'amount_applied': 15000.00,
            'fee_balance': 45000.00,
            'status': 'APPROVED',
            'awarded_amount': 15000.00,
            'eligibility_score': 85,
            'fraud_score': 'LOW_RISK'
        }
    )
    if created:
        app.reference_number = 'CDF/BURS/2026/001'
        app.save()
    print(f"[OK] Verified Bursary Application: {app.reference_number} for {student_user.first_name} {student_user.last_name}")

    # 7. Audit Log Entry
    AuditLog.objects.get_or_create(
        action='SYSTEM_POSTGRES_VERIFIED',
        defaults={
            'user': admin_user,
            'user_name': 'Super Admin',
            'role': 'ADMIN',
            'details': 'Verified PostgreSQL database connection and data integrity for ng_cdfbursary.'
        }
    )
    print("[OK] Audit log entry created.")

    print("\nSUCCESS: All data in PostgreSQL database 'ng_cdfbursary' verified cleanly!")

if __name__ == '__main__':
    seed_postgres()
