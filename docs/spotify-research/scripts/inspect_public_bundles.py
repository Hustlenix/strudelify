"""Record bounded framework fingerprints from scripts linked by the public page.

Static string inspection only: no downloaded JavaScript is executed or retained.
Presence is evidence about an artifact, not proof of runtime use or completeness.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
import re

from capture_public_surface import BASE, AGENTS, fetch


def main():
    surface = json.loads((BASE / "evidence/public-surface.json").read_text(encoding="utf-8"))
    scripts = sorted({url for page in surface["pages"] if page["agentMode"] == "desktop"
                      for url in page["scriptUrls"]
                      if url.startswith("https://open.spotifycdn.com/cdn/build/web-player/")})
    report = {
        "capturedAtUtc": datetime.now(timezone.utc).isoformat(),
        "method": "Static first-party artifact fingerprints; no execution, imports, browser attachment, or source retention",
        "limitations": ["A marker may belong to unused or compatibility code", "Source declarations do not prove the active browser runtime version", "No current backend or full dependency graph was recovered"],
        "artifacts": [], "failures": [],
    }
    for url in scripts:
        try:
            raw, metadata = fetch(url, AGENTS["desktop"])
            source = raw.decode("utf-8")
            markers = {name: source.find(name) for name in ["react.element", "react-dom", "createRoot", "Redux", "zustand"]}
            renderers = sorted(set(re.findall(r'version:\s*"([0-9]+\.[0-9]+\.[0-9]+)",rendererPackageName:\s*"(react-dom)"', source)))
            report["artifacts"].append({**metadata, "markerOffsets": markers,
                "rendererDeclarations": [{"version": version, "package": package} for version, package in renderers]})
        except Exception as error:
            report["failures"].append({"url": url, "error": str(error)})
    output = BASE / "evidence/framework-fingerprints.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "artifacts": len(report["artifacts"]), "failures": report["failures"]}))


if __name__ == "__main__":
    main()
