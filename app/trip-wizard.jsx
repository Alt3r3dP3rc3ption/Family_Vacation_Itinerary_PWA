/* Trip Wizard — a non-technical way to create a PWA-compatible Markdown itinerary file. */

const WIZARD_DEFAULTS = {
  tripName: "",
  dates: "",
  basecamp: "",
  travelers: "",
  destinations: "",
  interests: "",
  flights: "",
  notes: "",
};

function wizardLine(label, value) {
  const clean = (value || "").trim();
  return clean ? `* **${label}:** ${clean}\n` : "";
}

function buildWizardMarkdown(form) {
  const title = (form.tripName || "My Family Trip").trim();
  const dates = (form.dates || "Add dates").trim();
  const basecamp = (form.basecamp || "Add hotel / Airbnb / basecamp").trim();
  const destinations = (form.destinations || "Main destination").trim();
  const interests = (form.interests || "family-friendly activities").trim();

  return `# ${title}
**Dates:** ${dates}  
**Basecamp:** ${basecamp}  

*A family-friendly itinerary for ${destinations}, organized around ${interests}.*

## ✈️ Day 1: Travel & Arrival
${wizardLine("Travelers", form.travelers)}${wizardLine("Flights", form.flights)}* **Arrival:** Arrive, get settled, and keep the first day intentionally simple.
* **Evening:** Easy dinner near the basecamp.

## 🎯 Day 2: First Full Day
* **Morning:** Start with the easiest high-priority activity.
* **Lunch:** Choose something low-friction and close by.
* **Afternoon:** Add a second activity or return for a rest break.
* **Evening:** Flexible dinner and downtime.

## 🧭 Flexible Backup Day
* **Morning:** Use this day for weather backups, kid energy levels, or missed activities.
* **Afternoon:** Pick a nearby park, museum, food hall, or indoor activity.
* **Notes:** ${(form.notes || "Add family-specific reminders here.").trim()}

---

# Places Directory

## Attractions
* **[Add attraction name]:** Add a short description. [Map](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinations)})

## Food & Dining
* **[Add restaurant or food area]:** Add a short description.

## Transit
* **[Add airport / station / route]:** Add a short description.

## Stays
* **${basecamp}:** Primary basecamp.
`;
}

function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function TripWizard() {
  const [form, setForm] = useState(WIZARD_DEFAULTS);
  const [preview, setPreview] = useState("");

  const update = (field, value) => setForm((cur) => Object.assign({}, cur, { [field]: value }));
  const md = preview || buildWizardMarkdown(form);
  const fileName = ((form.tripName || "family-trip").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "family-trip") + ".md";

  const build = () => {
    const next = buildWizardMarkdown(form);
    setPreview(next);
    toast("Trip file preview created");
  };

  const copy = () => {
    const text = preview || buildWizardMarkdown(form);
    navigator.clipboard.writeText(text).then(() => toast("Copied itinerary Markdown"), () => toast("Copy failed"));
  };

  const download = () => {
    const text = preview || buildWizardMarkdown(form);
    downloadMarkdown(fileName, text);
    toast("Downloaded itinerary file");
  };

  return (
    <React.Fragment>
      <div className="section-hdr">Trip Wizard <span className="count">No coding needed</span></div>
      <div className="info-card" style={{ marginTop: 8 }}>
        Answer a few plain-English questions, then download a Markdown file that can be uploaded in the Import tab.
      </div>
      <div className="travel-form">
        <TravelField label="Trip name" value={form.tripName} onChange={(v) => update("tripName", v)} placeholder="Copenhagen Family Trip" />
        <TravelField label="Dates" value={form.dates} onChange={(v) => update("dates", v)} placeholder="Jun 12 – Jun 20, 2026" />
        <TravelField label="Hotel / Airbnb / basecamp" value={form.basecamp} onChange={(v) => update("basecamp", v)} placeholder="Apartment in Indre By" />
        <TravelField label="Destinations" value={form.destinations} onChange={(v) => update("destinations", v)} placeholder="Copenhagen, Herning, Malmö" />
        <TravelField label="Travelers" value={form.travelers} onChange={(v) => update("travelers", v)} placeholder="2 adults, 3 kids" />
        <TravelField label="Interests" value={form.interests} onChange={(v) => update("interests", v)} placeholder="gaming, stroller-friendly museums, parks" />
        <TravelTextarea label="Flights" value={form.flights} onChange={(v) => update("flights", v)} placeholder="Air France RDU → CDG → CPH" />
        <TravelTextarea label="Family notes" value={form.notes} onChange={(v) => update("notes", v)} placeholder="Nap breaks, food backups, stroller needs, rainy-day options" />
        <div className="travel-form-actions travel-wide">
          <button className="btn" onClick={build}>Preview file</button>
          <button className="btn secondary" onClick={download}>Download .md</button>
          <button className="btn secondary" onClick={copy}>Copy</button>
        </div>
      </div>
      {preview && (
        <div className="travel-card">
          <div className="travel-card-head">
            <div>
              <div className="travel-kicker">Preview</div>
              <div className="travel-card-title">{fileName}</div>
            </div>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, maxHeight: 260, overflow: "auto" }}>{md}</pre>
        </div>
      )}
    </React.Fragment>
  );
}

window.TripWizard = TripWizard;
