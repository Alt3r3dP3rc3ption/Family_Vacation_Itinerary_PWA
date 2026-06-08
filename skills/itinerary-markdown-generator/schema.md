# PWA Itinerary Markdown Schema

## Header

```md
# Trip Title
**Dates:** Jun 12 – Jun 20, 2026
**Basecamp:** Three-Story Apartment · Indre By

*Optional trip summary*
```

## Day Format

```md
## ✈️ Fri, Jun 12: Departure
* **Evening:** Depart Raleigh (RDU).
* **Transit Tip:** Layover in Paris (CDG).
```

Rules:

- Use one `##` heading per day.
- Include emoji when available.
- Use bullet points for activities.
- Use bold labels before the colon.

## Places Directory

```md
---

# Places Directory

## Attractions
* **Tivoli Gardens:** Description. [Website](...) | [Map](...)
```

## Recommended Categories

- Attractions
- Food & Dining
- Transit
- Stays
- Shopping & Leisure
- Museums & History
- Parks & Outdoors
- Restaurants & Squares
- Local Breakfast & Coffee
- Day Trips

## Link Format

```md
[Website](https://example.com)
[Map](https://www.google.com/maps/search/?api=1&query=Place)
```

## Validation

A valid file should include:

- One H1 title.
- At least one day section.
- Bullet-point activities.
- UTF-8 encoding.
- Optional but recommended Places Directory.
