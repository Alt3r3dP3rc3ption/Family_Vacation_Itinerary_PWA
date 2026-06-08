def build_flight_section(flights):
    lines = ['# Flight Information', '']

    for flight in flights:
        lines.append(f"## {flight.get('airline','Airline')} {flight.get('flight_number','')}")
        lines.append(f"* **Route:** {flight.get('from','')} → {flight.get('to','')}")
        lines.append(f"* **Departure:** {flight.get('departure','')}")
        lines.append(f"* **Arrival:** {flight.get('arrival','')}")
        if flight.get('confirmation'):
            lines.append(f"* **Confirmation:** {flight.get('confirmation')}")
        lines.append('')

    return '\n'.join(lines)
