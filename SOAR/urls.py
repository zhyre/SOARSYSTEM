"""
URL configuration for SOAR project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from SOAR.accounts.views import landing_page
from .views import terms_and_policy, privacy_policy

urlpatterns = [
    path('admin/', admin.site.urls),
    path("admin-panel/", include("SOAR.AdminSoar.urls")),
    path("accounts/", include("SOAR.accounts.urls")),
    path("organization/", include("SOAR.organization.urls")),
    path("event/", include("SOAR.event.urls")),
    path("notifications/", include("SOAR.notification.urls")),
    path("terms-and-policy/", terms_and_policy, name='terms_and_policy'),
    path("privacy-policy/", privacy_policy, name='privacy_policy'),
    path("", landing_page, name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)