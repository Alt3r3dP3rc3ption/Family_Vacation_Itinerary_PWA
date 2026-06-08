"""Validation utilities for Family Vacation Itinerary PWA Markdown files."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


DAY_HEADING_RE = re.compile(r"^##\s+.+?:\s+.+$")
PLACE_ENTRY_RE = re.compile(r"^\*\s+\*\*[^*]+:\*\*\s+.+$")
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\((https?://[^)]+)\)")


@dataclass
class ValidationResult:
    valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def format_report(self) -> str:
        lines = ["VALID" if self.valid else "INVALID"]
        if self.errors:
            lines.append("\nErrors:")
            lines.extend(f"- {item}" for item in self.errors)
        if self.warnings:
            lines.append("\nWarnings:")
            lines.extend(f"- {item}" for item in self.warnings)
        return "\n".join(lines)


def _nonblank(lines: Iterable[str]) -> list[str]:
    return [line.strip() for line in lines if line.strip()]


def validate_markdown(text: str) -> ValidationResult:
    errors: list[str] = []
    warnings: list[str] = []
    lines = text.splitlines()
    nonblank = _nonblank(lines)

    if not nonblank:
        return ValidationResult(False, ["File is empty."], [])

    if not nonblank[0].startswith("# ") or nonblank[0].startswith("## "):
        errors.append("The first nonblank line must be one H1 title using '# '.")

    day_headings = [line for line in lines if DAY_HEADING_RE.match(line.strip())]
    if not day_headings:
        errors.append("No itinerary day headings were found. Use '## Emoji Date: Title'.")

    activity_lines = [line for line in lines if line.startswith("* ")]
    if not activity_lines:
        errors.append("No bullet-point itinerary activities were found.")

    places_index = next((i for i, line in enumerate(lines) if line.strip() == "# Places Directory"), None)
    if places_index is None:
        warnings.append("No Places Directory was found. It is optional but strongly recommended.")
    else:
        category_headings = [
            line for line in lines[places_index + 1 :] if line.startswith("## ")
        ]
        if not category_headings:
            errors.append("Places Directory exists but has no H2 category headings.")

        place_entries = [
            line for line in lines[places_index + 1 :] if line.startswith("* ")
        ]
        if not place_entries:
            errors.append("Places Directory exists but contains no place entries.")
        else:
            malformed = [line for line in place_entries if not PLACE_ENTRY_RE.match(line.strip())]
            if malformed:
                warnings.append(
                    f"{len(malformed)} place entr{'y is' if len(malformed) == 1 else 'ies are'} not in the recommended '* **Name:** Description' format."
                )

    if "**Dates:**" not in text:
        warnings.append("Dates metadata is missing.")
    if "**Basecamp:**" not in text:
        warnings.append("Basecamp metadata is missing.")

    malformed_urls = []
    for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
        url = match.group(1).strip()
        if not url.startswith(("http://", "https://")):
            malformed_urls.append(url)
    if malformed_urls:
        warnings.append(f"Found {len(malformed_urls)} non-HTTP(S) Markdown link(s).")

    map_links = [url for url in MARKDOWN_LINK_RE.findall(text) if "maps" in url.lower()]
    if places_index is not None and not map_links:
        warnings.append("No map links were found in the Places Directory.")

    return ValidationResult(not errors, errors, warnings)


def validate_file(path: str | Path) -> ValidationResult:
    file_path = Path(path)
    text = file_path.read_text(encoding="utf-8")
    return validate_markdown(text)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a PWA itinerary Markdown file.")
    parser.add_argument("file", help="Path to the .md itinerary file")
    args = parser.parse_args()

    result = validate_file(args.file)
    print(result.format_report())
    return 0 if result.valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
