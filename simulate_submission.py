import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
django.setup()

from django.contrib.auth import get_user_model
from apps.applications.models import Application
from apps.applications.engine import VerificationEngine

User = get_user_model()

def run_simulation():
    print("--- Starting Bursary Application Verification Simulation ---")
    
    # 1. Create a mock applicant user
    user, created = User.objects.get_or_create(
        username='john_doe_mock',
        defaults={
            'email': 'john@mock.com',
            'role': 'APPLICANT'
        }
    )
    if created:
        user.set_password('password123')
        user.save()
        print(f"Created mock user: {user.username}")

    # 2. Create a mock application simulating form payload
    # Clean up previous ones if any
    Application.objects.filter(applicant=user).delete()
    
    application = Application.objects.create(
        applicant=user,
        institution_name='University of Nairobi',
        admission_number='C01/001/2023',
        course='BSc Computer Science',
        year_of_study='Year 3',
        amount_applied=30000,
        fee_balance=45000, # Financial Need score: 20
        vulnerability_status='Total Orphan', # Vulnerability score: 40
        income_category='Less than 10,000', # Income score: 30
        status='SUBMITTED' # Trigger engine
    )
    
    print(f"\nSaved Application to DB:")
    print(f"- ID: {application.reference_number}")
    print(f"- Status: {application.status}")
    print(f"- Fee Balance: KSh {application.fee_balance}")
    print(f"- Vulnerability: {application.vulnerability_status}")
    print(f"- Income Category: {application.income_category}")
    
    # Expected Score = 40 (Orphan) + 30 (Income) + 20 (Fee) = 90
    
    # 3. Process via Engine
    print("\nTriggering Verification & Eligibility Engine...")
    processed_app = VerificationEngine.process_application(application.id)
    
    if processed_app:
        print("\n--- Verification Results ---")
        print(f"- Eligibility Score: {processed_app.eligibility_score} / 100")
        print(f"- Mock OCR Status: VERIFIED")
        print(f"- Fraud Check Status: {processed_app.fraud_score}")
        print(f"- Final Decision Status: {processed_app.status}")
    else:
        print("Error processing application.")

if __name__ == '__main__':
    run_simulation()
