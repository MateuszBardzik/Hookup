"""
Top-level URL map. Every API route lives under /api/.

    /api/auth/...       -> accounts/urls.py   (sign up, log in, social login)
    /api/profile/       -> accounts/urls.py   (current user's profile)
    /api/positions/...  -> positions/urls.py  (list, detail, apply form + my applications)
    /api/testimonials/  -> testimonials/urls.py (landing-page feedback)
    /api/faqs/          -> faqs/urls.py       (landing-page FAQ)
    /api/portal/...     -> portal/urls.py     (worker portal: dashboard, training, projects, tasks)
    /api/contact/       -> contact/urls.py    (About page contact form)
    /admin/             -> admin pages to manage the database (users with is_admin = 1)
    /media/...          -> uploaded files (development only)
"""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from .admin_site import admin_site

urlpatterns = [
    path("admin/", admin_site.urls),
    path("api/", include("accounts.urls")),
    path("api/positions/", include("positions.urls")),
    path("api/testimonials/", include("testimonials.urls")),
    path("api/faqs/", include("faqs.urls")),
    path("api/portal/", include("portal.urls")),
    path("api/contact/", include("contact.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
