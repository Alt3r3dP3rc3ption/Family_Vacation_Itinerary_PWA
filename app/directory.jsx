/* Directory screen — browse places By Category or By Location, with search. */
const CAT_ORDER = ["Attractions", "Food & Dining", "Transit", "Stays", "Other"];
const SUB_ORDER = ["Amusement & Gaming", "Museums & History", "Parks & Outdoors", "Shopping & Leisure",
  "Cafes & Quick Bites", "Food Halls & Markets", "Restaurants & Squares", "Hubs & Infrastructure", "Accommodations"];
const LOC_ORDER = ["Copenhagen · Indre By", "Copenhagen · Suburbs", "Herning", "Malmö"];

function groupBy(arr, key) {
  const g = {};
  arr.forEach((p) => { const k = p[key] || "Other"; (g[k] = g[k] || []).push(p); });
  return g;
}
function orderedKeys(g, order) {
  const keys = Object.keys(g);
  return keys.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}

function DirectoryScreen({ onOpenPlace, tick }) {
  const [mode, setMode] = useState("category"); // category | location
  const [q, setQ] = useState("");
  const all = window.Store.places();

  const filtered = q.trim()
    ? all.filter((p) => (p.name + " " + p.desc + " " + p.loc + " " + p.sub).toLowerCase().includes(q.toLowerCase()))
    : all;

  let groups, order, subgroup = false;
  if (mode === "category") { groups = groupBy(filtered, "category"); order = CAT_ORDER; subgroup = true; }
  else { groups = groupBy(filtered, "loc"); order = LOC_ORDER; }

  const renderRows = (list) =>
    list.slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
      <Row key={p.id}
        icon={placeEmoji(p)} color={catColor(p.category)}
        title={p.name} sub={p.desc} alt={p.alt}
        onClick={() => onOpenPlace(p)} />
    ));

  return (
    <Screen title="Directory" subtitle={all.length + " places saved"}
      right={null}>
      <div className="segmented">
        <button aria-selected={mode === "category"} onClick={() => setMode("category")}>By Category</button>
        <button aria-selected={mode === "location"} onClick={() => setMode("location")}>By Location</button>
      </div>

      <div style={{ margin: "0 16px 4px" }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search places"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 16, fontFamily: "inherit",
            background: "var(--bg-elev)", border: "none", borderRadius: 10,
            boxShadow: "var(--shadow-card)", color: "var(--label)",
          }} />
      </div>

      {filtered.length === 0 && (
        <div className="empty"><div className="big">🔍</div><h3>No matches</h3><p>Try a different search term.</p></div>
      )}

      {orderedKeys(groups, order).map((gk) => {
        const list = groups[gk];
        if (mode === "category" && subgroup) {
          const subs = groupBy(list, "sub");
          return (
            <React.Fragment key={gk}>
              <div className="section-hdr" style={{ color: catColor(gk) }}>
                {(CAT_META[gk] || CAT_META.Other).e} {gk}
                <span className="count">· {list.length}</span>
              </div>
              {orderedKeys(subs, SUB_ORDER).map((sk) => (
                <React.Fragment key={sk}>
                  {sk && <div style={{ fontSize: 13, fontWeight: 600, color: "var(--label-3)", padding: "12px 20px 6px" }}>{SUB_EMOJI[sk] || ""} {sk}</div>}
                  <div className="group" style={{ marginBottom: 4 }}>{renderRows(subs[sk])}</div>
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={gk}>
            <div className="section-hdr">📍 {gk}<span className="count">· {list.length}</span></div>
            <div className="group">{renderRows(list)}</div>
          </React.Fragment>
        );
      })}
      <div style={{ height: 24 }} />
    </Screen>
  );
}

window.DirectoryScreen = DirectoryScreen;
