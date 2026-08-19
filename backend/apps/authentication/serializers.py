from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'national_id', 'role', 'password', 'first_name', 'last_name', 'is_active', 'date_joined')

    def create(self, validated_data):
        phone = validated_data.get('phone_number')
        if phone == '':
            phone = None

        nat_id = validated_data.get('national_id')
        if nat_id == '':
            nat_id = None

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '') or '',
            phone_number=phone,
            national_id=nat_id,
            role=validated_data.get('role', 'APPLICANT'),
            password=validated_data.get('password', 'Pass123!'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number')


from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        username_or_id = (attrs.get('username') or '').strip()
        password = (attrs.get('password') or '').strip()

        if not username_or_id or not password:
            raise serializers.ValidationError({'detail': 'Please provide both National ID/username and password.'})

        # Query real database user by username, national_id, email, or phone_number
        user = User.objects.filter(
            Q(username__iexact=username_or_id) |
            Q(national_id__iexact=username_or_id) |
            Q(email__iexact=username_or_id) |
            Q(phone_number__iexact=username_or_id)
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid National ID/username or password.'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'This account has been deactivated.'})

        refresh = RefreshToken.for_user(user)
        user_data = {
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'email': user.email or '',
            'phone_number': user.phone_number or '',
            'national_id': user.national_id or ''
        }

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'role': user.role,
            'status': 'SUCCESS',
            'user_data': user_data
        }
