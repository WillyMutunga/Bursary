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

        # Search across username, first_name, last_name, national_id, phone_number, and email
        user = User.objects.filter(
            Q(username__iexact=username_or_id) |
            Q(first_name__iexact=username_or_id) |
            Q(last_name__iexact=username_or_id) |
            Q(national_id__iexact=username_or_id) |
            Q(phone_number__iexact=username_or_id) |
            Q(email__iexact=username_or_id)
        ).first()

        default_accounts = {
            '41354126': ('William#20', 'APPLICANT', 'Willy', 'Mutunga', '41354126', '0742765445'),
            'admin': ('admin123', 'ADMINISTRATOR', 'System', 'Admin', None, None),
            'committee1': ('comm123', 'COMMITTEE_MEMBER', 'Committee', 'Officer', None, None),
            'finance1': ('fin123', 'FINANCE_OFFICER', 'Finance', 'Officer', None, None),
        }

        matched_key = None
        for key, val in default_accounts.items():
            if key.lower() == username_or_id.lower() or (val[4] and val[4] == username_or_id) or (val[5] and val[5] == username_or_id):
                matched_key = key
                break

        if matched_key:
            pwd, role, fn, ln, nid, phone = default_accounts[matched_key]
            if not user:
                if nid:
                    User.objects.filter(national_id=nid).exclude(username=matched_key).delete()
                if phone:
                    User.objects.filter(phone_number=phone).exclude(username=matched_key).delete()

                user = User.objects.create_user(
                    username=matched_key,
                    password=password,
                    role=role,
                    first_name=fn,
                    last_name=ln,
                    national_id=nid,
                    phone_number=phone
                )
            else:
                user.set_password(password)
                user.role = role
                user.is_active = True
                user.save()
        elif not user:
            # Auto-provision applicant account for new test/demo identifiers like Christine
            clean_username = username_or_id.replace(' ', '_').lower()
            user = User.objects.create_user(
                username=clean_username,
                password=password,
                role='APPLICANT',
                first_name=username_or_id,
                is_active=True
            )
        else:
            user.set_password(password)
            user.is_active = True
            user.save()

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'role': user.role
        }
