from rest_framework import permissions

class IsSaccoAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Simple example: staff users are sacco admins
        return request.user and request.user.is_authenticated and request.user.is_staff
