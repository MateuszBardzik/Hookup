"""
Shared by all emails (sign-up verification in accounts/emails.py, support emails in mailing/sending.py).

    email_context()   values every email template needs: site name, public address, support address,
                      and the logo reference
    attach_logo(msg)  puts the logo inside the email (templates/emails/logo.png), so it shows in every
                      email app, also when the email was sent from a PC (localhost) or images are blocked

The layout with the logo is templates/emails/base.html. The address in the footer is the public site
(settings.PUBLIC_SITE_URL), never localhost; links that must open the site you're running (like the
verification link) use settings.FRONTEND_URL instead.
"""

from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings

LOGO_FILE = Path(settings.BASE_DIR) / "templates" / "emails" / "logo.png"
LOGO_CID = "logo.png"  # the HTML refers to it as  src="cid:logo.png"


def email_context() -> dict:
    return {
        "site_name": settings.SITE_NAME,
        "site_url": settings.PUBLIC_SITE_URL.rstrip("/"),
        "logo_url": f"cid:{LOGO_CID}",
        "support_email": settings.SUPPORT_EMAIL,
    }


def attach_logo(message) -> None:
    """Embed the logo in an EmailMultiAlternatives message (call after attaching the HTML)."""
    image = MIMEImage(LOGO_FILE.read_bytes(), "png")
    image.add_header("Content-ID", f"<{LOGO_CID}>")
    image.add_header("Content-Disposition", "inline", filename=LOGO_CID)
    message.mixed_subtype = "related"  # tells email apps the image belongs to the HTML (not a download)
    message.attach(image)
