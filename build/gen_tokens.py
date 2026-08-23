"""Generate tokens.json (W3C Design Tokens draft format) from sc.css.

Primitives come from the first :root block; dark semantics from the second;
light semantics from the [data-theme="light"] block. Values are resolved to
hex so the file imports cleanly into Figma variable plugins and Tokens Studio;
the original var() reference is kept in $extensions for traceability.
"""
import json, re, sys
from pathlib import Path

css = Path(sys.argv[1]).read_text()
out = Path(sys.argv[2])

def block(after, start_pat):
    i = css.index(after)
    j = css.index(start_pat, i)
    k = css.index("}", j)
    return css[j:k]

def parse(body):
    toks = {}
    for m in re.finditer(r"--sc-([a-z0-9-]+)\s*:\s*([^;]+);", body):
        toks[m.group(1)] = m.group(2).strip()
    return toks

prim = parse(block("1. PRIMITIVES", ":root {"))
dark = parse(block("2. SEMANTIC — DARK", ":root {"))
light = parse(block("2b. SEMANTIC — LIGHT", ':root[data-theme="light"] {'))

def resolve(v, *scopes):
    m = re.fullmatch(r"var\(--sc-([a-z0-9-]+)\)", v)
    if not m:
        return v
    name = m.group(1)
    for s in scopes:
        if name in s:
            return resolve(s[name], *scopes)
    return v

def typ(name, value):
    if value.startswith("#") or value.startswith("rgba"):
        return "color"
    if name.startswith("font-") and "'" in value:
        return "fontFamily"
    if value.endswith("px"):
        return "dimension"
    if value.endswith("ms"):
        return "duration"
    if value.startswith("cubic-bezier"):
        return "cubicBezier"
    if name.startswith("lh-"):
        return "number"
    return "string"

def group(tokens, scopes):
    g = {}
    for name, raw in tokens.items():
        val = resolve(raw, *scopes)
        entry = {"$type": typ(name, val), "$value": val}
        if raw != val:
            entry["$extensions"] = {"sc": {"ref": raw}}
        parts = name.split("-")
        # color ramps: cobalt-500 -> color.cobalt.500 ; status -> color.good ; etc.
        if entry["$type"] == "color":
            if len(parts) >= 2 and parts[-1].isdigit():
                g.setdefault("color", {}).setdefault("-".join(parts[:-1]), {})[parts[-1]] = entry
            else:
                g.setdefault("color", {})[name] = entry
        elif entry["$type"] == "fontFamily":
            g.setdefault("font", {})[name.replace("font-", "")] = entry
        elif name.startswith(("text-", "h1", "h2", "h3", "display", "lh-")):
            g.setdefault("type", {})[name] = entry
        elif re.fullmatch(r"s\d+", name):
            g.setdefault("space", {})[name] = entry
        elif name.startswith("r-"):
            g.setdefault("radius", {})[name[2:]] = entry
        elif name in ("motion", "ease"):
            g.setdefault("motion", {})[name] = entry
        elif name.startswith("w-"):
            g.setdefault("layout", {})[name[2:]] = entry
        else:
            g.setdefault("misc", {})[name] = entry
    return g

doc = {
    "$schema": "https://tr.designtokens.org/format/",
    "$description": "SpicyChicken Design System tokens — generated from sc.css (see its header for the version); edit the CSS, not this file.",
    "primitive": group(prim, [prim]),
    "semantic": {
        "dark": group(dark, [dark, prim]),
        "light": group(light, [light, dark, prim]),
    },
}
out.write_text(json.dumps(doc, indent=2))
n = sum(1 for _ in re.finditer(r'"\$value"', out.read_text()))
print(f"wrote {out} with {n} tokens ({len(prim)} primitive, {len(dark)} dark, {len(light)} light)")
