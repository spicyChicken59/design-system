"""sRGB <-> OKLCH, WCAG contrast, lightness-preserving hue remap."""
import math

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return '#%02X%02X%02X' % tuple(max(0, min(255, round(c * 255))) for c in rgb)

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def linear_to_srgb(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

def rgb_to_oklab(rgb):
    r, g, b = (srgb_to_linear(c) for c in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1/3), m ** (1/3), s ** (1/3)
    return (0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_)

def oklab_to_rgb(lab):
    L, a, b = lab
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return tuple(linear_to_srgb(c) for c in (r, g, bb))

def hex_to_oklch(h):
    L, a, b = rgb_to_oklab(hex_to_rgb(h))
    C = math.hypot(a, b)
    H = math.degrees(math.atan2(b, a)) % 360
    return L, C, H

def oklch_to_hex(L, C, H):
    a = C * math.cos(math.radians(H)); b = C * math.sin(math.radians(H))
    rgb = oklab_to_rgb((L, a, b))
    if all(-0.002 <= c <= 1.002 for c in rgb):
        return rgb_to_hex(rgb)
    # gamut-map by reducing chroma
    lo, hi = 0.0, C
    for _ in range(30):
        mid = (lo + hi) / 2
        a = mid * math.cos(math.radians(H)); b = mid * math.sin(math.radians(H))
        rgb = oklab_to_rgb((L, a, b))
        if all(-0.002 <= c <= 1.002 for c in rgb): lo = mid
        else: hi = mid
    a = lo * math.cos(math.radians(H)); b = lo * math.sin(math.radians(H))
    return rgb_to_hex(oklab_to_rgb((L, a, b)))

def remap(h, hue, chroma_scale=1.0, min_chroma=None):
    L, C, _ = hex_to_oklch(h)
    C = C * chroma_scale
    if min_chroma is not None: C = max(C, min_chroma)
    return oklch_to_hex(L, C, hue)

def luminance(h):
    r, g, b = (srgb_to_linear(c) for c in hex_to_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(h1, h2):
    l1, l2 = luminance(h1), luminance(h2)
    if l1 < l2: l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)
