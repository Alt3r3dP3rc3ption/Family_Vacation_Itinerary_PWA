/* Settings & Share screen — Share Sheet, export, trip switching, reset. */
function SettingsScreen({ onChanged, tick }) {
  const st = window.Store.getState();
  const trip = window.Store.activeTrip();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const md = () => window.Store.toMarkdown();

  async function shareSheet() {
    const text = md();
    const fileName = (trip ? trip.title : "trip").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".md";
    try {
      const file = new File([text], fileName, { type: "text/markdown" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: trip ? trip.title : "Trip itinerary" });
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    try {
      if (navigator.share) { await navigator.share({ title: trip ? trip.title : "Trip", text }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    // fallback
    downloadMd();
    toast("Sharing not supported — exported file instead");
  }

  function downloadMd() {
    const blob = new Blob([md()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (trip ? trip.title : "trip").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".md";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Markdown exported");
  }

  async function copyText() {
    try { await navigator.clipboard.writeText(md()); toast("Copied to clipboard"); }
    catch (e) { toast("Couldn't copy"); }
  }

  return (
    <Screen title="Settings" subtitle="Share, export & manage your data">
      {/* Share group */}
      <div className="section-hdr">Share & Export</div>
      <div className="group">
        <Row icon={<Icon.share style={{ width: 18, height: 18 }} />} color="var(--accent)"
          title="Share via iOS Share Sheet" sub="Send to Notes, Messages, Mail…" onClick={shareSheet} />
        <Row icon={<Icon.doc style={{ width: 18, height: 18 }} />} color="#3478F7"
          title="Export Markdown file" sub="Download a .md backup" onClick={downloadMd} />
        <Row icon={<Icon.copy style={{ width: 18, height: 18 }} />} color="#8E8E93"
          title="Copy as text" sub="Paste anywhere" onClick={copyText} />
      </div>
      <div className="info-card">
        <strong>About the Notes app & sharing</strong>
        <div style={{ marginTop: 6 }}>Your trip is stored privately on this device. Tap <strong>Share</strong> to drop a copy into Apple Notes (or any app) whenever you want to share it — you decide who sees it and when.</div>
      </div>

      {/* Trips */}
      {st.trips.length > 1 && (
        <React.Fragment>
          <div className="section-hdr">Trips</div>
          <div className="group">
            {st.trips.map((t) => (
              <Row key={t.id} icon={t.id === st.activeTripId ? "✓" : "🧳"}
                color={t.id === st.activeTripId ? "var(--accent)" : "#8E8E93"}
                title={t.title} sub={t.dates}
                onClick={() => { window.Store.setActiveTrip(t.id); onChanged(); toast("Switched trip"); }} />
            ))}
          </div>
        </React.Fragment>
      )}

      {/* Install */}
      <div className="section-hdr">Install</div>
      <div className="info-card" style={{ margin: "0 16px" }}>
        <strong>Add to Home Screen</strong>
        <div style={{ marginTop: 6 }}>In Safari, tap the <strong>Share</strong> button, then <strong>“Add to Home Screen.”</strong> The app runs full-screen and works offline once loaded.</div>
      </div>

      {/* Data */}
      <div className="section-hdr">Data</div>
      <div className="group">
        <Row icon={<Icon.refresh style={{ width: 18, height: 18 }} />} color="#FF9500"
          title="Restore sample trip" sub="Reload the Copenhagen demo data"
          onClick={() => setConfirmReset(true)} />
      </div>
      <div style={{ margin: "10px 16px 0" }}>
        {!confirmWipe ? (
          <button className="btn danger" onClick={() => setConfirmWipe(true)}>
            <Icon.trash style={{ width: 18, height: 18 }} /> Erase all data
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn secondary" onClick={() => setConfirmWipe(false)}>Cancel</button>
            <button className="btn danger" style={{ background: "#ff3b30", color: "#fff" }}
              onClick={() => { window.Store.wipe(); setConfirmWipe(false); onChanged(); toast("All data erased"); }}>Erase everything</button>
          </div>
        )}
      </div>

      {confirmReset && (
        <div style={{ margin: "10px 16px 0", display: "flex", gap: 10 }}>
          <button className="btn secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
          <button className="btn" onClick={() => { window.Store.reset(); setConfirmReset(false); onChanged(); toast("Sample trip restored"); }}>Restore demo</button>
        </div>
      )}

      <div style={{ textAlign: "center", color: "var(--label-4)", fontSize: 12, padding: "28px 0 12px" }}>
        Trip Itinerary · stored on this device
      </div>
    </Screen>
  );
}

window.SettingsScreen = SettingsScreen;
