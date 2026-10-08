"""
Turns the message the support team writes into the email's HTML and plain-text versions.

Two formats (SupportEmail.format):

  markdown  "Simple formatting" (default). Plain text works as before (an empty line = new paragraph,
            a line break = new line). Optional formatting:
                **bold**   *italic*   [link text](https://...)
                - bullet list        1. numbered list        ## Heading
                [button: Open your workspace](https://engivexlab.com/portal)   → a big indigo button
            HTML typed into the message is shown as text (it can't break the email).

  html      The message is used as HTML as-is (only admins can write emails). Inline styles only:
            email apps ignore <style> blocks.

In both formats {name} becomes the person's first name.
"""

import html
import re

from django.utils.html import strip_tags
from markdown_it import MarkdownIt

INDIGO = "#4f35e6"

_markdown = MarkdownIt("commonmark", {"html": False, "breaks": True}).enable("strikethrough")

# Email apps ignore <style>, so every tag the formatting produces gets its look inline.
_INLINE_STYLES = {
    "p": "margin:0 0 14px",
    "h1": "margin:22px 0 10px;font-size:22px;line-height:1.3;color:#0f172a",
    "h2": "margin:20px 0 10px;font-size:19px;line-height:1.3;color:#0f172a",
    "h3": "margin:18px 0 8px;font-size:16px;line-height:1.3;color:#0f172a",
    "ul": "margin:0 0 14px;padding-left:22px",
    "ol": "margin:0 0 14px;padding-left:22px",
    "li": "margin:0 0 6px",
    "a": f"color:{INDIGO};text-decoration:underline",
    "blockquote": "margin:0 0 14px;padding:4px 0 4px 14px;border-left:3px solid #d9d3ff;color:#475569",
    "code": "font-family:Consolas,Menlo,monospace;background:#f1f0fb;padding:1px 4px;border-radius:4px",
    "hr": "border:0;border-top:1px solid #e6e3f3;margin:20px 0",
}
_BUTTON = (
    "display:inline-block;background:{c};color:#ffffff;text-decoration:none;font-weight:bold;"
    "padding:12px 24px;border-radius:10px"
).format(c=INDIGO)

# a paragraph that is only a link whose text starts with "button:"
_BUTTON_RE = re.compile(r'<p><a href="([^"]+)">\s*button:\s*(.+?)</a></p>', re.IGNORECASE)


def _style_tags(markup: str) -> str:
    """Add the inline style to each tag that doesn't have one yet (e.g. the button keeps its own)."""
    for tag, style in _INLINE_STYLES.items():
        markup = re.sub(rf"<{tag}(?=[\s>])(?![^>]*\bstyle=)", f'<{tag} style="{style}"', markup)
    return markup


def render_message(message: str, fmt: str, name: str) -> tuple[str, str]:
    """Returns (html, plain_text) for one recipient."""
    if fmt == "html":
        markup = message.replace("{name}", html.escape(name))
        text = html.unescape(strip_tags(markup))
        text = re.sub(r"\n{3,}", "\n\n", text).strip()
        return markup, text

    source = message.replace("{name}", name)
    markup = _markdown.render(source)
    markup = _BUTTON_RE.sub(
        lambda m: f'<p style="margin:22px 0"><a href="{m.group(1)}" style="{_BUTTON}">{m.group(2)}</a></p>', markup
    )
    markup = _style_tags(markup)
    # plain-text version: the message as typed, with "[button: Text](url)" written as "Text: url"
    text = re.sub(r"\[\s*button:\s*([^\]]+)\]\(([^)]+)\)", r"\1: \2", source, flags=re.IGNORECASE)
    return markup, text
