from django.urls import path
from . import views
from django.urls import include
urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # Protected routes (require login)
    path('index/', views.index, name='index'),
    path('organizations/', views.organizations_page, name='organizations_page'),
    path('org_overview/<uuid:org_id>/', views.org_overview, name='org_overview'),
    path('organization/', views.organization_page, name='organization'),

    path('profile/', views.profile, name='profile'),

    path('members/', views.members_management, name='members_management'),
    path('event/', include('event.urls')),
    path('organization/', include('organization.urls')),
    # Join organization
    path('join_org/<uuid:org_id>/', views.join_org, name='join_org'),
    
    # Notifications
    path('notifications/', views.notifications_view, name='notifications'),
]
