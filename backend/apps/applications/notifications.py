from django.core.mail import send_mail
from django.conf import settings

def send_application_status_email(application):
    """
    Sends an email to the applicant whenever their application status changes
    to APPROVED, REJECTED, or PAID.
    """
    applicant = application.applicant
    email = applicant.email

    if not email:
        print(f"Warning: No email found for user {applicant.username}. Cannot send notification.")
        return

    subject = ""
    message = ""

    if application.status == 'APPROVED':
        subject = f"Update: Your Bursary Application has been Approved! ({application.reference_number})"
        message = (
            f"Dear {applicant.first_name or applicant.username},\n\n"
            f"Great news! Your bursary application ({application.reference_number}) for {application.institution_name} "
            f"has been APPROVED by the committee.\n\n"
            f"Awarded Amount: KSh {application.awarded_amount}\n\n"
            f"This application is now awaiting final processing by the Finance Office. "
            f"You will receive another notification once the funds have been disbursed to your institution.\n\n"
            f"Best regards,\n"
            f"Smart NG-CDF Committee"
        )
    elif application.status == 'REJECTED':
        subject = f"Update: Your Bursary Application ({application.reference_number})"
        message = (
            f"Dear {applicant.first_name or applicant.username},\n\n"
            f"We regret to inform you that your bursary application ({application.reference_number}) "
            f"has been reviewed by the committee and was not successful at this time.\n\n"
            f"If you have any questions, please contact the NG-CDF office.\n\n"
            f"Best regards,\n"
            f"Smart NG-CDF Committee"
        )
    elif application.status == 'PAID':
        subject = f"Success: Your Bursary has been Disbursed! ({application.reference_number})"
        message = (
            f"Dear {applicant.first_name or applicant.username},\n\n"
            f"Your bursary application ({application.reference_number}) has been fully processed and PAID.\n\n"
            f"An amount of KSh {application.awarded_amount} has been disbursed directly to {application.institution_name} "
            f"for your tuition.\n\n"
            f"Best regards,\n"
            f"Smart NG-CDF Finance Team"
        )
    else:
        # Don't send emails for DRAFT or VERIFICATION states right now
        return

    send_mail(
        subject,
        message,
        'noreply@ngcdf-bursary.go.ke',
        [email],
        fail_silently=True,
    )
