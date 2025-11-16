from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_add_last_login_column"),
    ]

    operations = [
        # 1) Rename mis-capitalized column "Last_name" -> "last_name"
        migrations.RunSQL(
            sql=(
                "DO $$\n"
                "BEGIN\n"
                "    IF EXISTS (\n"
                "        SELECT 1 FROM information_schema.columns\n"
                "        WHERE table_schema = 'public'\n"
                "          AND table_name = 'accounts_user'\n"
                "          AND column_name = 'Last_name'\n"
                "    ) THEN\n"
                "        ALTER TABLE public.accounts_user RENAME COLUMN \"Last_name\" TO last_name;\n"
                "    END IF;\n"
                "END$$;\n"
            ),
            reverse_sql=(
                "DO $$\n"
                "BEGIN\n"
                "    IF EXISTS (\n"
                "        SELECT 1 FROM information_schema.columns\n"
                "        WHERE table_schema = 'public'\n"
                "          AND table_name = 'accounts_user'\n"
                "          AND column_name = 'last_name'\n"
                "    ) THEN\n"
                "        ALTER TABLE public.accounts_user RENAME COLUMN last_name TO \"Last_name\";\n"
                "    END IF;\n"
                "END$$;\n"
            ),
        ),
        # 2) Ensure date_joined is timestamptz (timezone-aware) to match Django expectations
        migrations.RunSQL(
            sql=(
                "ALTER TABLE public.accounts_user\n"
                "ALTER COLUMN date_joined TYPE timestamp with time zone\n"
                "USING (date_joined AT TIME ZONE 'UTC');\n"
            ),
            reverse_sql=(
                "ALTER TABLE public.accounts_user\n"
                "ALTER COLUMN date_joined TYPE timestamp without time zone\n"
                "USING (date_joined AT TIME ZONE 'UTC');\n"
            ),
        ),
    ]
