from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'national_id', 'role', 'password', 'first_name', 'last_name', 'is_active', 'date_joined')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            phone_number=validated_data.get('phone_number', ''),
            national_id=validated_data.get('national_id', ''),
            role=validated_data.get('role', 'APPLICANT'),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number')


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_id = attrs.get('username')
        password = attrs.get('password')

        if username_or_id and password:
            user = User.objects.filter(
                Q(username__iexact=username_or_id) |
                Q(national_id__iexact=username_or_id) |
                Q(phone_number__iexact=username_or_id) |
                Q(email__iexact=username_or_id)
            ).first()

            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError({'detail': 'User account is disabled.'})
                refresh = self.get_token(user)
                return {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'username': user.username,
                    'role': user.role
                }

        raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})
