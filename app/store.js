/* Store: persistent on-device storage (localStorage) + merge / dedupe engine.
   Exposes window.Store. State shape:
   { trips: [trip], places: [place], activeTripId, meta:{...} }
   Places are deduped by slug(name). */
(function () {
  const KEY = "trip-itinerary-app::v1";

  // ---- helpers -------------------------------------------------------------
  const slug = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/\(.*?\)/g, "")          // drop parentheticals for matching
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, "-");

  const uid = () => "id-" + Math.random().toString(36).slice(2, 9);

  const DEFAULT_TRAVEL = {
    version: "travel-command-center-v1",
    flightsVersion: "Air France v1",
    flightStatus: "Confirm live details in the Air France app before travel.",
    flights: [
      {
        id: "outbound-rdu-cdg-cph",
        airline: "Air France",
        bookingRef: "",
        flightNumber: "",
        departAirport: "RDU",
        departTime: "2026-06-12 evening",
        arriveAirport: "CPH",
        arriveTime: "2026-06-13 morning/afternoon",
        seats: "",
        baggage: "",
        notes: "Outbound route: RDU -> CDG -> CPH. Confirm exact times and flight numbers in Air France.",
        boardingPassSaved: false,
      },
      {
        id: "return-cph-cdg-rdu",
        airline: "Air France",
        bookingRef: "",
        flightNumber: "",
        departAirport: "CPH",
        departTime: "2026-06-20 morning",
        arriveAirport: "RDU",
        arriveTime: "2026-06-20",
        seats: "",
        baggage: "",
        notes: "Return route: CPH -> CDG -> RDU. Confirm exact times and flight numbers in Air France.",
        boardingPassSaved: false,
      },
    ],
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
    offlineMaps: {
      title: "Offline Map Prep",
      regions: [
        {
          id: "copenhagen-zealand",
          name: "Copenhagen / Zealand",
          queries: ["Copenhagen", "Copenhagen Airport", "Indre By", "Zealand Denmark"],
          checklist: [
            { id: "google-map", label: "Download Google Maps offline area", done: false },
            { id: "basecamp", label: "Save apartment and Copenhagen Airport", done: false },
            { id: "transit-hubs", label: "Save Kongens Nytorv and Copenhagen Central Station", done: false },
            { id: "walking", label: "Star walkable family stops in Indre By", done: false },
          ],
        },
        {
          id: "herning",
          name: "Herning",
          queries: ["Herning", "MCH Messecenter Herning", "Birk Centerpark"],
          checklist: [
            { id: "google-map", label: "Download Herning offline area", done: false },
            { id: "train-stops", label: "Save Herning Messecenter and Birk Centerpark stations", done: false },
            { id: "minecraft", label: "Save MCH Messecenter / Minecraft Experience", done: false },
            { id: "backup-food", label: "Mark backup food near stations", done: false },
          ],
        },
        {
          id: "malmo",
          name: "Malmo",
          queries: ["Malmo", "Malmo Central Station", "Malmo Castle", "Folkets Park"],
          checklist: [
            { id: "google-map", label: "Download Malmo offline area", done: false },
            { id: "station", label: "Save Malmo Central Station", done: false },
            { id: "day-route", label: "Save Malmohus Castle, Lilla Torg, and Folkets Park", done: false },
            { id: "oresund", label: "Save Oresund train route notes", done: false },
          ],
        },
      ],
    },
    readiness: {
      title: "Readiness Checklist",
      checklist: [
        { id: "passports", label: "Passports checked and packed", done: false },
        { id: "cards", label: "Travel cards enabled and backup card packed", done: false },
        { id: "roaming", label: "Phone roaming / eSIM plan ready", done: false },
        { id: "chargers", label: "Chargers, adapters, and battery packs packed", done: false },
        { id: "meds", label: "Medications and kid essentials packed in carry-on", done: false },
        { id: "insurance", label: "Travel insurance and key documents saved offline", done: false },
        { id: "tickets", label: "Attraction and train tickets saved offline", done: false },
      ],
    },
    emergency: {
      Denmark: [
        { label: "Emergency", number: "112", notes: "Police, ambulance, and fire." },
        { label: "Police non-emergency", number: "114", notes: "Use for non-urgent police matters in Denmark." },
        { label: "Medical helpline", number: "1813", notes: "Capital Region urgent medical advice." },
      ],
      Sweden: [
        { label: "Emergency", number: "112", notes: "Police, ambulance, and fire." },
        { label: "Police non-emergency", number: "114 14", notes: "Use for non-urgent police matters in Sweden." },
        { label: "Healthcare advice", number: "1177", notes: "Medical advice line in Sweden." },
      ],
    },
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function withDefaults(value, defaults) {
    if (Array.isArray(defaults)) return Array.isArray(value) ? value : clone(defaults);
    if (!defaults || typeof defaults !== "object") return value === undefined ? defaults : value;
    const out = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    Object.keys(defaults).forEach((key) => {
      out[key] = withDefaults(out[key], defaults[key]);
    });
    return out;
  }

  function normalizeStateShape(s) {
    if (!s || typeof s !== "object") s = emptyState();
    if (!Array.isArray(s.trips)) s.trips = [];
    if (!Array.isArray(s.places)) s.places = [];
    if (typeof s.activeTripId === "undefined") s.activeTripId = null;
    if (!s.meta || typeof s.meta !== "object" || Array.isArray(s.meta)) s.meta = {};
    if (!s.meta.created) s.meta.created = Date.now();
    s.meta.travel = withDefaults(s.meta.travel, DEFAULT_TRAVEL);
    return s;
  }

  function emptyState() {
    return normalizeStateShape({ trips: [], places: [], activeTripId: null, meta: { created: Date.now() } });
  }

  // Normalize a raw place (from seed or parser) into stored form.
  function normPlace(p) {
    return {
      id: p.id || uid(),
      slug: p.slug || slug(p.name),
      name: p.name || "Untitled place",
      desc: p.desc || "",
      category: p.category || "Other",
      sub: p.sub || "",
      loc: p.loc || "Unsorted",
      web: p.web || "",
      maps: p.maps || "",
      lat: typeof p.lat === "number" ? p.lat : null,
      lng: typeof p.lng === "number" ? p.lng : null,
      notes: p.notes || "",
      alt: !!p.alt,
      basecamp: !!p.basecamp,
    };
  }

  // ---- load / save ---------------------------------------------------------
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalizeStateShape(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return null;
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  const subs = new Set();
  function notify() { subs.forEach((fn) => fn(state)); }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  // ---- seeding -------------------------------------------------------------
  function seedFromDefault() {
    const s = window.SEED;
    const trip = Object.assign({ id: uid(), source: "Copenhagen seed" }, s.trip);
    state = emptyState();
    state.trips = [trip];
    state.activeTripId = trip.id;
    state.places = s.places.map(normPlace);
    state.meta.travel = withDefaults(state.meta.travel, DEFAULT_TRAVEL);
    persist(); notify();
  }

  function ensureSeeded() {
    if (!state || !state.trips) { seedFromDefault(); }
    else { state = normalizeStateShape(state); persist(); }
  }

  // ---- queries -------------------------------------------------------------
  const getState = () => state;
  const activeTrip = () =>
    (state.trips || []).find((t) => t.id === state.activeTripId) || (state.trips || [])[0] || null;
  const places = () => state.places || [];
  const placeBySlug = (sl) => state.places.find((p) => p.slug === sl);
  const placeByName = (name) => placeBySlug(slug(name));

  // Match an incoming place to an existing one: exact slug, else a confident
  // fuzzy match (one name fully contains the other). Ambiguous -> no match.
  function matchExisting(np) {
    const exact = placeBySlug(np.slug);
    if (exact) return exact;
    const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\(.*?\)/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
    const n = norm(np.name);
    if (n.split(" ").length < 2 || n.length < 5) return null; // too short to fuzzy safely
    const cands = state.places.filter((p) => {
      const pn = norm(p.name);
      return pn === n || pn.includes(n) || n.includes(pn);
    });
    return cands.length === 1 ? cands[0] : null;
  }

  // Which itinerary days reference a given place (by name match in refs).
  function daysForPlace(name) {
    const trip = activeTrip();
    if (!trip) return [];
    const sl = slug(name);
    return trip.days.filter((d) =>
      (d.items || []).some((it) => (it.refs || []).some((r) => slug(r) === sl))
    );
  }

  // ---- mutations -----------------------------------------------------------
  function setActiveTrip(id) { state.activeTripId = id; persist(); notify(); }

  function updatePlaceNotes(id, notes) {
    const p = state.places.find((x) => x.id === id);
    if (p) { p.notes = notes; persist(); notify(); }
  }

  function getTravel() {
    state = normalizeStateShape(state);
    return state.meta.travel;
  }

  function setTravel(nextTravel) {
    if (!nextTravel || typeof nextTravel !== "object" || Array.isArray(nextTravel)) {
      throw new Error("Travel data must be an object.");
    }
    state = normalizeStateShape(state);
    state.meta.travel = withDefaults(clone(nextTravel), DEFAULT_TRAVEL);
    persist(); notify();
    return state.meta.travel;
  }

  function updateTravelSection(section, value) {
    if (!section || typeof section !== "string") throw new Error("Travel section is required.");
    const next = clone(getTravel());
    next[section] = value;
    return setTravel(next);
  }

  function addPlace(place) {
    const np = normPlace(place || {});
    const ex = matchExisting(np);
    if (ex) {
      Object.keys(np).forEach((key) => {
        const cur = ex[key];
        const incoming = np[key];
        if ((cur === "" || cur == null || cur === "Unsorted" || cur === "Other") && incoming !== "" && incoming != null) {
          ex[key] = incoming;
        }
      });
      persist(); notify();
      return ex;
    }
    state.places.push(np);
    persist(); notify();
    return np;
  }

  function addPlaceFromMapsLink(input) {
    input = input || {};
    return addPlace({
      name: input.name,
      maps: input.maps || input.mapsLink,
      category: input.category || "Other",
      sub: input.sub || "",
      loc: input.loc || "Unsorted",
      notes: input.notes || "",
    });
  }

  // ---- MERGE ENGINE --------------------------------------------------------
  // Given an incoming parse {trip, places}, detect conflicts vs current state.
  // Returns a plan the UI can present BEFORE committing.
  function planImport(incoming) {
    const plan = {
      incoming,
      newPlaces: [],     // places with no existing match
      enriched: [],      // existing places that gain new info automatically (no prompt)
      conflicts: [],     // { slug, existing, incoming, diffs:[fields] } -> real clashes
      tripIsNew: false,
      tripReplaces: null,
    };
    const incPlaces = (incoming.places || []).map(normPlace);
    incPlaces.forEach((np) => {
      const ex = matchExisting(np);
      if (!ex) { plan.newPlaces.push(np); return; }
      // Classify each field. "Weak" values (blank / generic placeholders) never
      // count as meaningful incoming info, so they can't trigger a false conflict.
      const WEAK = new Set(["", "unsorted", "other", "attractions"]);
      const meaningful = (v) => { v = (v || "").trim(); return v && !WEAK.has(v.toLowerCase()); };
      const same = (a, b) => {
        const dec = (s) => { s = (s || "").trim().toLowerCase(); try { s = decodeURIComponent(s.replace(/\+/g, "%20")); } catch (e) {} return s.replace(/\s+/g, " "); };
        a = dec(a); b = dec(b);
        return a === b || (a && b && (a.includes(b) || b.includes(a)));
      };
      const fields = ["desc", "web", "maps", "loc", "category", "sub"];
      const enrich = [];  // existing blank -> incoming fills it (auto-merge, no prompt)
      const clash = [];   // both meaningful & genuinely different -> needs a human choice
      fields.forEach((f) => {
        const a = ex[f], b = np[f];
        if (!meaningful(b)) return;
        if (!meaningful(a)) { enrich.push(f); return; }
        if (!same(a, b)) clash.push(f);
      });
      if (clash.length) {
        plan.conflicts.push({ slug: np.slug, existing: ex, incoming: np, diffs: clash, enrich });
      } else if (enrich.length) {
        plan.enriched.push({ slug: np.slug, existing: ex, incoming: np, enrich });
      }
      // nothing meaningful & new -> silently skip (true dedupe)
    });

    if (incoming.trip) {
      const match = state.trips.find((t) => t.title === incoming.trip.title);
      if (match) plan.tripReplaces = match;
      else plan.tripIsNew = true;
    }
    return plan;
  }

  // Apply a plan. resolutions: { [slug]: "combine" | "replace" | "skip" }
  // tripChoice: "add" | "replace" | "skip"
  function applyImport(plan, resolutions, tripChoice) {
    resolutions = resolutions || {};
    const fillBlanks = (ex, inc) => {
      ["web", "maps", "loc", "category", "sub"].forEach((f) => {
        const cur = (ex[f] || "").trim().toLowerCase();
        if ((!cur || cur === "unsorted" || cur === "other") && inc[f]) ex[f] = inc[f];
      });
      if (ex.lat == null && inc.lat != null) { ex.lat = inc.lat; ex.lng = inc.lng; }
      const a = (ex.desc || "").trim(), b = (inc.desc || "").trim();
      if (b && !a) ex.desc = b;
      else if (b && a && !a.includes(b) && !b.includes(a)) ex.desc = a + " " + b;
    };
    // new places: always add
    plan.newPlaces.forEach((np) => state.places.push(np));
    // enriched: auto-merge new info into blanks, no prompt needed
    (plan.enriched || []).forEach((e) => {
      const ex = state.places.find((p) => p.slug === e.slug);
      if (ex) fillBlanks(ex, e.incoming);
    });
    // conflicts
    plan.conflicts.forEach((c) => {
      const choice = resolutions[c.slug] || "combine";
      const ex = state.places.find((p) => p.slug === c.slug);
      if (!ex) return;
      if (choice === "replace") {
        // incoming supersedes — but keep user notes & coords if incoming lacks them
        const keepNotes = ex.notes, keepLat = ex.lat, keepLng = ex.lng;
        Object.assign(ex, c.incoming);
        if (!c.incoming.notes) ex.notes = keepNotes;
        if (c.incoming.lat == null) ex.lat = keepLat;
        if (c.incoming.lng == null) ex.lng = keepLng;
      } else if (choice === "combine") {
        fillBlanks(ex, c.incoming);
        if (c.incoming.notes && !ex.notes.includes(c.incoming.notes))
          ex.notes = [ex.notes, c.incoming.notes].filter(Boolean).join("\n");
      } // skip -> nothing
    });
    // trip
    if (plan.incoming.trip) {
      const t = plan.incoming.trip;
      if (tripChoice === "replace" && plan.tripReplaces) {
        Object.assign(plan.tripReplaces, t, { id: plan.tripReplaces.id });
        state.activeTripId = plan.tripReplaces.id;
      } else if (tripChoice !== "skip") {
        const trip = Object.assign({ id: uid() }, t);
        state.trips.push(trip);
        state.activeTripId = trip.id;
      }
    }
    persist(); notify();
  }

  function reset() { seedFromDefault(); }
  function wipe() { state = emptyState(); persist(); notify(); }

  function validateRestoreObject(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Backup must be a state object.");
    if ("trips" in obj && !Array.isArray(obj.trips)) throw new Error("Backup trips must be an array.");
    if ("places" in obj && !Array.isArray(obj.places)) throw new Error("Backup places must be an array.");
    if ("meta" in obj && (!obj.meta || typeof obj.meta !== "object" || Array.isArray(obj.meta))) throw new Error("Backup meta must be an object.");
    if ("activeTripId" in obj && obj.activeTripId !== null && typeof obj.activeTripId !== "string") throw new Error("Backup activeTripId must be a string or null.");
  }

  function toJSON() {
    state = normalizeStateShape(state);
    return JSON.stringify(state, null, 2);
  }

  function restoreJSON(jsonTextOrObject) {
    const obj = typeof jsonTextOrObject === "string" ? JSON.parse(jsonTextOrObject) : clone(jsonTextOrObject);
    validateRestoreObject(obj);
    state = normalizeStateShape(obj);
    persist(); notify();
    return state;
  }

  // serialize the active trip + full directory back to markdown (for export/share)
  function toMarkdown() {
    const trip = activeTrip();
    let md = "";
    if (trip) {
      md += `# ${trip.title}\n`;
      if (trip.dates) md += `**Dates:** ${trip.dates}  \n`;
      if (trip.basecamp) md += `**Basecamp:** ${trip.basecamp}  \n`;
      if (trip.blurb) md += `\n*${trip.blurb}*\n`;
      (trip.days || []).forEach((d) => {
        md += `\n## ${d.emoji || ""} ${d.label}: ${d.title}\n`;
        (d.items || []).forEach((it) => { md += `* ${it.t}\n`; });
      });
    }
    md += `\n---\n\n# Places Directory\n`;
    const byCat = {};
    state.places.forEach((p) => { (byCat[p.category] = byCat[p.category] || []).push(p); });
    Object.keys(byCat).forEach((cat) => {
      md += `\n## ${cat}\n`;
      byCat[cat].forEach((p) => {
        let line = `* **${p.name}:** ${p.desc}`;
        const links = [];
        if (p.web) links.push(`[Website](${p.web})`);
        if (p.maps) links.push(`[Map](${p.maps})`);
        if (links.length) line += ` ${links.join(" | ")}`;
        if (p.notes) line += `\n    > ${p.notes.replace(/\n/g, " ")}`;
        md += line + "\n";
      });
    });
    return md;
  }

  // seed immediately on first run so screens never read a null state
  ensureSeeded();

  window.Store = {
    slug, uid, normPlace,
    subscribe, getState, ensureSeeded, seedFromDefault, reset, wipe,
    activeTrip, places, placeBySlug, placeByName, daysForPlace,
    setActiveTrip, updatePlaceNotes,
    getTravel, setTravel, updateTravelSection, addPlace, addPlaceFromMapsLink,
    planImport, applyImport, toMarkdown, toJSON, restoreJSON,
  };
})();
