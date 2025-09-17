# users/utils.py
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['is_sacco_admin'] = user.is_sacco_admin  # <-- Add this
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
