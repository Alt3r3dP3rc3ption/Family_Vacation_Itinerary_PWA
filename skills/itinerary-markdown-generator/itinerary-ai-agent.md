# Itinerary AI Agent Specification

## Purpose

Generate Family Vacation Itinerary PWA compatible itineraries from natural-language trip requests.

## Inputs

- Destination(s)
- Dates
- Travelers
- Lodging
- Flight information
- Google Maps links
- Interests
- Budget

## Outputs

1. PWA-compatible Markdown itinerary
2. Places Directory
3. Flight section
4. Emergency information section
5. Offline maps recommendations
6. Import readiness score

## Workflow

1. Normalize places.
2. Parse Google Maps links.
3. Build place directory.
4. Generate daily itinerary.
5. Add flight section.
6. Add emergency information.
7. Validate itinerary.
8. Generate readiness score.
9. Export Markdown.

## Success Criteria

- Pass validator.py
- Readiness score >= 90
- Consistent place naming
- Valid map links
- Valid markdown structure
