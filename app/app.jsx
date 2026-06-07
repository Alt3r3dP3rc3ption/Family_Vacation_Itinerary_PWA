/* Root App — tab routing, shared place sheet, persistence wiring. */
function App() {
  const [tab, setTab] = useState("itinerary");
  const [tick, setTick] = useState(0);           // bump to force re-read of store
  const [sheetPlace, setSheetPlace] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // seed on first run + subscribe to store changes
  useEffect(() => {
    window.Store.ensureSeeded();
    const unsub = window.Store.subscribe(() => setTick((t) => t + 1));
    setTick((t) => t + 1);
    return unsub;
  }, []);

  const openPlace = useCallback((p) => { setSheetPlace(p); setSheetOpen(true); }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // when store changes while a sheet is open, refresh the place reference
  useEffect(() => {
    if (sheetPlace) {
      const fresh = window.Store.placeBySlug(sheetPlace.slug);
      if (fresh && fresh !== sheetPlace) setSheetPlace(fresh);
    }
  }, [tick]); // eslint-disable-line

  return (
    <div className="device">
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: tab === "itinerary" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <ItineraryScreen onOpenPlace={openPlace} tick={tick} />
        </div>
        <div style={{ display: tab === "directory" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <DirectoryScreen onOpenPlace={openPlace} tick={tick} />
        </div>
        <div style={{ display: tab === "map" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <MapScreen onOpenPlace={openPlace} active={tab === "map"} tick={tick} />
        </div>
        <div style={{ display: tab === "travel" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <TravelScreen tick={tick} />
        </div>
        <div style={{ display: tab === "import" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <ImportScreen onImported={() => { refresh(); setTab("directory"); }} tick={tick} />
        </div>
        <div style={{ display: tab === "settings" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <SettingsScreen onChanged={refresh} tick={tick} />
        </div>
      </div>

      <PlaceSheet place={sheetPlace} open={sheetOpen} onClose={closeSheet} />
      <TabBar active={tab} onChange={setTab} />
      <ToastHost />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
