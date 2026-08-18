from django.core.mail import send_mail
from django.conf import settings

def send_application_status_email(application, custom_event=None):
    """
    Sends email notifications to applicants for all application lifecycle stages:
    DRAFT, SUBMITTED, APPROVED, PAID, REJECTED.
    """
    applicant = application.applicant
    email = getattr(applicant, 'email', None)

    if not email:
        print(f"Warning: No email found for user {applicant.username}. Cannot send notification.")
        return

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'info@skysoftsystems.co.ke')
    status_type = custom_event or application.status
    user_name = f"{applicant.first_name} {applicant.last_name}".strip() or applicant.username
    ref_no = getattr(application, 'reference_number', '') or 'FY 2026/2027'

    subject = ""
    message = ""
    html_message = ""

    if status_type == 'DRAFT':
        subject = f"Action Required: Bursary Application Draft Created ({ref_no})"
        message = (
            f"Dear {user_name},\n\n"
            f"Your bursary application draft ({ref_no}) for FY 2026/2027 has been initialized.\n\n"
            f"Please note that your application is currently at DRAFT level and has NOT been submitted for committee review.\n"
            f"Kindly log in to the portal and complete all wizard steps (including document uploads) to submit your application before the window closes.\n\n"
            f"Portal Link: https://bursary.skysoftsystems.co.ke/login\n\n"
            f"Best regards,\n"
            f"NG-CDF Kibwezi West Bursary Committee"
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
          <div style="background-color: #0F6B38; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">NG-CDF Kibwezi West Bursary Portal</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #DAA520;">Financial Year 2026/2027</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #121820; margin-top: 0;">Bursary Application Draft Pending Submission</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Dear <strong>{user_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Your bursary application draft (Ref: <strong style="color: #0F6B38;">{ref_no}</strong>) for <strong>{application.institution_name or 'your institution'}</strong> has been created.
            </p>
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: bold;">
                ⚠️ Action Required: Your application is currently at DRAFT status.
              </p>
              <p style="margin: 4px 0 0 0; color: #b45309; font-size: 12px;">
                You must complete all steps and click "Confirm & Submit Application" to be considered by the review committee.
              </p>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://bursary.skysoftsystems.co.ke/login" style="background-color: #0F6B38; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Log In & Complete Application</a>
            </div>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
            Republic of Kenya • National Government Constituencies Development Fund (NG-CDF)
          </div>
        </div>
        """

    elif status_type == 'SUBMITTED' or status_type == 'COMMITTEE_REVIEW':
        subject = f"Application Confirmation: Bursary Submitted Successfully ({ref_no})"
        message = (
            f"Dear {user_name},\n\n"
            f"Congratulations! Your bursary application ({ref_no}) for {application.institution_name} "
            f"has been SUBMITTED successfully.\n\n"
            f"Requested Amount: KSh {application.requested_amount or 0}\n"
            f"Automated Eligibility Score: {application.eligibility_score or 0} / 100 pts\n\n"
            f"Your application is now undergoing official committee review and verification.\n\n"
            f"Best regards,\n"
            f"NG-CDF Kibwezi West Bursary Committee"
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
          <div style="background-color: #0F6B38; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">NG-CDF Kibwezi West Bursary Portal</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #DAA520;">Financial Year 2026/2027</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #0F6B38; margin-top: 0;">🎉 Application Submitted Successfully!</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Dear <strong>{user_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Your bursary application has been successfully submitted and received by the constituency bursary committee.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b;">Reference Number:</td>
                <td style="padding: 8px; font-weight: bold; color: #121820;">{ref_no}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b;">Institution:</td>
                <td style="padding: 8px; font-weight: bold; color: #121820;">{application.institution_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b;">Requested Amount:</td>
                <td style="padding: 8px; font-weight: bold; color: #0F6B38;">KSh {application.requested_amount or 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #64748b;">Eligibility Score:</td>
                <td style="padding: 8px; font-weight: bold; color: #121820;">{application.eligibility_score or 0} / 100 pts</td>
              </tr>
            </table>
            <p style="color: #475569; font-size: 13px;">
              You can track your application status anytime on your student dashboard.
            </p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
            Republic of Kenya • National Government Constituencies Development Fund (NG-CDF)
          </div>
        </div>
        """

    elif status_type == 'APPROVED':
        subject = f"Update: Bursary Application Approved! ({ref_no})"
        message = (
            f"Dear {user_name},\n\n"
            f"Great news! Your bursary application ({ref_no}) for {application.institution_name} "
            f"has been APPROVED by the NG-CDF Committee.\n\n"
            f"Awarded Amount: KSh {application.awarded_amount}\n\n"
            f"Your application has been forwarded to Finance for disbursement.\n\n"
            f"Best regards,\n"
            f"Smart NG-CDF Committee"
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
          <div style="background-color: #0F6B38; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">NG-CDF Kibwezi West Bursary Portal</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #DAA520;">Financial Year 2026/2027</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #0F6B38; margin-top: 0;">🎉 Bursary Application Approved!</h3>
            <p style="color: #475569; font-size: 14px;">Dear <strong>{user_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">
              Your application (Ref: <strong>{ref_no}</strong>) has been <strong>APPROVED</strong>.
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
              <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">OFFICIAL AWARDED AMOUNT</span>
              <span style="font-size: 24px; font-weight: 900; color: #0F6B38;">KSh {float(application.awarded_amount or 0):,.2f}</span>
            </div>
          </div>
        </div>
        """

    elif status_type == 'PAID':
        subject = f"Success: Bursary Disbursed to {application.institution_name} ({ref_no})"
        message = (
            f"Dear {user_name},\n\n"
            f"Your bursary application ({ref_no}) has been fully processed and PAID OUT.\n\n"
            f"Amount Disbursed: KSh {application.awarded_amount} to {application.institution_name}.\n\n"
            f"Best regards,\n"
            f"Smart NG-CDF Finance Office"
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
          <div style="background-color: #0F6B38; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">NG-CDF Kibwezi West Bursary Portal</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #DAA520;">Financial Year 2026/2027</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #0F6B38; margin-top: 0;">💰 Funds Disbursed Successfully!</h3>
            <p style="color: #475569; font-size: 14px;">Dear <strong>{user_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">
              An amount of <strong style="color: #0F6B38;">KSh {float(application.awarded_amount or 0):,.2f}</strong> has been disbursed to <strong>{application.institution_name}</strong> for application <strong>{ref_no}</strong>.
            </p>
          </div>
        </div>
        """

    elif status_type == 'REJECTED':
        subject = f"Update: Bursary Application Status ({ref_no})"
        message = (
            f"Dear {user_name},\n\n"
            f"Your bursary application ({ref_no}) has been reviewed by the committee.\n"
            f"Regrettably, your application was not successful for this financial year allocation cycle.\n\n"
            f"Best regards,\n"
            f"NG-CDF Committee"
        )
    else:
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[email],
            html_message=html_message if html_message else None,
            fail_silently=True,
        )
        print(f"Notification email sent to {email} for status {status_type}")
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")


def send_otp_email(user, otp_code):
    """
    Sends an email verification OTP code to the specified user.
    """
    email = getattr(user, 'email', None)
    if not email:
        return False

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'info@skysoftsystems.co.ke')
    user_name = f"{user.first_name} {user.last_name}".strip() or user.username
    subject = f"Your Verification OTP Code: {otp_code} - NG-CDF Bursary Portal"
    
    message = (
        f"Dear {user_name},\n\n"
        f"Your verification OTP code for account registration/login is: {otp_code}\n\n"
        f"Please enter this code to verify your account.\n\n"
        f"Best regards,\n"
        f"NG-CDF Kibwezi West Security Team"
    )

    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
      <div style="background-color: #0F6B38; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 18px;">NG-CDF Kibwezi West Bursary System</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #DAA520;">Account Verification OTP</p>
      </div>
      <div style="padding: 20px 0; text-align: center;">
        <p style="color: #475569; font-size: 14px; text-align: left;">Dear <strong>{user_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; text-align: left;">Use the 6-digit OTP verification code below to complete your registration or login verification:</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #0F6B38; padding: 16px; border-radius: 12px; margin: 20px 0; display: inline-block;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0F6B38;">{otp_code}</span>
        </div>
        
        <p style="color: #64748b; font-size: 12px; text-align: left; margin-top: 16px;">
          This code is valid for 10 minutes. Do not share this OTP with anyone.
        </p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Republic of Kenya • National Government Constituencies Development Fund
      </div>
    </div>
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=True
        )
        return True
    except Exception as e:
        print(f"Error sending OTP email to {email}:", e)
        return False
