from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, OTPRequestView, OTPVerifyView, UserProfileView, AdminUserListView, AdminUserRoleUpdateView, ResetPasswordsView, CustomLoginView, SessionLoginView, DirectFormLoginView, BypassLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomLoginView.as_view(), name='auth_login'),
    path('bypass_login/', BypassLoginView.as_view(), name='auth_bypass_login'),
    path('authenticate/', CustomLoginView.as_view(), name='auth_authenticate'),
    path('user_login/', CustomLoginView.as_view(), name='auth_user_login'),
    path('session_login/', SessionLoginView.as_view(), name='auth_session_login'),
    path('form_login/', DirectFormLoginView.as_view(), name='auth_form_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('otp/request/', OTPRequestView.as_view(), name='otp_request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp_verify'),
    path('me/', UserProfileView.as_view(), name='auth_me'),
    path('users/', AdminUserListView.as_view(), name='admin_users_list'),
    path('users/<int:pk>/role/', AdminUserRoleUpdateView.as_view(), name='admin_user_role_update'),
    path('reset-sync/', ResetPasswordsView.as_view(), name='reset_sync'),
]
