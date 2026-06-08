"""Convert supported itinerary Markdown into structured JSON."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DAY_RE = re.compile(r"^##\s+(?P<emoji>\S+)?\s*(?P<date>[^:]+):\s*(?P<title>.+)$")
EVENT_RE = re.compile(r"^\*\s+(?:\*\*(?P<label>[^*]+):\*\*\s*)?(?P<description>.+)$")
PLACE_RE = re.compile(r"^\*\s+\*\*(?P<name>[^*]+):\*\*\s*(?P<body>.*)$")
LINK_RE = re.compile(r"\[(?P<label>[^\]]+)\]\((?P<url>[^)]+)\)")


def parse_markdown(text: str) -> dict:
    lines = text.splitlines()
    result = {"meta": {}, "days": [], "places": {}}
    current_day = None
    current_category = None
    in_places = False

    for raw in lines:
        line = raw.strip()
        if not line:
            continue

        if line.startswith("# ") and line != "# Places Directory":
            result["meta"]["title"] = line[2:].strip()
            continue
        if line == "# Places Directory":
            in_places = True
            current_day = None
            continue
        if line.startswith("**Dates:**"):
            result["meta"]["dates"] = line.split(":", 1)[1].strip()
            continue
        if line.startswith("**Basecamp:**"):
            result["meta"]["basecamp"] = line.split(":", 1)[1].strip()
            continue
        if line.startswith("*") and line.endswith("*") and not line.startswith("* **") and not in_places:
            result["meta"]["tagline"] = line.strip("*")
            continue

        if line.startswith("## "):
            if in_places:
                current_category = line[3:].strip()
                result["places"].setdefault(current_category, [])
            else:
                match = DAY_RE.match(line)
                if match:
                    current_day = {
                        "emoji": (match.group("emoji") or "").strip(),
                        "date": match.group("date").strip(),
                        "title": match.group("title").strip(),
                        "events": [],
                    }
                    result["days"].append(current_day)
            continue

        if line.startswith("* "):
            if in_places and current_category:
                match = PLACE_RE.match(line)
                if match:
                    body = match.group("body")
                    links = {m.group("label"): m.group("url") for m in LINK_RE.finditer(body)}
                    description = LINK_RE.sub("", body).replace("|", " ").strip()
                    result["places"][current_category].append(
                        {
                            "name": match.group("name").strip(),
                            "description": description,
                            "links": links,
                        }
                    )
            elif current_day:
                match = EVENT_RE.match(line)
                if match:
                    current_day["events"].append(
                        {
                            "label": (match.group("label") or "").strip(),
                            "description": match.group("description").strip(),
                        }
                    )

    return result


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: markdown-to-json.py itinerary.md")
        return 2
    path = Path(sys.argv[1])
    print(json.dumps(parse_markdown(path.read_text(encoding="utf-8")), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
