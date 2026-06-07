/* Travel screen - command center for flights, safety, maps prep, and readiness. */
const TRAVEL_FALLBACK_KEY = "trip-itinerary-app::travel-v1";

const DEFAULT_TRAVEL = {
  flights: [],
  maps: {
    copenhagen: false,
    herning: false,
    malmo: false,
  },
  checklist: {
    passports: false,
    boardingPasses: false,
    insurance: false,
    chargers: false,
    meds: false,
    roaming: false,
  },
};

const emptyFlight = () => ({
  id: "",
  airline: "Air France",
  bookingRef: "",
  flightNumber: "",
  departAirport: "",
  departTime: "",
  arriveAirport: "",
  arriveTime: "",
  seats: "",
  baggage: "",
  notes: "",
  boardingPassSaved: false,
});

const emptyPlaceDraft = () => ({
  mapsLink: "",
  name: "",
  category: "Other",
  location: "",
  notes: "",
});

function cloneTravel(v) {
  const src = v || {};
  return {
    flights: Array.isArray(src.flights) ? src.flights : [],
    maps: Object.assign({}, DEFAULT_TRAVEL.maps, src.maps || {}),
    checklist: Object.assign({}, DEFAULT_TRAVEL.checklist, src.checklist || {}),
  };
}

function loadTravelFallback() {
  try {
    const raw = localStorage.getItem(TRAVEL_FALLBACK_KEY);
    if (raw) return cloneTravel(JSON.parse(raw));
  } catch (e) {}
  return cloneTravel(DEFAULT_TRAVEL);
}

function saveTravelFallback(next) {
  try { localStorage.setItem(TRAVEL_FALLBACK_KEY, JSON.stringify(next)); } catch (e) {}
}

function readTravel() {
  if (window.Store && typeof window.Store.getTravel === "function") {
    return cloneTravel(window.Store.getTravel());
  }
  return loadTravelFallback();
}

function writeTravel(next) {
  const clean = cloneTravel(next);
  if (window.Store && typeof window.Store.setTravel === "function") {
    window.Store.setTravel(clean);
  } else {
    saveTravelFallback(clean);
  }
  return clean;
}

function safeOpen(appUrl, webUrl) {
  let left = false;
  const onHide = () => { left = true; };
  document.addEventListener("visibilitychange", onHide, { once: true });
  if (appUrl) {
    window.location.href = appUrl;
    window.setTimeout(() => {
      if (!left && document.visibilityState === "visible") window.open(webUrl, "_blank", "noopener");
    }, 700);
  } else {
    window.open(webUrl, "_blank", "noopener");
  }
}

function TravelToggle({ checked, onChange }) {
  return (
    <button
      className={"travel-toggle" + (checked ? " on" : "")}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

function TravelField({ label, value, onChange, placeholder, type }) {
  return (
    <label className="travel-field">
      <span>{label}</span>
      <input
        type={type || "text"}
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TravelTextarea({ label, value, onChange, placeholder }) {
  return (
    <label className="travel-field travel-wide">
      <span>{label}</span>
      <textarea
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FlightCard({ flight, onEdit, onDelete }) {
  const route = [flight.departAirport, flight.arriveAirport].filter(Boolean).join(" to ");
  const time = [flight.departTime, flight.arriveTime].filter(Boolean).join(" -> ");
  return (
    <div className="travel-card flight-card">
      <div className="travel-card-head">
        <div>
          <div className="travel-kicker">{flight.airline || "Air France"}</div>
          <div className="travel-card-title">{flight.flightNumber || "Flight details"}</div>
        </div>
        <div className={"travel-status" + (flight.boardingPassSaved ? " ready" : "")}>
          {flight.boardingPassSaved ? "Pass saved" : "Pass needed"}
        </div>
      </div>
      {route && <div className="travel-route">{route}</div>}
      {time && <div className="travel-muted">{time}</div>}
      <div className="travel-grid">
        <div><span>Booking</span>{flight.bookingRef || "-"}</div>
        <div><span>Seats</span>{flight.seats || "-"}</div>
        <div><span>Baggage</span>{flight.baggage || "-"}</div>
      </div>
      {flight.notes && <div className="travel-note">{flight.notes}</div>}
      <div className="travel-actions">
        <button className="pill" onClick={() => onEdit(flight)}>Edit</button>
        <button className="pill travel-danger" onClick={() => onDelete(flight.id)}>Delete</button>
      </div>
    </div>
  );
}

function TravelScreen({ tick }) {
  const [travel, setTravel] = useState(() => readTravel());
  const [flightDraft, setFlightDraft] = useState(emptyFlight);
  const [placeDraft, setPlaceDraft] = useState(emptyPlaceDraft);

  useEffect(() => { setTravel(readTravel()); }, [tick]);

  const saveTravel = (next) => setTravel(writeTravel(next));

  const updateFlightDraft = (field, value) => {
    setFlightDraft((cur) => Object.assign({}, cur, { [field]: value }));
  };

  const saveFlight = () => {
    const hasData = [
      "airline", "bookingRef", "flightNumber", "departAirport", "departTime",
      "arriveAirport", "arriveTime", "seats", "baggage", "notes",
    ].some((k) => String(flightDraft[k] || "").trim());
    if (!hasData) {
      toast("Add at least one flight detail");
      return;
    }
    const id = flightDraft.id || (window.Store && window.Store.uid ? window.Store.uid() : "flight-" + Date.now());
    const saved = Object.assign({}, flightDraft, { id });
    const exists = travel.flights.some((f) => f.id === id);
    const flights = exists
      ? travel.flights.map((f) => f.id === id ? saved : f)
      : travel.flights.concat(saved);
    saveTravel(Object.assign({}, travel, { flights }));
    setFlightDraft(emptyFlight());
    toast(exists ? "Flight updated" : "Flight saved");
  };

  const editFlight = (flight) => setFlightDraft(Object.assign(emptyFlight(), flight));

  const deleteFlight = (id) => {
    saveTravel(Object.assign({}, travel, { flights: travel.flights.filter((f) => f.id !== id) }));
    if (flightDraft.id === id) setFlightDraft(emptyFlight());
    toast("Flight removed");
  };

  const toggleMap = (id, value) => {
    saveTravel(Object.assign({}, travel, { maps: Object.assign({}, travel.maps, { [id]: value }) }));
  };

  const toggleChecklist = (id, value) => {
    saveTravel(Object.assign({}, travel, { checklist: Object.assign({}, travel.checklist, { [id]: value }) }));
  };

  const savePlace = () => {
    if (!placeDraft.mapsLink.trim() || !placeDraft.name.trim()) {
      toast("Add a Google Maps link and name");
      return;
    }
    if (!window.Store || typeof window.Store.addPlaceFromMapsLink !== "function") {
      toast("Place save needs Store.addPlaceFromMapsLink");
      return;
    }
    window.Store.addPlaceFromMapsLink({
      mapsLink: placeDraft.mapsLink.trim(),
      name: placeDraft.name.trim(),
      category: placeDraft.category,
      loc: placeDraft.location.trim(),
      notes: placeDraft.notes.trim(),
    });
    setPlaceDraft(emptyPlaceDraft());
    toast("Place saved");
  };

  const mapsRegions = [
    {
      id: "copenhagen",
      name: "Copenhagen / Zealand",
      sub: "Airport, city center, day trips",
      google: "https://www.google.com/maps/search/?api=1&query=Copenhagen%20Zealand%20Denmark",
      apple: "https://maps.apple.com/?q=Copenhagen%20Zealand%20Denmark",
    },
    {
      id: "herning",
      name: "Herning",
      sub: "Jutland travel window",
      google: "https://www.google.com/maps/search/?api=1&query=Herning%20Denmark",
      apple: "https://maps.apple.com/?q=Herning%20Denmark",
    },
    {
      id: "malmo",
      name: "Malmo",
      sub: "Sweden bridge day",
      google: "https://www.google.com/maps/search/?api=1&query=Malmo%20Sweden",
      apple: "https://maps.apple.com/?q=Malmo%20Sweden",
    },
  ];

  const checklist = [
    ["passports", "Passports checked"],
    ["boardingPasses", "Boarding passes saved"],
    ["insurance", "Travel insurance available"],
    ["chargers", "Chargers and adapters packed"],
    ["meds", "Medicine and prescriptions packed"],
    ["roaming", "Phone roaming or eSIM ready"],
  ];

  return (
    <Screen title="Travel" subtitle="Command center">
      <div className="section-hdr">Flights <span className="count">Air France v1</span></div>
      <div className="travel-links">
        <button className="pill" onClick={() => safeOpen("airfrance://", "https://wwws.airfrance.us/en/information/prepare/services/app-air-france")}>Air France App</button>
        <button className="pill" onClick={() => safeOpen(null, "https://wwws.airfrance.us/")}>Site</button>
        <button className="pill" onClick={() => safeOpen(null, "https://wwws.airfrance.us/en/check-in")}>Check-in</button>
        <button className="pill" onClick={() => safeOpen(null, "https://wwws.airfrance.us/en/trip")}>Manage booking</button>
      </div>

      {travel.flights.length === 0 ? (
        <div className="info-card" style={{ marginTop: 8 }}>
          No flights saved yet. Add booking basics here, then use the generic Air France links above for live booking actions.
        </div>
      ) : (
        <div className="travel-stack">
          {travel.flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onEdit={editFlight} onDelete={deleteFlight} />
          ))}
        </div>
      )}

      <div className="travel-form">
        <TravelField label="Airline" value={flightDraft.airline} onChange={(v) => updateFlightDraft("airline", v)} />
        <TravelField label="Booking reference" value={flightDraft.bookingRef} onChange={(v) => updateFlightDraft("bookingRef", v)} />
        <TravelField label="Flight number" value={flightDraft.flightNumber} onChange={(v) => updateFlightDraft("flightNumber", v)} />
        <TravelField label="Departure airport" value={flightDraft.departAirport} onChange={(v) => updateFlightDraft("departAirport", v)} />
        <TravelField label="Departure time" value={flightDraft.departTime} onChange={(v) => updateFlightDraft("departTime", v)} />
        <TravelField label="Arrival airport" value={flightDraft.arriveAirport} onChange={(v) => updateFlightDraft("arriveAirport", v)} />
        <TravelField label="Arrival time" value={flightDraft.arriveTime} onChange={(v) => updateFlightDraft("arriveTime", v)} />
        <TravelField label="Seats" value={flightDraft.seats} onChange={(v) => updateFlightDraft("seats", v)} />
        <TravelField label="Baggage" value={flightDraft.baggage} onChange={(v) => updateFlightDraft("baggage", v)} />
        <TravelTextarea label="Notes" value={flightDraft.notes} onChange={(v) => updateFlightDraft("notes", v)} />
        <div className="travel-checkline travel-wide">
          <div>
            <div className="travel-line-title">Boarding pass saved</div>
            <div className="travel-muted">Local reminder only</div>
          </div>
          <TravelToggle checked={!!flightDraft.boardingPassSaved} onChange={(v) => updateFlightDraft("boardingPassSaved", v)} />
        </div>
        <div className="travel-form-actions travel-wide">
          <button className="btn" onClick={saveFlight}>{flightDraft.id ? "Update flight" : "Save flight"}</button>
          {flightDraft.id && <button className="btn secondary" onClick={() => setFlightDraft(emptyFlight())}>Cancel edit</button>}
        </div>
      </div>

      <div className="section-hdr">Emergency</div>
      <div className="group">
        <a className="row" href="tel:112">
          <div className="row-icon" style={{ background: "#ff3b30" }}>DK</div>
          <div className="row-body"><div className="row-title">Denmark emergency</div><div className="row-sub">Police, fire, ambulance</div></div>
          <div className="row-trail">112</div>
        </a>
        <a className="row" href="tel:112">
          <div className="row-icon" style={{ background: "#3478f7" }}>SE</div>
          <div className="row-body"><div className="row-title">Sweden emergency</div><div className="row-sub">Police, fire, ambulance</div></div>
          <div className="row-trail">112</div>
        </a>
        <a className="row" href="tel:114">
          <div className="row-icon" style={{ background: "#8e8e93" }}>DK</div>
          <div className="row-body"><div className="row-title">Denmark non-emergency police</div><div className="row-sub">When it is not urgent</div></div>
          <div className="row-trail">114</div>
        </a>
        <a className="row" href="tel:11414">
          <div className="row-icon" style={{ background: "#8e8e93" }}>SE</div>
          <div className="row-body"><div className="row-title">Sweden non-emergency police</div><div className="row-sub">When it is not urgent</div></div>
          <div className="row-trail">114 14</div>
        </a>
      </div>

      <div className="section-hdr">Offline Maps</div>
      <div className="travel-stack">
        {mapsRegions.map((region) => (
          <div className="travel-card" key={region.id}>
            <div className="travel-card-head">
              <div>
                <div className="travel-card-title">{region.name}</div>
                <div className="travel-muted">{region.sub}</div>
              </div>
              <TravelToggle checked={!!travel.maps[region.id]} onChange={(v) => toggleMap(region.id, v)} />
            </div>
            <div className="travel-actions">
              <a className="pill maps" href={region.google} target="_blank" rel="noopener">Google Maps</a>
              <a className="pill" href={region.apple} target="_blank" rel="noopener">Apple Maps</a>
            </div>
          </div>
        ))}
      </div>

      <div className="section-hdr">Readiness</div>
      <div className="group">
        {checklist.map(([id, label]) => (
          <div className="travel-checkline" key={id}>
            <div className="travel-line-title">{label}</div>
            <TravelToggle checked={!!travel.checklist[id]} onChange={(v) => toggleChecklist(id, v)} />
          </div>
        ))}
      </div>

      <div className="section-hdr">Add Place <span className="count">from Google Maps link</span></div>
      <div className="travel-form">
        <TravelField label="Google Maps link" value={placeDraft.mapsLink} onChange={(v) => setPlaceDraft((d) => Object.assign({}, d, { mapsLink: v }))} placeholder="Paste maps link" />
        <TravelField label="Name" value={placeDraft.name} onChange={(v) => setPlaceDraft((d) => Object.assign({}, d, { name: v }))} />
        <label className="travel-field">
          <span>Category</span>
          <select value={placeDraft.category} onChange={(e) => setPlaceDraft((d) => Object.assign({}, d, { category: e.target.value }))}>
            <option>Attractions</option>
            <option>Food & Dining</option>
            <option>Transit</option>
            <option>Stays</option>
            <option>Other</option>
          </select>
        </label>
        <TravelField label="Location" value={placeDraft.location} onChange={(v) => setPlaceDraft((d) => Object.assign({}, d, { location: v }))} placeholder="Copenhagen, Herning, Malmo" />
        <TravelTextarea label="Notes" value={placeDraft.notes} onChange={(v) => setPlaceDraft((d) => Object.assign({}, d, { notes: v }))} />
        <div className="travel-form-actions travel-wide">
          <button className="btn" onClick={savePlace}>Save place</button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </Screen>
  );
}

window.TravelScreen = TravelScreen;
