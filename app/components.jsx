/* Shared UI components + icons. Exported to window for cross-file use. */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- Icons (stroke = currentColor) ---------- */
const Icon = {
  itinerary: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 9h17M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="13" r="1.1" fill="currentColor"/><circle cx="12" cy="13" r="1.1" fill="currentColor"/><circle cx="8" cy="17" r="1.1" fill="currentColor"/></svg>),
  directory: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 6.5h4l1.5 2H20v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  map: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6"/></svg>),
  importt: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15V4m0 0L8 8m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 14v3.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  settings: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  globe: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" stroke="currentColor" strokeWidth="1.6"/></svg>),
  pin: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6"/></svg>),
  share: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 11H5.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18.5 11H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  doc: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 3.5h7l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M13 3.5V8.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  copy: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 16V5.5A1.5 1.5 0 0 1 6.5 4H15" stroke="currentColor" strokeWidth="1.6"/></svg>),
  trash: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 6.5h14M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M7 6.5 7.8 19A1.5 1.5 0 0 0 9.3 20.5h5.4A1.5 1.5 0 0 0 16.2 19L17 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  refresh: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12a7 7 0 1 1-2.1-5M19 5v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  chev: (p) => (<svg viewBox="0 0 8 13" fill="none" {...p}><path d="M1.5 1.5 6 6.5l-4.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

/* ---------- category styling ---------- */
const CAT_META = {
  "Attractions": { c: "#0E8A8A", e: "🎡" },
  "Food & Dining": { c: "#FF9500", e: "🍴" },
  "Transit": { c: "#3478F7", e: "🚆" },
  "Stays": { c: "#AF52DE", e: "🏠" },
  "Other": { c: "#8E8E93", e: "📌" },
};
const SUB_EMOJI = {
  "Amusement & Gaming": "🎮", "Museums & History": "🏛️", "Parks & Outdoors": "🌳",
  "Shopping & Leisure": "🛍️", "Cafes & Quick Bites": "☕", "Food Halls & Markets": "🥘",
  "Restaurants & Squares": "🍽️", "Hubs & Infrastructure": "🚉", "Accommodations": "🛏️",
};
const placeEmoji = (p) => SUB_EMOJI[p.sub] || (CAT_META[p.category] || CAT_META.Other).e;
const catColor = (c) => (CAT_META[c] || CAT_META.Other).c;

/* ---------- inline markdown (bold / italic) ---------- */
function mdInline(text) {
  const nodes = []; let key = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] != null) nodes.push(<strong key={key++}>{m[2]}</strong>);
    else nodes.push(<em key={key++}>{m[3] || m[4]}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* ---------- Nav bar with scroll-collapse large title ---------- */
function NavBar({ title, subtitle, scrolled, left, right }) {
  return (
    <div className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="nav-row">
        <div style={{ flex: 1 }}>{left}</div>
        <div className="nav-small-title">{title}</div>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{right}</div>
      </div>
      <h1 className="nav-large">{title}</h1>
      {subtitle && <div className="nav-sub" style={{ opacity: scrolled ? 0 : 1, height: scrolled ? 0 : "auto", transition: "opacity .2s" }}>{subtitle}</div>}
    </div>
  );
}

/* A screen: nav bar that collapses as the scroll body scrolls. */
function Screen({ title, subtitle, right, children }) {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e) => setScrolled(e.target.scrollTop > 24);
  return (
    <React.Fragment>
      <NavBar title={title} subtitle={subtitle} scrolled={scrolled} right={right} />
      <div className="scroll" onScroll={onScroll}>{children}</div>
    </React.Fragment>
  );
}

/* ---------- Tab bar ---------- */
const TABS = [
  { id: "itinerary", label: "Itinerary", icon: Icon.itinerary },
  { id: "directory", label: "Directory", icon: Icon.directory },
  { id: "map", label: "Map", icon: Icon.map },
  { id: "import", label: "Import", icon: Icon.importt },
  { id: "settings", label: "Settings", icon: Icon.settings },
];
function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const I = t.icon;
        return (
          <button key={t.id} className={"tab" + (active === t.id ? " active" : "")} onClick={() => onChange(t.id)}>
            <I /><span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Bottom sheet ---------- */
function Sheet({ open, onClose, children }) {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShow(true))); }
    else { setShow(false); const t = setTimeout(() => setMounted(false), 340); return () => clearTimeout(t); }
  }, [open]);
  if (!mounted) return null;
  return (
    <React.Fragment>
      <div className={"sheet-scrim" + (show ? " show" : "")} onClick={onClose} />
      <div className={"sheet" + (show ? " show" : "")}>
        <div className="sheet-grip" />
        {children}
      </div>
    </React.Fragment>
  );
}

/* ---------- Toast ---------- */
let _toastFn = null;
function ToastHost() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const tref = useRef(null);
  useEffect(() => {
    _toastFn = (m) => {
      setMsg(m); setShow(true);
      clearTimeout(tref.current);
      tref.current = setTimeout(() => setShow(false), 2200);
    };
    return () => { _toastFn = null; };
  }, []);
  return <div className={"toast" + (show ? " show" : "")}>{msg}</div>;
}
const toast = (m) => { if (_toastFn) _toastFn(m); };

/* ---------- List row ---------- */
function Row({ icon, color, title, sub, trailing, onClick, alt }) {
  return (
    <button className="row" onClick={onClick}>
      {icon != null && <div className="row-icon" style={{ background: color }}>{icon}</div>}
      <div className="row-body">
        <div className="row-title">{title}</div>
        {sub && <div className="row-sub">{sub}</div>}
      </div>
      <div className="row-trail">
        {alt && <span className="tag-alt">Alt</span>}
        {trailing}
        <Icon.chev className="chev" />
      </div>
    </button>
  );
}

Object.assign(window, {
  Icon, CAT_META, SUB_EMOJI, placeEmoji, catColor, mdInline,
  NavBar, Screen, TabBar, Sheet, Sheet, ToastHost, toast, Row,
  useState, useEffect, useRef, useCallback,
});
