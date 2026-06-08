"""
Reusable generator for Markdown itinerary files compatible with the Family Vacation Itinerary PWA.

The generator mirrors the structure exported by the app:
- top-level trip title
- bold Dates and Basecamp metadata
- day sections using level-two headings
- bullet activities with bold labels
- optional Places Directory grouped by category

Use generate_itinerary_markdown(meta, days, places) and write the returned text to a .md file.
"""

from typing import Any, Dict, List, Optional


def format_event(event: Dict[str, str]) -> str:
    """Format one itinerary bullet."""
    label = event.get("label", "").strip()
    description = event.get("description", "").strip()
    if not label:
        return f"* {description}"
    return f"* **{label}:** {description}"


def format_day(day: Dict[str, Any]) -> str:
    """Format one day section."""
    emoji = day.get("emoji", "").strip()
    date = day.get("date", "").strip()
    title = day.get("title", "").strip()
    heading = f"## {emoji} {date}: {title}".replace("  ", " ").strip()
    events = [format_event(event) for event in day.get("events", [])]
    return "\n".join([heading, *events, ""])


def format_places_section(category: str, items: List[Dict[str, Any]]) -> str:
    """Format one Places Directory category."""
    lines = [f"## {category}"]
    for item in items:
        name = item.get("name", "").strip()
        description = item.get("description", "").strip()
        links = item.get("links", {}) or {}
        link_text = " | ".join(f"[{label}]({url})" for label, url in links.items())

        if description and link_text:
            lines.append(f"* **{name}:** {description} {link_text}")
        elif description:
            lines.append(f"* **{name}:** {description}")
        elif link_text:
            lines.append(f"* **{name}:** {link_text}")
        else:
            lines.append(f"* **{name}**")
    lines.append("")
    return "\n".join(lines)


def generate_itinerary_markdown(
    meta: Dict[str, str],
    days: List[Dict[str, Any]],
    places: Optional[Dict[str, List[Dict[str, Any]]]] = None,
) -> str:
    """Return PWA-compatible itinerary Markdown."""
    title = meta.get("title", "Itinerary").strip()
    dates = meta.get("dates", "").strip()
    basecamp = meta.get("basecamp", "").strip()
    tagline = meta.get("tagline", "").strip()

    lines: List[str] = [f"# {title}"]
    if dates:
        lines.append(f"**Dates:** {dates}  ")
    if basecamp:
        lines.append(f"**Basecamp:** {basecamp}  ")
    lines.append("")
    if tagline:
        lines.append(f"*{tagline}*")
        lines.append("")

    for day in days:
        lines.append(format_day(day))

    if places:
        lines.append("---")
        lines.append("")
        lines.append("# Places Directory")
        lines.append("")
        for category, items in places.items():
            lines.append(format_places_section(category, items))

    return "\n".join(lines).rstrip() + "\n"


if __name__ == "__main__":
    sample_meta = {
        "title": "Sample Copenhagen Trip",
        "dates": "Jun 12 – Jun 20, 2026",
        "basecamp": "Three-Story Apartment · Indre By",
        "tagline": "A sample trip illustrating the supported format.",
    }

    sample_days = [
        {
            "emoji": "✈️",
            "date": "Fri, Jun 12",
            "title": "Departure",
            "events": [
                {
                    "label": "Evening",
                    "description": "Depart Raleigh (RDU) for the overnight transatlantic flight.",
                },
                {
                    "label": "Transit Tip",
                    "description": "Lay over in Paris (CDG) before the final leg to Denmark.",
                },
            ],
        }
    ]

    sample_places = {
        "Attractions": [
            {
                "name": "Tivoli Gardens",
                "description": "Iconic amusement park featuring rides and historic gardens.",
                "links": {
                    "Website": "https://www.tivoli.dk/en",
                    "Map": "https://www.google.com/maps/search/?api=1&query=Tivoli%20Gardens%20Copenhagen",
                },
            }
        ]
    }

    with open("sample_itinerary.md", "w", encoding="utf-8") as output:
        output.write(generate_itinerary_markdown(sample_meta, sample_days, sample_places))
