from django.http import JsonResponse

def list_farmers(request):
    return JsonResponse({"message": "Farmers API working"})

