# Itinerary Markdown Generator Skill

This skill creates Markdown itinerary files that the Family Vacation Itinerary PWA can recognize and import reliably.

## Purpose

Use this skill whenever an AI agent, script, or person needs to generate a new itinerary for upload into the app. The output should follow the schema in `schema.md` and may use the prompt in `prompt.md`.

## Included files

- `itinerary_skill.py` — Python generator for PWA-compatible Markdown.
- `schema.md` — Canonical format specification.
- `prompt.md` — Reusable prompt for ChatGPT, Codex, Claude, Gemini, or another agent.
- `sample_itinerary.md` — Minimal valid example.
- `examples/copenhagen-sweden-minecraft.md` — Full real-world example exported from the app.
- `examples/disney-world.md` — Short family-theme-park example.
- `examples/road-trip.md` — Short multi-stop road-trip example.

## Required structure

A valid itinerary should contain:

1. One top-level trip title using `#`.
2. Optional `**Dates:**` and `**Basecamp:**` lines.
3. One or more day sections using `##` headings.
4. Day activities as bullet points.
5. An optional `# Places Directory` section.
6. Place categories using `##` headings.
7. Place entries using bold names followed by descriptions and optional links.

## Quick start

```python
from itinerary_skill import generate_itinerary_markdown

meta = {
    "title": "Family Trip",
    "dates": "Jul 1 – Jul 7, 2027",
    "basecamp": "Downtown Hotel",
    "tagline": "A balanced family itinerary.",
}

days = [
    {
        "emoji": "✈️",
        "date": "Thu, Jul 1",
        "title": "Arrival",
        "events": [
            {"label": "Afternoon", "description": "Arrive and check in."}
        ],
    }
]

places = {
    "Stays": [
        {
            "name": "Downtown Hotel",
            "description": "Primary basecamp.",
            "links": {"Map": "https://www.google.com/maps/search/?api=1&query=Downtown%20Hotel"},
        }
    ]
}

markdown = generate_itinerary_markdown(meta, days, places)
```

## Validation checklist

Before importing a generated file, confirm:

- The first line starts with `# `.
- Every itinerary day starts with `## `.
- Every activity is a bullet beginning with `* `.
- Every place entry begins with `* **Place Name:**`.
- The places directory starts with exactly `# Places Directory`.
- Website and map links use normal Markdown link syntax.
- The file is UTF-8 encoded and has a `.md` extension.

## Notes

The app performs name-based matching and de-duplication. Keep place names consistent between the day-by-day schedule and the Places Directory so linked place references resolve cleanly.
