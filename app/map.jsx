/* Map screen — Leaflet pins colored by category. */
function MapScreen({ onOpenPlace, active, tick }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [ready, setReady] = useState(!!window.L);

  // ensure Leaflet is loaded
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready || !active) return;
    const L = window.L;
    if (!mapRef.current) {
      const map = L.map("leaflet-map", { zoomControl: false, attributionControl: false }).setView([55.75, 11.8], 7);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd",
      }).addTo(map);
      L.control.attribution({ prefix: false }).addAttribution("© OpenStreetMap, © CARTO").addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      mapRef.current = map;
    }
    const map = mapRef.current;
    if (layerRef.current) layerRef.current.remove();
    const group = L.layerGroup().addTo(map);
    layerRef.current = group;

    const pts = window.Store.places().filter((p) => p.lat != null && p.lng != null);
    const latlngs = [];
    pts.forEach((p) => {
      const color = catColor(p.category);
      const html = `<div style="background:${color};width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:grid;place-items:center;"><span style="transform:rotate(45deg);font-size:10px">${placeEmoji(p)}</span></div>`;
      const icon = L.divIcon({ html, className: "", iconSize: [20, 20], iconAnchor: [10, 20], popupAnchor: [0, -18] });
      const mk = L.marker([p.lat, p.lng], { icon }).addTo(group);
      const links = [];
      if (p.web) links.push(`<a href="${p.web}" target="_blank" rel="noopener">Website</a>`);
      if (p.maps) links.push(`<a href="${p.maps}" target="_blank" rel="noopener" style="background:rgba(31,157,87,.14);color:#1f9d57">Directions</a>`);
      mk.bindPopup(
        `<div class="pin-pop-name">${p.name}</div>` +
        `<div style="font-size:13px;color:#666;line-height:1.35">${p.desc || ""}</div>` +
        (links.length ? `<div class="pin-pop-links">${links.join("")}</div>` : "")
      );
      mk.on("popupopen", () => {
        const el = document.querySelector(".pin-pop-name");
        if (el) el.style.cursor = "pointer";
      });
      latlngs.push([p.lat, p.lng]);
    });
    if (latlngs.length) {
      try { map.fitBounds(latlngs, { padding: [50, 50], maxZoom: 13 }); } catch (e) {}
    }
    setTimeout(() => map.invalidateSize(), 80);
  }, [ready, active, tick]);

  // recalc size when becoming active
  useEffect(() => { if (active && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 120); }, [active]);

  return (
    <React.Fragment>
      <NavBar title="Map" scrolled={true} />
      <div className="map-wrap">
        <div id="leaflet-map" style={{ bottom: 0 }} />
        {!ready && <div className="empty" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><div><div className="big">🗺️</div><p>Loading map…</p></div></div>}
        <div className="map-legend">
          {["Attractions", "Food & Dining", "Transit", "Stays"].map((c) => (
            <div className="legend-row" key={c}>
              <span className="legend-dot" style={{ background: catColor(c) }} />{c}
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

window.MapScreen = MapScreen;
