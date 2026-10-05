"""
Django email backend that sends through Mailgun's HTTP API instead of SMTP.

Why: many networks, firewalls and antivirus "mail shields" block or hang SMTP
(ports 25/465/587/2525). The HTTP API uses normal HTTPS (port 443), which is
almost never blocked.

Turned on automatically when MAILGUN_API_KEY is set in .env (see settings.py).
Everything that calls Django's send_mail() keeps working unchanged.
"""

from email.mime.base import MIMEBase

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class MailgunBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        sent = 0
        for message in email_messages:
            try:
                self._send(message)
                sent += 1
            except Exception:
                if not self.fail_silently:
                    raise
        return sent

    def _send(self, message) -> None:
        if not message.recipients():
            return
        data = {
            "from": message.from_email or settings.DEFAULT_FROM_EMAIL,
            "to": message.to,
            "subject": message.subject,
            "text": message.body,
        }
        if message.cc:
            data["cc"] = message.cc
        if message.bcc:
            data["bcc"] = message.bcc
        if message.reply_to:
            data["h:Reply-To"] = ", ".join(message.reply_to)
        for content, mimetype in getattr(message, "alternatives", []):
            if mimetype == "text/html":
                data["html"] = content

        url = f"{settings.MAILGUN_API_URL.rstrip('/')}/v3/{settings.MAILGUN_DOMAIN}/messages"
        response = requests.post(
            url,
            auth=("api", settings.MAILGUN_API_KEY),
            data=data,
            files=self._files(message) or None,
            timeout=settings.EMAIL_TIMEOUT,
        )
        if response.status_code >= 400:
            # e.g. 401 wrong API key, 404 wrong domain/region, 403 sandbox recipient not authorised
            raise RuntimeError(f"Mailgun API error {response.status_code}: {response.text[:300]}")

    @staticmethod
    def _files(message):
        """Attachments for Mailgun. Images with a Content-ID go as "inline" (shown inside the HTML via cid:)."""
        files = []
        for item in message.attachments:
            if isinstance(item, MIMEBase):
                cid = (item.get("Content-ID") or "").strip("<>")
                name = cid or item.get_filename() or "attachment"
                files.append(("inline" if cid else "attachment", (name, item.get_payload(decode=True), item.get_content_type())))
            else:
                filename, content, mimetype = item
                if isinstance(content, str):
                    content = content.encode()
                files.append(("attachment", (filename, content, mimetype or "application/octet-stream")))
        return files
