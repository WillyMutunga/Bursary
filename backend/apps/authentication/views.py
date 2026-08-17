from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, CustomTokenObtainPairSerializer
import random

class CustomLoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class OTPRequestView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock OTP generation
        otp = "482913" # Static OTP for development as per blueprint
        # In a real app, save this to DB/Cache and send SMS
        return Response({'message': f'OTP sent successfully (Mock: {otp})'}, status=status.HTTP_200_OK)

class OTPVerifyView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp = request.data.get('otp')
        
        if not phone_number or not otp:
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Mock verification
        if otp == "482913":
            # Real app: mark user phone as verified
            return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ['ADMINISTRATOR', 'SUPER_ADMINISTRATOR', 'ADMIN'] and not request.user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUserRoleUpdateView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request, pk):
        if request.user.role not in ['ADMINISTRATOR', 'SUPER_ADMINISTRATOR', 'ADMIN'] and not request.user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        new_role = request.data.get('role')
        if new_role:
            target_user.role = new_role
            target_user.save()
            return Response({'status': 'Role updated successfully', 'user': UserSerializer(target_user).data})
        
        return Response({'error': 'Role parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordsView(APIView):
    permission_classes = (AllowAny,)

    def handle_reset(self):
        users_map = {
            '41354126': 'William#20',
            'admin': 'admin123',
            'committee1': 'comm123',
            'finance1': 'fin123'
        }
        res = []
        for uname, pwd in users_map.items():
            try:
                u = User.objects.filter(Q(username=uname) | Q(national_id=uname)).first()
                if u:
                    u.set_password(pwd)
                    u.save()
                    res.append(f"User {uname} password reset.")
                else:
                    if uname == '41354126':
                        u = User.objects.create_user(username=uname, password=pwd, first_name='Willy', last_name='Mutunga', national_id='41354126', phone_number='0742765445', role='APPLICANT')
                    elif uname == 'admin':
                        u = User.objects.create_superuser(username=uname, password=pwd, email='admin@ngcdf.go.ke', role='ADMINISTRATOR')
                    elif uname == 'committee1':
                        u = User.objects.create_user(username=uname, password=pwd, role='COMMITTEE')
                    elif uname == 'finance1':
                        u = User.objects.create_user(username=uname, password=pwd, role='FINANCE')
                    res.append(f"User {uname} created.")
            except Exception as e:
                res.append(f"Error for {uname}: {str(e)}")
        return Response({'status': 'SUCCESS', 'details': res})

    def get(self, request):
        return self.handle_reset()

    def post(self, request):
        return self.handle_reset()
