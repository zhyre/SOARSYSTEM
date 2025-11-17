from django.apps import AppConfig


class OrganizationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'SOAR.organization'
    app_label = 'organization'

    def ready(self):
        from . import signals