/* Import screen — upload Markdown/PDF, parse, review merge plan, resolve conflicts. */
function ImportScreen({ onImported, tick }) {
  const [stage, setStage] = useState("drop"); // drop | parsing | review
  const [plan, setPlan] = useState(null);
  const [resolutions, setResolutions] = useState({});
  const [tripChoice, setTripChoice] = useState("add");
  const [fileNames, setFileNames] = useState([]);
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setErr(""); setStage("parsing"); setFileNames(arr.map((f) => f.name));
    try {
      // parse all, fold into one incoming bundle
      const merged = { trip: null, places: [] };
      const bySlug = {};
      for (const f of arr) {
        const r = await window.Parser.parseFile(f);
        if (r.trip && !merged.trip) merged.trip = r.trip;
        (r.places || []).forEach((p) => {
          const sl = p.slug || window.Store.slug(p.name);
          if (bySlug[sl]) Object.assign(bySlug[sl], Object.fromEntries(Object.entries(p).filter(([k, v]) => v && !bySlug[sl][k])));
          else { bySlug[sl] = Object.assign({}, p, { slug: sl }); merged.places.push(bySlug[sl]); }
        });
      }
      if (!merged.trip && !merged.places.length) {
        setErr("Couldn't find any itinerary or places in that file. Make sure it's a Markdown or PDF trip document.");
        setStage("drop"); return;
      }
      const p = window.Store.planImport(merged);
      const res = {};
      p.conflicts.forEach((c) => { res[c.slug] = "combine"; });
      setResolutions(res);
      setTripChoice(p.tripReplaces ? "replace" : "add");
      setPlan(p);
      setStage("review");
    } catch (e) {
      setErr("Import failed: " + (e.message || e));
      setStage("drop");
    }
  }

  function commit() {
    window.Store.applyImport(plan, resolutions, plan.incoming.trip ? tripChoice : "skip");
    const added = plan.newPlaces.length;
    const merged = plan.enriched.length + Object.values(resolutions).filter((r) => r !== "skip").length;
    toast(`Imported · ${added} new, ${merged} merged`);
    setStage("drop"); setPlan(null); setFileNames([]);
    onImported();
  }

  // ---- DROP STAGE ----
  if (stage !== "review") {
    return (
      <Screen title="Import" subtitle="Add an itinerary or places directory">
        <input ref={inputRef} type="file" accept=".md,.markdown,.txt,.pdf,text/markdown,text/plain,application/pdf"
          multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        <div
          className={"drop" + (over ? " over" : "")}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {stage === "parsing" ? (
            <React.Fragment><div className="big">⏳</div><h3>Reading…</h3><p>{fileNames.join(", ")}</p></React.Fragment>
          ) : (
            <React.Fragment>
              <div className="big">📄</div>
              <h3>Drop a file or tap to choose</h3>
              <p>Markdown (.md) or PDF · itinerary, places directory, or both. Select several at once to merge.</p>
            </React.Fragment>
          )}
        </div>

        {err && <div className="info-card" style={{ color: "#ff3b30", borderLeft: "3px solid #ff3b30" }}>{err}</div>}

        <button className="btn secondary" style={{ width: "auto", margin: "16px 16px 0" }} onClick={() => inputRef.current && inputRef.current.click()}>
          <Icon.doc style={{ width: 18, height: 18 }} /> Choose file
        </button>

        <div className="info-card">
          <strong>How merging works</strong>
          <div style={{ marginTop: 6 }}>New places are added automatically. When an uploaded place matches one you already have, the app asks whether to <strong>combine</strong> the details or let the new entry <strong>supersede</strong> the old one — so nothing is duplicated and you stay in control.</div>
        </div>
      </Screen>
    );
  }

  // ---- REVIEW STAGE ----
  const setRes = (slug, v) => setResolutions((r) => Object.assign({}, r, { [slug]: v }));
  return (
    <Screen title="Review Import" subtitle={fileNames.join(", ")}>
      <div className="review-summary">
        <div className="stat add"><div className="n">{plan.newPlaces.length}</div><div className="l">New places</div></div>
        <div className="stat"><div className="n">{plan.enriched.length}</div><div className="l">Auto-merged</div></div>
        <div className="stat conf"><div className="n">{plan.conflicts.length}</div><div className="l">To resolve</div></div>
      </div>

      {plan.incoming.trip && (
        <React.Fragment>
          <div className="section-hdr">Itinerary · {plan.incoming.trip.title}</div>
          <div className="conflict">
            <div className="conflict-h">
              <div className="nm">{plan.tripReplaces ? "Matches an existing trip" : "New trip"}</div>
              <div className="df">{(plan.incoming.trip.days || []).length} days · {plan.incoming.trip.dates || "no dates"}</div>
            </div>
            <div className="choice">
              {plan.tripReplaces && <button aria-selected={tripChoice === "replace"} onClick={() => setTripChoice("replace")}>Replace</button>}
              <button aria-selected={tripChoice === "add"} onClick={() => setTripChoice("add")}>{plan.tripReplaces ? "Keep both" : "Add trip"}</button>
              <button aria-selected={tripChoice === "skip"} onClick={() => setTripChoice("skip")}>Skip</button>
            </div>
          </div>
        </React.Fragment>
      )}

      {plan.conflicts.length > 0 && (
        <div className="section-hdr">Resolve {plan.conflicts.length} overlapping {plan.conflicts.length === 1 ? "place" : "places"}</div>
      )}
      {plan.conflicts.length === 0 && plan.newPlaces.length === 0 && plan.enriched.length > 0 && (
        <div className="info-card" style={{ marginTop: 4 }}>
          <strong>No conflicts.</strong> {plan.enriched.length} existing {plan.enriched.length === 1 ? "place gains" : "places gain"} new details (links, locations) that fill in blanks — nothing will be overwritten. Just tap Apply.
        </div>
      )}
      {plan.conflicts.map((c) => (
        <div className="conflict" key={c.slug}>
          <div className="conflict-h">
            <div className="nm">{placeEmoji(c.existing)} {c.existing.name}</div>
            <div className="df">New info in: {c.diffs.join(", ")}</div>
          </div>
          <div className="diff-block">
            {c.diffs.slice(0, 4).map((f) => (
              <div className="diff-line" key={f}>
                <span className="k">{f}: </span>
                {(c.existing[f] || "").trim() && <span className="diff-old">{shortVal(c.existing[f])} </span>}
                <span className="diff-new">{shortVal(c.incoming[f])}</span>
              </div>
            ))}
          </div>
          <div className="choice">
            <button aria-selected={resolutions[c.slug] === "combine"} onClick={() => setRes(c.slug, "combine")}>Combine</button>
            <button aria-selected={resolutions[c.slug] === "replace"} onClick={() => setRes(c.slug, "replace")}>Supersede</button>
            <button aria-selected={resolutions[c.slug] === "skip"} onClick={() => setRes(c.slug, "skip")}>Keep mine</button>
          </div>
        </div>
      ))}

      {plan.newPlaces.length > 0 && (
        <React.Fragment>
          <div className="section-hdr">Adding {plan.newPlaces.length} new {plan.newPlaces.length === 1 ? "place" : "places"}</div>
          <div className="group">
            {plan.newPlaces.slice(0, 40).map((p) => (
              <div className="row" key={p.slug}>
                <div className="row-icon" style={{ background: catColor(p.category) }}>{placeEmoji(p)}</div>
                <div className="row-body"><div className="row-title">{p.name}</div>{p.desc && <div className="row-sub">{p.desc}</div>}</div>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}

      <div style={{ display: "flex", gap: 10, margin: "22px 16px 8px" }}>
        <button className="btn secondary" onClick={() => { setStage("drop"); setPlan(null); }}>Cancel</button>
        <button className="btn" onClick={commit}>Apply Import</button>
      </div>
      <div style={{ height: 20 }} />
    </Screen>
  );
}

function shortVal(v) {
  v = (v || "").toString().replace(/^https?:\/\//, "").trim();
  return v.length > 46 ? v.slice(0, 46) + "…" : v;
}

window.ImportScreen = ImportScreen;
