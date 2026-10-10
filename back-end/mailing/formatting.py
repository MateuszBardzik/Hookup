"""
Turns the HTML message the support team writes into the email's HTML and plain-text versions.

The message is used as HTML as-is (only admins can write emails). Use inline styles only
(style="..."): email apps ignore <style> blocks. {name} becomes the person's first name.
The plain-text version (for email apps that don't show HTML) is the same message with the tags removed;
links keep their address, e.g. "Open your workspace (https://engivexlab.com/portal)".
"""

import html
import re

from django.utils.html import strip_tags

# <a href="url">text</a>  →  text (url)   in the plain-text version
_LINK_RE = re.compile(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
# tags that end a line / paragraph in the plain-text version
_BREAK_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)
_BLOCK_END_RE = re.compile(r"</(p|div|h[1-6]|li|tr|table|ul|ol|blockquote)>", re.IGNORECASE)


def _link_text(match: re.Match) -> str:
    url, label = match.group(1), strip_tags(match.group(2)).strip()
    return url if not label or label == url else f"{label} ({url})"


def render_message(message: str, name: str) -> tuple[str, str]:
    """Returns (html, plain_text) for one recipient."""
    markup = message.replace("{name}", html.escape(name))

    text = _LINK_RE.sub(_link_text, message)
    text = _BREAK_RE.sub("\n", text)
    text = _BLOCK_END_RE.sub("\n\n", text)
    text = html.unescape(strip_tags(text))
    text = "\n".join(line.strip() for line in text.splitlines())
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return markup, text.replace("{name}", name)  # after removing tags, so the name stays as typed
