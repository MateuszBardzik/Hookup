# Support emails are HTML only now: the "format" choice (simple formatting / HTML) is removed.
# Emails written with simple formatting are turned into basic HTML first (paragraphs and line breaks),
# so their preview still reads well.

import html

from django.db import migrations, models


def to_html(apps, schema_editor):
    SupportEmail = apps.get_model("mailing", "SupportEmail")
    for email in SupportEmail.objects.exclude(format="html"):
        paragraphs = [p.strip() for p in email.message.replace("\r\n", "\n").split("\n\n") if p.strip()]
        email.message = "\n\n".join(
            '<p style="margin:0 0 14px">' + html.escape(p).replace("\n", "<br>\n") + "</p>" for p in paragraphs
        )
        email.save(update_fields=["message"])


class Migration(migrations.Migration):
    dependencies = [
        ("mailing", "0002_supportemail_format_alter_supportemail_message"),
    ]

    operations = [
        migrations.RunPython(to_html, migrations.RunPython.noop),
        migrations.RemoveField(model_name="supportemail", name="format"),
        migrations.AlterField(
            model_name="supportemail",
            name="message",
            field=models.TextField(
                help_text="HTML, with inline styles. {name} is replaced by the person's first name. See the help above."
            ),
        ),
    ]
