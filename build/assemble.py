"""Assemble styleguide.html (repo, full document) and the artifact variant (content only)."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
B = ROOT / "build"; DS = ROOT; ART = B / "artifact"; ART.mkdir(exist_ok=True)
css_sys = (DS / "sc.css").read_text()
css_page = (B / "styleguide-page.css").read_text()
theme = (B / "theme.js").read_text()
body = (B / "styleguide-body.html").read_text()
js = (B / "styleguide.js").read_text()
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">'

repo = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SpicyChicken Design System</title>
<meta name="description" content="Living style guide for the SpicyChicken design system: tokens, components and chart palettes, rendered in dark and light.">
{FONTS}
<link rel="stylesheet" href="sc.css">
<style>
{css_page}</style>
<script>
{theme}</script>
</head>
<body>
{body}
<script>
{js}</script>
</body>
</html>
"""
(DS / "styleguide.html").write_text(repo)

# Artifact: no doctype/html/head/body — the publisher adds the skeleton.
css_inline = css_sys.replace("@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');", "")
def inline_assets(html):
    import base64, re
    def repl(m):
        f = DS / m.group(1)
        data = base64.b64encode(f.read_bytes()).decode()
        mime = "image/svg+xml" if f.suffix == ".svg" else "image/png"
        return f'src="data:{mime};base64,{data}"'
    return re.sub(r'src="(assets/[^"]+)"', repl, html)

art_body = inline_assets(body)
art = f"""<title>SpicyChicken Design System</title>
{FONTS}
<style>
{css_inline}
{css_page}</style>
<script>
{theme}</script>
{art_body}
<script>
{js}</script>
"""
(ART / "styleguide.html").write_text(art)
print("repo:", len(repo), "bytes · artifact:", len(art), "bytes")
