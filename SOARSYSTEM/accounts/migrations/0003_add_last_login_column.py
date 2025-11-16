from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_alter_user_id"),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE public.accounts_user "
                "ADD COLUMN IF NOT EXISTS last_login timestamp with time zone NULL;"
            ),
            reverse_sql=(
                "ALTER TABLE public.accounts_user "
                "DROP COLUMN IF EXISTS last_login;"
            ),
        ),
    ]
