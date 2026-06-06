/* Itinerary screen — collapsible day cards with a timeline and link pills. */
function LinkPills({ refs, onOpen }) {
  if (!refs || !refs.length) return null;
  const places = refs.map((r) => window.Store.placeByName(r)).filter(Boolean);
  // unique by id
  const seen = {}; const uniq = places.filter((p) => (seen[p.id] ? false : (seen[p.id] = true)));
  if (!uniq.length) return null;
  return (
    <div className="tl-links">
      {uniq.map((p) => (
        <button key={p.id} className="pill" onClick={() => onOpen(p)}>
          {placeEmoji(p)} {p.name.replace(/\s*\(.*?\)\s*/, "")}
        </button>
      ))}
    </div>
  );
}

function DayCard({ day, index, defaultOpen, onOpenPlace }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"day-card" + (open ? " open" : "")}>
      <button className="day-head" onClick={() => setOpen((o) => !o)}>
        <div className="day-emoji">{day.emoji || "📅"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-label">{day.label}</div>
          <div className="d-title">{day.title}</div>
        </div>
        <Icon.chev className="day-toggle" style={{ width: 9, height: 14 }} />
      </button>
      <div className="day-body">
        <div className="timeline">
          {(day.items || []).map((it, i) => (
            <div className="tl-item" key={i}>
              <div className="tl-text">{mdInline(it.t)}</div>
              <LinkPills refs={it.refs} onOpen={onOpenPlace} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItineraryScreen({ onOpenPlace, tick }) {
  const trip = window.Store.activeTrip();
  if (!trip) {
    return (
      <Screen title="Itinerary">
        <div className="empty"><div className="big">🧭</div><h3>No trip yet</h3><p>Head to the Import tab to add an itinerary in Markdown or PDF.</p></div>
      </Screen>
    );
  }
  // today highlight
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIdx = (trip.days || []).findIndex((d) => d.date === todayStr);

  return (
    <Screen title="Itinerary" subtitle={trip.title + " · " + (trip.dates || "")}>
      <div className="info-card fade-in" style={{ marginTop: 4 }}>
        <strong>{trip.title}</strong>
        {trip.blurb && <div style={{ marginTop: 6, color: "var(--label-3)" }}>{trip.blurb}</div>}
        {trip.basecamp && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.pin style={{ width: 16, height: 16, color: "var(--accent)" }} />
            <span style={{ fontSize: 13 }}>{trip.basecamp}</span>
          </div>
        )}
      </div>
      <div style={{ height: 14 }} />
      {(trip.days || []).map((d, i) => (
        <DayCard key={i} day={d} index={i}
          defaultOpen={todayIdx === -1 ? i === 0 : i === todayIdx}
          onOpenPlace={onOpenPlace} />
      ))}
      <div style={{ height: 20 }} />
    </Screen>
  );
}

window.ItineraryScreen = ItineraryScreen;
