from itinerary_skill import generate_itinerary_markdown
import json
import sys
from pathlib import Path

if len(sys.argv) != 3:
    print('Usage: json-to-markdown.py input.json output.md')
    raise SystemExit(2)

data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
markdown = generate_itinerary_markdown(
    data.get('meta', {}),
    data.get('days', []),
    data.get('places', {})
)
Path(sys.argv[2]).write_text(markdown, encoding='utf-8')
print(f'Wrote {sys.argv[2]}')
