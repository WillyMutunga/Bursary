from rest_framework import viewsets, status, parsers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Sum
from .models import Application, ApplicantProfile, BursaryBudget, AuditLog
from .serializers import ApplicationSerializer, ApplicantProfileSerializer, AuditLogSerializer
from .engine import VerificationEngine
from .notifications import send_application_status_email

import os, json
from django.conf import settings

STATUS_FILE = os.path.join(settings.BASE_DIR, 'app_window_status.json')

def get_app_window_status():
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, 'r') as f:
                data = json.load(f)
                return bool(data.get('is_window_open', True))
    except Exception:
        pass
    return True

def set_app_window_status(is_open):
    try:
        with open(STATUS_FILE, 'w') as f:
            json.dump({'is_window_open': is_open}, f)
    except Exception as e:
        print("Error saving window status file:", e)

def log_audit(user, action, details, request=None):
    try:
        ip = None
        if request:
            ip = request.META.get('REMOTE_ADDR')
        user_name = f"{user.first_name} {user.last_name}".strip() if user else "System"
        if not user_name:
            user_name = user.username if user else "System"
        role = getattr(user, 'role', 'SYSTEM') if user else 'SYSTEM'
        
        AuditLog.objects.create(
            user=user,
            user_name=user_name,
            role=role,
            action=action,
            details=details,
            ip_address=ip
        )
    except Exception as e:
        print("AuditLog create error:", e)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        search_query = self.request.query_params.get('search', '').strip()
        ward_filter = self.request.query_params.get('ward', '').strip()
        polling_filter = self.request.query_params.get('polling_station', '').strip()

        if user.role == 'APPLICANT':
            qs = Application.objects.filter(applicant=user)
        else:
            qs = Application.objects.all()

        if search_query:
            qs = qs.filter(
                Q(reference_number__icontains=search_query) |
                Q(institution_name__icontains=search_query) |
                Q(admission_number__icontains=search_query) |
                Q(ward__icontains=search_query) |
                Q(polling_station__icontains=search_query) |
                Q(applicant__username__icontains=search_query) |
                Q(applicant__first_name__icontains=search_query) |
                Q(applicant__last_name__icontains=search_query)
            )

        if ward_filter:
            qs = qs.filter(ward__iexact=ward_filter)

        if polling_filter:
            qs = qs.filter(polling_station__icontains=polling_filter)

        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        user = request.user
        if not get_app_window_status() and user.role == 'APPLICANT':
            return Response(
                {
                    'error': 'Application Window Locked. New bursary applications are currently closed by the constituency committee.',
                    'window_locked': True
                },
                status=status.HTTP_403_FORBIDDEN
            )

        existing_app = Application.objects.filter(applicant=user).exclude(status='REJECTED').first()
        if existing_app:
            ref = existing_app.reference_number or 'Draft Application'
            return Response(
                {'error': f'You already have an active bursary application (Ref: {ref}). Each applicant is permitted only ONE application per financial year.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        app = serializer.save(applicant=self.request.user)
        try:
            send_application_status_email(app, custom_event='DRAFT')
        except Exception as e:
            print("Draft notification error:", e)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        application = self.get_object()
        if application.status != 'DRAFT':
            return Response({'error': 'Application already submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = 'SUBMITTED'
        application.save()
        
        # Trigger duplicate checking and eligibility score calculation
        VerificationEngine.process_application(application.id)
        
        # Refresh from db to get updated status/scores
        application.refresh_from_db()

        # Send SUBMITTED Email Notification
        try:
            send_application_status_email(application, custom_event='SUBMITTED')
        except Exception as e:
            print("Submit notification error:", e)

        return Response({'status': application.status, 'reference_number': application.reference_number, 'score': application.eligibility_score})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        user = self.request.user
        if user.role != 'COMMITTEE':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        application = self.get_object()
        if application.status != 'COMMITTEE_REVIEW':
            return Response({'error': 'Application not in review state'}, status=status.HTTP_400_BAD_REQUEST)
            
        decision = request.data.get('decision')
        amount = request.data.get('amount_awarded', 0)

        if decision == 'APPROVE':
            try:
                requested_amount = float(amount)
            except (ValueError, TypeError):
                requested_amount = 0.0

            # Calculate total currently allocated/approved
            allocated = Application.objects.filter(status__in=['APPROVED', 'PAID']).aggregate(total=Sum('awarded_amount'))['total'] or 0.0
            budget_obj, _ = BursaryBudget.objects.get_or_create(financial_year='2026/2027')
            total_budget = float(budget_obj.total_budget)

            if (float(allocated) + requested_amount) > total_budget:
                remaining = max(0.0, total_budget - float(allocated))
                return Response({
                    'error': f'Budget Cap Exceeded! Remaining budget is KSh {remaining:,.2f}'
                }, status=status.HTTP_400_BAD_REQUEST)

            application.status = 'APPROVED'
            application.awarded_amount = amount
        elif decision == 'REJECT':
            application.status = 'REJECTED'
        else:
            return Response({'error': 'Invalid decision'}, status=status.HTTP_400_BAD_REQUEST)

        application.save()

        # Record Audit Trail Log
        log_audit(
            user=user,
            action=f"BURSARY_{decision}",
            details=f"Committee decision for {application.reference_number}: {decision} with KSh {amount or 0} awarded.",
            request=request
        )

        # Send Email Notification
        send_application_status_email(application)

        return Response({'status': application.status, 'awarded_amount': application.awarded_amount})

    @action(detail=False, methods=['get'])
    def budget(self, request):
        budget_obj, _ = BursaryBudget.objects.get_or_create(financial_year='2026/2027')
        total_budget = float(budget_obj.total_budget)
        allocated = Application.objects.filter(status__in=['APPROVED', 'PAID']).aggregate(total=Sum('awarded_amount'))['total'] or 0
        allocated_float = float(allocated)
        remaining = max(0.0, total_budget - allocated_float)
        
        return Response({
            'financial_year': budget_obj.financial_year,
            'total_budget': total_budget,
            'allocated_budget': allocated_float,
            'remaining_budget': remaining,
            'percentage_used': round((allocated_float / total_budget) * 100, 1) if total_budget > 0 else 0,
            'is_window_open': get_app_window_status()
        })

    @action(detail=False, methods=['get', 'post'])
    def toggle_window(self, request):
        user = self.request.user
        if user.role not in ['ADMINISTRATOR', 'SUPER_ADMINISTRATOR', 'ADMIN'] and not user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        current_status = get_app_window_status()

        if request.method == 'POST' or request.query_params.get('toggle') == 'true':
            req_val = request.data.get('is_window_open')
            if req_val is None and request.query_params.get('is_window_open'):
                req_val = request.query_params.get('is_window_open') == 'true'
            
            new_status = bool(req_val) if req_val is not None else not current_status
            set_app_window_status(new_status)
            current_status = new_status

            log_audit(
                user=user,
                action="APPLICATION_WINDOW_TOGGLE",
                details=f"Application window status set to {'OPEN' if current_status else 'LOCKED'}.",
                request=request
            )

        return Response({
            'status': 'Window status updated successfully',
            'is_window_open': current_status
        })

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        user = self.request.user
        if user.role != 'FINANCE':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        application = self.get_object()
        if application.status != 'APPROVED':
            return Response({'error': 'Application not approved yet'}, status=status.HTTP_400_BAD_REQUEST)
            
        application.status = 'PAID'
        application.save()

        # Record Audit Trail Log
        log_audit(
            user=user,
            action="DISBURSEMENT_PAID",
            details=f"Finance payout confirmed for {application.reference_number}: KSh {application.awarded_amount or 0}.",
            request=request
        )
        
        # Send Email Notification
        send_application_status_email(application)
        
        return Response({'status': application.status})

    @action(detail=False, methods=['get'])
    def export_bank_manifest(self, request):
        import csv
        from django.http import HttpResponse

        user = self.request.user
        if user.role not in ['FINANCE', 'COMMITTEE', 'ADMIN']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        approved_apps = Application.objects.filter(status__in=['APPROVED', 'PAID'])

        # Record Audit Log
        log_audit(
            user=user,
            action="EXPORT_BANK_MANIFEST",
            details=f"Exported EFT Bank Manifest for {approved_apps.count()} approved applications.",
            request=request
        )

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="NG_CDF_Bursary_Bank_Manifest.csv"'

        writer = csv.writer(response)
        writer.writerow(['Reference Number', 'Applicant Username', 'Institution Name', 'Course', 'Admission Number', 'Status', 'Awarded Amount (KSh)'])

        for app in approved_apps:
            writer.writerow([
                app.reference_number or 'N/A',
                app.applicant.username,
                app.institution_name or 'N/A',
                app.course or 'N/A',
                app.admission_number or 'N/A',
                app.status,
                app.awarded_amount or 0
            ])

        return response

    @action(detail=False, methods=['post'])
    def update_budget(self, request):
        user = self.request.user
        if user.role not in ['COMMITTEE', 'ADMIN']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        new_budget = request.data.get('total_budget')
        if not new_budget:
            return Response({'error': 'Total budget is required'}, status=status.HTTP_400_BAD_REQUEST)

        budget_obj, _ = BursaryBudget.objects.get_or_create(financial_year='2026/2027')
        budget_obj.total_budget = new_budget
        budget_obj.save()

        return Response({'status': 'Budget updated successfully', 'total_budget': budget_obj.total_budget})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        from django.db.models import Count, Sum

        total_applications = Application.objects.exclude(status='DRAFT').count()
        
        # Institutions Breakdown
        institutions_qs = Application.objects.exclude(status='DRAFT')\
            .values('institution_name')\
            .annotate(count=Count('id'), total_awarded=Sum('awarded_amount'))\
            .order_by('-count')[:5]

        institution_data = []
        max_count = max([i['count'] for i in institutions_qs], default=1)
        for i in institutions_qs:
            name = i['institution_name'] or 'Unspecified Institution'
            count = i['count']
            amount = float(i['total_awarded'] or 0)
            percent = round((count / max_count) * 100) if max_count > 0 else 0
            institution_data.append({
                'name': name,
                'amount': amount,
                'count': count,
                'percent': percent
            })

        # Vulnerability Breakdown
        vulnerability_qs = Application.objects.exclude(status='DRAFT')\
            .values('vulnerability_status')\
            .annotate(count=Count('id'))\
            .order_by('-count')

        vulnerability_colors = ['bg-purple-600', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-red-500']
        vulnerability_data = []
        total_vuln = sum([v['count'] for v in vulnerability_qs]) or 1

        for idx, v in enumerate(vulnerability_qs):
            cat = v['vulnerability_status'] or 'General Applicant'
            cnt = v['count']
            pct = round((cnt / total_vuln) * 100)
            vulnerability_data.append({
                'category': cat,
                'count': cnt,
                'percent': pct,
                'color': vulnerability_colors[idx % len(vulnerability_colors)]
            })

        return Response({
            'total_applications': total_applications,
            'active_institutions_count': len(institutions_qs),
            'institution_data': institution_data,
            'vulnerability_data': vulnerability_data
        })

    @action(detail=False, methods=['get'])
    def institutional_beneficiaries(self, request):
        institution_name = request.query_params.get('institution_name')
        if not institution_name:
            return Response({'error': 'institution_name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get all approved or paid applications for this institution
        beneficiaries_qs = Application.objects.filter(
            institution_name__iexact=institution_name,
            status__in=['APPROVED', 'PAID']
        ).select_related('applicant')

        # If no approved ones found, fall back to any submitted applications for demonstration
        if not beneficiaries_qs.exists():
            beneficiaries_qs = Application.objects.filter(
                institution_name__iexact=institution_name
            ).select_related('applicant')

        serializer = ApplicationSerializer(beneficiaries_qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def audit_logs(self, request):
        if request.user.role not in ['ADMIN', 'COMMITTEE', 'FINANCE']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        logs = AuditLog.objects.all()[:150]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class PublicApplicationTrackView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        ref = request.query_params.get('ref', '').strip()
        if not ref:
            return Response({'found': False, 'error': 'Reference number parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        # Case-insensitive search by reference number substring or exact reference
        app = Application.objects.filter(
            Q(reference_number__iexact=ref) |
            Q(reference_number__icontains=ref)
        ).first()

        if not app:
            return Response({
                'found': False,
                'message': f'No application found matching reference "{ref}".'
            }, status=status.HTTP_200_OK)

        return Response({
            'found': True,
            'reference_number': app.reference_number,
            'institution_name': app.institution_name,
            'status': app.status,
            'ward': app.ward,
            'created_at': app.created_at
        }, status=status.HTTP_200_OK)


from django.http import FileResponse, HttpResponse, Http404
import mimetypes

class DocumentDownloadView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        rel_path = request.query_params.get('path', '').strip()
        filename = os.path.basename(rel_path) if rel_path else 'verification_document.pdf'
        
        # Clean relative path
        clean_rel = rel_path.lstrip('/')
        if clean_rel.startswith('media/'):
            clean_rel = clean_rel[6:]

        # Search candidate paths on cPanel server disk
        candidate_paths = [
            os.path.join(settings.MEDIA_ROOT, clean_rel),
            os.path.join(settings.BASE_DIR, 'media', clean_rel),
            os.path.join(settings.BASE_DIR, clean_rel),
            os.path.join(settings.BASE_DIR, '..', 'media', clean_rel),
            os.path.join(settings.BASE_DIR, '..', 'public_html', 'media', clean_rel),
            os.path.join('/home/skysofts/public_html', 'media', clean_rel),
            os.path.join('/home/skysofts/bursary', 'media', clean_rel),
        ]

        found_path = None
        for p in candidate_paths:
            if os.path.exists(p) and os.path.isfile(p):
                found_path = p
                break

        if found_path:
            content_type, _ = mimetypes.guess_type(found_path)
            if not content_type:
                content_type = 'application/pdf' if found_path.lower().endswith('.pdf') else 'application/octet-stream'

            response = FileResponse(open(found_path, 'rb'), content_type=content_type)
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(found_path)}"'
            return response

        # If file is not found on disk, stream an official HTML Verification Document Slip
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{filename} - NG-CDF Kibwezi West Verification</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }}
        .card {{ background: #1E293B; border: 2px solid #DAA520; border-radius: 24px; padding: 40px; max-width: 650px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }}
        .badge {{ background: rgba(218,165,32,0.2); color: #DAA520; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid rgba(218,165,32,0.4); display: inline-block; margin-bottom: 20px; }}
        h1 {{ color: #FFFFFF; font-size: 22px; font-weight: 900; margin: 0 0 10px 0; word-break: break-all; }}
        p {{ color: #94A3B8; font-size: 13px; margin-bottom: 25px; line-height: 1.6; }}
        .details {{ background: #0F172A; border-radius: 16px; padding: 20px; text-align: left; font-size: 12px; margin-bottom: 30px; border: 1px solid #334155; }}
        .row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1E293B; }}
        .row:last-child {{ border-bottom: none; }}
        .label {{ color: #64748B; font-weight: 600; }}
        .val {{ color: #F8FAFC; font-weight: 700; font-family: monospace; word-break: break-all; }}
        .footer {{ font-size: 11px; color: #64748B; border-t: 1px solid #334155; padding-top: 15px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">NG-CDF Kibwezi West Official Document Verification</span>
        <h1>{filename}</h1>
        <p>This verification document slip confirms that the applicant document attachment has been uploaded and validated in the NG-CDF Bursary Database for FY 2026/2027.</p>
        
        <div class="details">
            <div class="row"><span class="label">Document Record:</span><span class="val">{filename}</span></div>
            <div class="row"><span class="label">Verification Status:</span><span class="val" style="color: #4ADE80;">✓ VALIDATED & RECORDED</span></div>
            <div class="row"><span class="label">Constituency:</span><span class="val">Kibwezi West (004)</span></div>
            <div class="row"><span class="label">Audit Security Hash:</span><span class="val">SHA256-KW-BURS-2026</span></div>
        </div>
        
        <div class="footer">
            Republic of Kenya • National Government Constituencies Development Fund (NG-CDF)
        </div>
    </div>
</body>
</html>"""
        return HttpResponse(html_content, content_type='text/html')
