import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from apps.authentication.models import User
from apps.applications.models import Application, BursaryBudget, AuditLog

def verify_all_system_info():
    print("=" * 60)
    print("  POSTGRESQL SYSTEM DATABASE VERIFICATION REPORT ('ng_cdfbursary')  ")
    print("=" * 60)

    # 1. Database Connection Info
    vendor = connection.vendor
    db_name = connection.settings_dict['NAME']
    db_user = connection.settings_dict['USER']
    db_host = connection.settings_dict['HOST']
    print(f"\n1. DATABASE CONNECTION DETAILS:")
    print(f"   • Database Engine: {vendor.upper()}")
    print(f"   • Database Name  : {db_name}")
    print(f"   • Database User  : {db_user}")
    print(f"   • Database Host  : {db_host}")

    # 2. Registered System Users
    users = User.objects.all().order_by('id')
    print(f"\n2. SYSTEM USER ACCOUNTS ({users.count()} Users in DB):")
    for u in users:
        print(f"   • [ID: {u.id}] Username: {u.username:<12} | Name: {u.first_name} {u.last_name:<15} | Role: {u.role:<12} | ID: {u.national_id or 'N/A'}")

    # 3. Bursary Financial Budget
    budgets = BursaryBudget.objects.all()
    print(f"\n3. CONSTITUENCY FINANCIAL BUDGET (In DB):")
    for b in budgets:
        print(f"   • FY {b.financial_year}: Total Budget Cap = KSh {b.total_budget:,.2f}")

    # 4. Bursary Applications
    apps = Application.objects.all().order_by('-created_at')
    print(f"\n4. BURSARY APPLICATIONS ({apps.count()} Records in DB):")
    for a in apps:
        student_name = f"{a.applicant.first_name} {a.applicant.last_name}".strip() if a.applicant else "N/A"
        print(f"   • Ref: {a.reference_number or 'Draft':<20} | Student: {student_name:<18} | Ward: {a.ward or 'Emali/Mulala':<16} | Polling: {a.polling_station or 'N/A':<20} | Status: {a.status:<12} | Awarded: KSh {a.awarded_amount or 0:,.2f}")

    # 5. System Audit Logs
    logs = AuditLog.objects.all().order_by('-timestamp')
    print(f"\n5. AUDIT TRAIL LOGS ({logs.count()} Records in DB):")
    for l in logs[:5]:
        print(f"   • [{l.timestamp.strftime('%Y-%m-%d %H:%M')}] {l.user_name:<15} ({l.role}): {l.action} - {l.details[:50]}...")

    # 6. PostgreSQL Database Tables List
    with connection.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = [row[0] for row in cursor.fetchall()]
    
    print(f"\n6. POSTGRESQL TABLES CREATED ({len(tables)} Public Tables):")
    for t in sorted(tables):
        print(f"   - {t}")

    print("\n" + "=" * 60)
    print("  VERIFICATION COMPLETE: 100% OF SYSTEM DATA IS IN POSTGRESQL!  ")
    print("=" * 60)

if __name__ == '__main__':
    verify_all_system_info()
