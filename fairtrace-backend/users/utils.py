# users/utils.py
from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    """
    Generate JWT tokens for a user with custom claims.
    Includes:
      - user_id
      - email
      - is_sacco_admin
      - is_transporter
      - transporter profile (if exists)
    """
    refresh = RefreshToken.for_user(user)

    # === Core Claims ===
    refresh['user_id'] = user.id
    refresh['email'] = user.email
    refresh['is_sacco_admin'] = user.is_sacco_admin
    refresh['is_transporter'] = user.is_transporter  # ← CRITICAL

    # === Transporter Profile (if exists) ===
    if hasattr(user, 'transporter_profile'):
        profile = user.transporter_profile
        refresh['transporter_id'] = profile.id
        refresh['vehicle'] = profile.vehicle
        refresh['license_plate'] = profile.license_plate
        refresh['phone'] = profile.phone

    # === Optional: Add full name ===
    refresh['full_name'] = user.get_full_name() or user.email

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }