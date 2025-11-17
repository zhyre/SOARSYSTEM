from django.shortcuts import render

def terms_and_policy(request):
    return render(request, 'terms/termsandprivacy.html')

def privacy_policy(request):
    return render(request, 'privacy/privacypolicy.html')