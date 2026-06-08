# Start Here: Make an Itinerary File for the PWA

This folder has tools and templates for creating itinerary files that upload cleanly into the Family Vacation Itinerary PWA.

You do **not** need to know coding.

## Easiest workflow

1. Open `templates/fill-in-the-blanks-itinerary.md`.
2. Copy the template.
3. Replace the bracketed placeholders with your trip details.
4. Save the file as something like `my-family-trip.md`.
5. Open the PWA.
6. Go to **Import**.
7. Upload the `.md` file.

## Use AI to create it for you

1. Open `prompts/simple-user-prompt.md`.
2. Copy the prompt.
3. Paste it into ChatGPT or another AI assistant.
4. Add your trip details.
5. Ask it to produce the final `.md` file.
6. Upload that file into the PWA.

## What matters most

The PWA recognizes itineraries best when the file has:

- One trip title at the top.
- A Dates line.
- A Basecamp line.
- Day headings that start with `##`.
- Activities as bullet points.
- A `# Places Directory` section.
- Places listed like `* **Place Name:** Description`.

## Good file name examples

- `copenhagen-family-trip.md`
- `disney-2027.md`
- `blue-ridge-road-trip.md`

## Avoid

- Uploading a Word document.
- Pasting raw tables.
- Using multiple trip titles with `#`.
- Skipping the day headings.
- Mixing place notes into the itinerary without a Places Directory.

## For advanced users

The Python files are optional. They are for automation, validation, and future agent workflows.

Normal users can ignore them.
