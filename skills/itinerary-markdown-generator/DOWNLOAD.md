# Download the Itinerary Skill Pack

The Itinerary Markdown Generator is intended to be usable by non-technical users.

## Recommended Download Method

For now, download the repository as a ZIP from GitHub:

1. Open the repository.
2. Click **Code**.
3. Click **Download ZIP**.
4. Unzip the file.
5. Open this folder:

```text
skills/itinerary-markdown-generator/
```

6. Start with:

```text
START_HERE.md
```

## What a Packaged Skill ZIP Should Include

A standalone skill ZIP should contain:

```text
itinerary-markdown-generator-skill/
├── README.md
├── INSTALL.md
├── schema.md
├── templates/
│   └── fill-in-the-blanks-itinerary.md
├── prompts/
│   └── simple-user-prompt.md
├── examples/
│   └── sample-itinerary.md
└── tools/
    ├── itinerary_skill.py
    └── validator.py
```

## Normal User Path

Most users should only need:

- `README.md`
- `INSTALL.md`
- `templates/fill-in-the-blanks-itinerary.md`
- `prompts/simple-user-prompt.md`
- `examples/`

The `tools/` folder is optional and only for automation or validation.

## Future Improvement

The ideal long-term distribution method is a GitHub Release asset:

```text
itinerary-markdown-generator-skill.zip
```

That gives users a clean one-click download without needing to understand the repository layout.