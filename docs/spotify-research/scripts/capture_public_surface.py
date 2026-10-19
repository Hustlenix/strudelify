"""Inspect anonymous public HTML/CSS; save facts and hashes, never page bodies.

No browser profile, cookies, credentials, playback, fonts, artwork, or media.
This is source inspection, not a rendered capture or a completeness claim.
Run from any directory: rtk proxy python -X utf8 <absolute script path>
"""

from collections import Counter
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import gzip
import json
from pathlib import Path
import re
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "evidence" / "public-surface.json"
AGENTS = {
    "desktop": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    "mobile": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
}
TOKEN_NAMES = {
    "--panel-gap", "--left-sidebar-width", "--right-sidebar-width",
    "--content-spacing", "--content-max-width", "--now-playing-bar-height",
    "--global-nav-height", "--global-nav-search-box-width", "--top-bar-height",
    "--background-base", "--background-highlight", "--background-elevated-base",
    "--background-elevated-highlight", "--text-base", "--text-subdued",
    "--text-bright-accent", "--essential-base", "--essential-bright-accent",
    "--encore-corner-radius-base", "--encore-spacing-tighter-2",
    "--encore-spacing-base", "--encore-text-size-base", "--min-main-content-width",
}
SEMANTIC_SELECTORS = {
    "resize": "LayoutResizer__resize-bar",
    "main-container": ".main-view-container",
    "now-playing": ".now-playing-bar",
    "tracklist": ".main-trackList-trackListRow",
    "entity-title": ".main-entityHeader-title",
}
FACT_PROPERTIES = {
    "height", "min-height", "max-height", "width", "min-width", "max-width",
    "padding", "padding-top", "padding-bottom", "gap", "border-radius",
    "font-size", "font-weight", "display", "overflow", "overflow-x",
    "overflow-y", "position", "cursor", "touch-action",
}


def clean_url(value):
    parts = urlsplit(value)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def fetch(url, agent):
    request = Request(url, headers={"User-Agent": agent, "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "identity"})
    with urlopen(request, timeout=30) as response:
        if urlsplit(response.url).hostname not in {"open.spotify.com", "open.spotifycdn.com"}:
            raise RuntimeError("Unexpected redirect origin; refusing to inspect")
        raw = response.read(8 * 1024 * 1024 + 1)
        if len(raw) > 8 * 1024 * 1024:
            raise RuntimeError("Public resource exceeded 8 MiB capture budget")
        transfer_bytes = len(raw)
        if raw.startswith(b"\x1f\x8b"):
            raw = gzip.decompress(raw)
        if len(raw) > 8 * 1024 * 1024:
            raise RuntimeError("Decoded public resource exceeded 8 MiB capture budget")
        return raw, {
            "url": clean_url(response.url), "status": response.status,
            "contentType": response.headers.get("Content-Type"),
            "transferBytes": transfer_bytes, "bytes": len(raw), "sha256": sha256(raw).hexdigest(),
        }


class SurfaceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stylesheets = []
        self.scripts = []
        self.tags = Counter()
        self.route_types = Counter()
        self.landmarks = Counter()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.tags[tag] += 1
        if attrs.get("role") in {"navigation", "main", "search", "dialog", "grid", "listbox", "combobox"}:
            self.landmarks[attrs["role"]] += 1
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.stylesheets.append(clean_url(urljoin("https://open.spotify.com", attrs.get("href", ""))))
        if tag == "script" and attrs.get("src"):
            self.scripts.append(clean_url(urljoin("https://open.spotify.com", attrs["src"])))
        if tag == "a" and attrs.get("href"):
            parsed = urlsplit(urljoin("https://open.spotify.com", attrs["href"]))
            if parsed.hostname == "open.spotify.com":
                segments = parsed.path.strip("/").split("/")
                kind = segments[0] if segments[0] in {"album", "artist", "playlist", "track", "search", "genre", "collection"} else "other"
                self.route_types[kind] += 1


def css_facts(text):
    tokens = {name: [] for name in sorted(TOKEN_NAMES)}
    for match in re.finditer(r"(?:^|[;{])\s*(?P<name>--[a-zA-Z0-9_-]+)\s*:\s*(?P<value>[^;{}]+)", text):
        name, value = match["name"], match["value"].strip()
        if name in tokens and len(value) <= 120 and "url(" not in value:
            if value not in tokens[name]:
                tokens[name].append(value)
    rules = []
    # Simple leaf rules only; no claim that media conditions or the cascade apply.
    for match in re.finditer(r"(?P<selector>[^{}]+)\{(?P<body>[^{}]*)\}", text):
        selector = match["selector"].strip()
        categories = [name for name, needle in SEMANTIC_SELECTORS.items() if needle in selector]
        if not categories:
            continue
        facts = {}
        for declaration in match["body"].split(";"):
            name, sep, value = declaration.partition(":")
            if sep and name.strip() in FACT_PROPERTIES:
                facts[name.strip()] = value.strip()
        if facts:
            rules.append({"categories": categories, "selectorSha256": sha256(selector.encode()).hexdigest(), "declarations": facts})
    queries = sorted(set(re.findall(r"@media\s*([^{}]+)\{", text)))
    return {
        "method": "Selected source declarations; not computed styles or effective breakpoints",
        "tokens": {name: values for name, values in tokens.items() if values},
        "semanticRuleFacts": rules,
        "mediaConditions": [query.strip() for query in queries if len(query) < 160],
    }


def main():
    capture = {
        "schemaVersion": 1,
        "capturedAtUtc": datetime.now(timezone.utc).isoformat(),
        "scope": "Anonymous ordinary HTTP GETs; HTML and linked first-party CSS only",
        "browserUsed": False, "renderedMeasurements": False,
        "limitations": [
            "HTTP User-Agent variation does not establish mobile device rendering",
            "No account state, authenticated interactions, network session, or backend internals",
            "CSS declarations can be inactive, overridden, experimental, or route-specific",
            "No raw HTML, CSS, JavaScript bundles, source maps, fonts, artwork, or audio retained",
        ],
        "pages": [], "stylesheets": [], "failures": [],
    }
    seen_styles = set()
    for mode, agent in AGENTS.items():
        for route in ["/", "/search"]:
            url = "https://open.spotify.com" + route
            try:
                raw, metadata = fetch(url, agent)
                parser = SurfaceParser()
                parser.feed(raw.decode("utf-8"))
                capture["pages"].append({
                    **metadata, "agentMode": mode, "userAgent": agent,
                    "tagCounts": dict(parser.tags), "landmarkCounts": dict(parser.landmarks),
                    "routeTypeCounts": dict(parser.route_types),
                    "stylesheets": parser.stylesheets, "scriptUrls": parser.scripts,
                })
                for style in parser.stylesheets:
                    if style in seen_styles or urlsplit(style).hostname != "open.spotifycdn.com":
                        continue
                    css, css_metadata = fetch(style, agent)
                    capture["stylesheets"].append({**css_metadata, **css_facts(css.decode("utf-8"))})
                    seen_styles.add(style)
            except Exception as error:
                capture["failures"].append({"agentMode": mode, "url": url, "error": str(error)})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(capture, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "pages": len(capture["pages"]), "stylesheets": len(capture["stylesheets"]), "failures": capture["failures"]}))


if __name__ == "__main__":
    main()
