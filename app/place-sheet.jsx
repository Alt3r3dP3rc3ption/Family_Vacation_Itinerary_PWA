/* Place detail bottom sheet — shared by Itinerary, Directory, Map. */
function PlaceSheet({ place, open, onClose }) {
  const [notes, setNotes] = useState("");
  useEffect(() => { setNotes(place ? place.notes || "" : ""); }, [place]);
  if (!place) return <Sheet open={open} onClose={onClose}><div /></Sheet>;

  const days = window.Store.daysForPlace(place.name);
  const saveNotes = (v) => { setNotes(v); window.Store.updatePlaceNotes(place.id, v); };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="sheet-head">
        <div>
          <div className="sheet-title">{place.name}</div>
        </div>
        <button className="sheet-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="sheet-body">
        <div className="meta-chips">
          <span className="chip" style={{ color: catColor(place.category), fontWeight: 600 }}>
            {placeEmoji(place)} {place.sub || place.category}
          </span>
          <span className="chip">📍 {place.loc}</span>
          {place.alt && <span className="chip">Alternative option</span>}
          {place.basecamp && <span className="chip">🏠 Basecamp</span>}
        </div>

        {place.desc && <p className="sheet-desc">{place.desc}</p>}

        <div className="action-row">
          {place.web && (
            <a className="action-btn" href={place.web} target="_blank" rel="noopener">
              <Icon.globe className="ico" /><span>Website</span>
            </a>
          )}
          {place.maps && (
            <a className="action-btn green" href={place.maps} target="_blank" rel="noopener">
              <Icon.pin className="ico" /><span>Directions</span>
            </a>
          )}
          {!place.web && !place.maps && (
            <div className="action-btn" style={{ color: "var(--label-3)", pointerEvents: "none" }}>
              <Icon.pin className="ico" /><span>No links yet</span>
            </div>
          )}
        </div>

        {days.length > 0 && (
          <React.Fragment>
            <div className="section-hdr" style={{ padding: "4px 0 8px" }}>On your itinerary</div>
            <div className="appears">
              {days.map((d, i) => (
                <div className="appears-row" key={i}>
                  <span className="e">{d.emoji}</span>
                  <div><strong>{d.label}</strong> · {d.title}</div>
                </div>
              ))}
            </div>
          </React.Fragment>
        )}

        <div className="section-hdr" style={{ padding: "18px 0 8px" }}>My notes</div>
        <textarea
          className="notes-field"
          placeholder="Add a private note — reservation time, who's going, what to order…"
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
        />
      </div>
    </Sheet>
  );
}

window.PlaceSheet = PlaceSheet;
