# PWA Import Package Specification

## Vision

A user should be able to provide only:

- Destination
- Dates
- Lodging
- Flights

The system should automatically generate:

1. Markdown itinerary
2. Places directory
3. Emergency contacts
4. Offline map recommendations
5. Flight summary
6. Travel checklist

## Package Structure

trip-package/
├── itinerary.md
├── flights.json
├── emergency-info.json
├── offline-maps.json
├── readiness-checklist.json
└── metadata.json

## Long-Term Goal

Support exporting and importing a complete trip package instead of only Markdown.
