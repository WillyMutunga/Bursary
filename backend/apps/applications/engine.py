from apps.applications.models import Application
from apps.documents.models import Document
import logging

logger = logging.getLogger(__name__)

class VerificationEngine:
    @staticmethod
    def process_application(application_id):
        """
        Main entry point for processing an application.
        Runs mock verification, calculates eligibility, and updates status.
        """
        try:
            application = Application.objects.get(id=application_id)
            
            # 1. Verification (Mock OCR / Identity Check)
            VerificationEngine._verify_documents(application)
            VerificationEngine._run_fraud_check(application)
            
            # 2. Eligibility Scoring
            score = VerificationEngine._calculate_eligibility_score(application)
            application.eligibility_score = score
            
            # 3. Decision
            if application.fraud_score == 'LOW_RISK' and score >= 30:
                application.status = 'COMMITTEE_REVIEW'
            elif application.fraud_score == 'HIGH_RISK':
                application.status = 'FLAGGED'
            else:
                application.status = 'VERIFICATION' # Requires manual verification
                
            application.save()
            logger.info(f"Processed application {application.reference_number}. Score: {score}")
            return application
            
        except Application.DoesNotExist:
            logger.error(f"Application {application_id} not found.")
            return None

    @staticmethod
    def _verify_documents(application):
        # Mock OCR logic
        documents = application.documents.all()
        for doc in documents:
            doc.ocr_status = 'VERIFIED'
            doc.verification_status = 'APPROVED'
            doc.ocr_extracted_text = "MOCK_TEXT_EXTRACTION_SUCCESS"
            doc.save()

    @staticmethod
    def _run_fraud_check(application):
        # 1. Check for Duplicate Admission Number or Applicant Submissions
        if application.admission_number and application.admission_number != 'N/A':
            duplicates = Application.objects.filter(
                admission_number__iexact=application.admission_number,
                status__in=['SUBMITTED', 'COMMITTEE_REVIEW', 'APPROVED', 'PAID']
            ).exclude(id=application.id)

            if duplicates.exists():
                application.fraud_score = 'HIGH_RISK'
                application.vulnerability_status = f"{application.vulnerability_status or ''} [FLAGGED: Duplicate Admission No {application.admission_number}]".strip()
                return

        # 2. Check for Fee Balance & Amount Applied Anomalies
        fee_bal = float(application.fee_balance or 0)
        amt_app = float(application.amount_applied or 0)

        if amt_app > fee_bal and fee_bal > 0:
            application.fraud_score = 'MEDIUM_RISK'
            application.vulnerability_status = f"{application.vulnerability_status or ''} [WARNING: Amount applied (KSh {amt_app}) exceeds fee balance (KSh {fee_bal})]".strip()
        elif fee_bal <= 0:
            application.fraud_score = 'MEDIUM_RISK'
        else:
            application.fraud_score = 'LOW_RISK'

    @staticmethod
    def _calculate_eligibility_score(application):
        score = 0
        
        # 1. Vulnerability Weight (Max 40)
        vuln = application.vulnerability_status
        if vuln == 'Total Orphan':
            score += 40
        elif vuln == 'Partial Orphan':
            score += 25
        elif vuln == 'Single Parent':
            score += 20
        elif vuln == 'Living with Disability':
            score += 30
        
        # 2. Income Category (Max 30)
        income = application.income_category
        if income == 'Less than 10,000':
            score += 30
        elif income == '10,000 - 30,000':
            score += 20
        elif income == '30,001 - 50,000':
            score += 10
            
        # 3. Financial Need (Max 30)
        if application.fee_balance:
            if application.fee_balance >= 50000:
                score += 30
            elif application.fee_balance >= 20000:
                score += 20
            elif application.fee_balance >= 10000:
                score += 10
                
        # Ensure max 100
        return min(score, 100)
