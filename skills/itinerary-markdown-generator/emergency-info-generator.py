COUNTRY_DATA = {
    'denmark': {
        'emergency': '112',
        'police_non_emergency': '114',
        'medical_advice': '1813',
    },
    'sweden': {
        'emergency': '112',
        'police_non_emergency': '114 14',
        'medical_advice': '1177',
    },
    'united states': {
        'emergency': '911',
        'police_non_emergency': 'Local jurisdiction',
        'medical_advice': 'Insurance/provider dependent',
    },
}


def build_emergency_section(country):
    data = COUNTRY_DATA.get(country.lower())
    if not data:
        return f'# Emergency Information\n\nNo emergency profile available for {country}.\n'

    return f'''# Emergency Information

* **Emergency:** {data['emergency']}
* **Police (Non-Emergency):** {data['police_non_emergency']}
* **Medical Advice:** {data['medical_advice']}
'''
