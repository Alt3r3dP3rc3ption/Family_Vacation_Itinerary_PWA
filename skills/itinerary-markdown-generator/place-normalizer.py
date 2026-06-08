from urllib.parse import quote


def normalize_place(place: dict) -> dict:
    name = (place.get('name') or '').strip()
    category = (place.get('category') or 'Other').strip()
    location = (place.get('location') or '').strip()

    result = dict(place)
    result['name'] = ' '.join(name.split())
    result['category'] = category.title()

    if not result.get('map') and name:
        result['map'] = f'https://www.google.com/maps/search/?api=1&query={quote(name)}'

    if location and 'location' not in result:
        result['location'] = location

    return result
