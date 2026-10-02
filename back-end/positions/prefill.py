"""
Fill a Google Form link with the logged-in user's details.

In your pre-filled Google Form link, type these placeholders as the answers:
    {name}  {first_name}  {last_name}  {email}
Google encodes them as %7Bname%7D etc. — both forms are recognised here.
"""

import re
from urllib.parse import quote

_PLACEHOLDER = re.compile(r"(?:\{|%7B)(name|first_name|last_name|email)(?:\}|%7D)", re.IGNORECASE)


def personalize_form_url(url: str, user) -> str:
    if not url:
        return ""
    values = {
        "name": f"{user.first_name} {user.last_name}".strip(),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }
    return _PLACEHOLDER.sub(lambda m: quote(values[m.group(1).lower()], safe=""), url)
