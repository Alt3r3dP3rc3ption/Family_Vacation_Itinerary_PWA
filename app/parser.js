/* Parser: turns uploaded Markdown or PDF text into a normalized {trip, places}.
   Tailored to the itinerary/directory format but tolerant of generic markdown.
   Exposes window.Parser. */
(function () {
  const slug = (s) => window.Store.slug(s);

  // pull every [label](url) out of a string, return cleaned text + links
  function extractLinks(line) {
    const links = [];
    const re = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      const label = m[1].replace(/[🌐📍✈️🧳🛡️👑🎢⛏️🇸🇪🧙🛫]/g, "").trim();
      links.push({ label, url: m[2] });
    }
    const clean = line.replace(re, "").replace(/\s{2,}/g, " ").trim();
    return { clean, links };
  }

  function classifyLink(l) {
    if (/google\.[^/]+\/maps|maps\.app|maps\.google/i.test(l.url)) return "maps";
    return "web";
  }

  const LEAD_EMOJI = /^[\s>*-]*([\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2700-\u27BF\uFE0F✈️]+)\s*/u;

  // ---- Markdown ------------------------------------------------------------
  function parseMarkdown(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const result = { trip: null, places: [] };
    const placeMap = {}; // slug -> place

    function upsertPlace(name, fields) {
      const sl = slug(name);
      if (!sl) return null;
      if (!placeMap[sl]) placeMap[sl] = { name: name.trim(), slug: sl };
      Object.assign(placeMap[sl], Object.fromEntries(
        Object.entries(fields || {}).filter(([k, v]) => v != null && v !== "" && !placeMap[sl][k])
      ));
      return placeMap[sl];
    }

    // pass to detect a trip (itinerary): first H1 + day-like H2s
    let title = "", dates = "", basecamp = "", blurb = "";
    const days = [];
    let curDay = null;
    let curCategory = "", curSub = "";
    let inLocXref = false;   // true inside a "by location" cross-reference section (Part 2)
    let lastPlace = null;    // last real place named in the current day (for link association)

    const dayHeader = /^##\s+(.*)$/;        // any H2
    const looksLikeDay = (h) =>
      /\b(mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/i.test(h)
      || /\d{1,2}([:/.-]\d{1,2})/.test(h)
      || /\bday\s*\d/i.test(h);

    for (let i = 0; i < lines.length; i++) {
      let raw = lines[i];
      const line = raw.trim();
      if (!line) continue;

      // H1 title
      if (/^#\s+/.test(line) && !title) { title = line.replace(/^#\s+/, "").trim(); continue; }
      if (/^#\s+/.test(line)) { // a second H1 (e.g. "Directory") -> section reset
        curCategory = line.replace(/^#\s+/, "").trim(); curSub = ""; curDay = null; continue;
      }

      // metadata lines
      let mm;
      if ((mm = line.match(/^\*\*Dates?:\*\*\s*(.+)$/i))) { dates = extractLinks(mm[1]).clean; continue; }
      if ((mm = line.match(/^\*\*Basecamp:\*\*\s*(.+)$/i))) { basecamp = extractLinks(mm[1]).clean; continue; }
      if (/^\*[^*].*\*$/.test(line) && !blurb && !curDay && line.length < 240 && /^\*.+\*$/.test(line) && !line.startsWith("**")) {
        blurb = line.replace(/^\*|\*$/g, "").trim(); continue;
      }

      // H2 -> day or category
      let h2;
      if ((h2 = line.match(dayHeader))) {
        const head = h2[1].trim();
        const em = (head.match(LEAD_EMOJI) || [])[1] || "";
        const headClean = head.replace(LEAD_EMOJI, "").trim();
        if (looksLikeDay(headClean)) {
          // split "Friday, June 12: Departure" -> label / title
          const parts = headClean.split(/:\s*/);
          const label = (parts[0] || headClean).trim();
          const dtitle = (parts.slice(1).join(": ") || "").trim();
          curDay = { label, title: dtitle || label, emoji: em, items: [] };
          lastPlace = null;
          days.push(curDay);
        } else {
          // a "by location" cross-reference section re-lists places already defined
          // by category, so don't mint new places from it
          if (/by location/i.test(headClean)) inLocXref = true;
          else if (/by category|^part\s*1/i.test(headClean)) inLocXref = false;
          curCategory = headClean.replace(/^Part\s*\d+[:.]?\s*/i, "").trim() || curCategory;
          curDay = null;
        }
        continue;
      }

      // H3 / H4 -> category or subcategory in directory
      let h3;
      if ((h3 = line.match(/^####?\s+(.*)$/))) {
        const t = h3[1].replace(/^\d+\.\s*/, "").trim();
        if (/^###\s/.test(line)) { curCategory = t; curSub = ""; }
        else curSub = t;
        curDay = null; continue;
      }

      // bold-only line as subcategory heading: **Museums & History**
      if (/^\*\*[^*]+\*\*$/.test(line) && !curDay) {
        curSub = line.replace(/\*\*/g, "").trim(); continue;
      }

      // list item
      if (/^[*+-]\s+/.test(line)) {
        const body = line.replace(/^[*+-]\s+/, "");
        const { clean, links } = extractLinks(body);

        // directory entry: "**Name:** description"
        const dirM = clean.match(/^\*\*([^*]+?):?\*\*:?\s*(.*)$/);
        const isDirectory = dirM && !curDay && !inLocXref;
        if (isDirectory) {
          const name = dirM[1].trim();
          const desc = dirM[2].replace(/\*?\(.*?discussed.*?\)\*?/i, "").trim();
          const isAlt = /alternative|discussed/i.test(clean);
          const web = links.filter((l) => classifyLink(l) === "web")[0];
          const maps = links.filter((l) => classifyLink(l) === "maps")[0];
          upsertPlace(name, {
            desc, category: curCategory || "Other", sub: curSub || "",
            web: web ? web.url : "", maps: maps ? maps.url : "", alt: isAlt || undefined,
          });
          continue;
        }

        // itinerary bullet -> add to day, and harvest places from bold names + links
        if (curDay) {
          const refs = [];
          // Walk the ORIGINAL bullet in order, attaching each link to the
          // nearest preceding bold place name (so multi-place bullets don't
          // cross-wire each other's links).
          const isLabel = (n) =>
            n.length <= 2 ||
            /^(morning|afternoon|evening|lunch|dinner|midday|tip|highlight|pro-tip|transit tip|check-in|night|late|flight|for |team |dropbags|drop bags)/i.test(n) ||
            /:$/.test(n) && /^(flight|transit)/i.test(n);
          const tokenRe = /\*\*([^*]+?)\*\*|\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
          let tm;
          const placesOnLine = [];
          let lineAnchor = null; // nearest preceding place ON this same line
          while ((tm = tokenRe.exec(body)) !== null) {
            if (tm[1] != null) {
              const n = tm[1].replace(/:$/, "").trim();
              if (isLabel(n)) continue;
              lineAnchor = n; placesOnLine.push(n); refs.push(n); upsertPlace(n, {});
            } else {
              const url = tm[3];
              const kind = /google\.[^/]+\/maps|maps\.app|maps\.google/i.test(url) ? "maps" : "web";
              // same-line place wins; else fall back to a single-place parent bullet
              const target = lineAnchor || lastPlace;
              if (target) upsertPlace(target, kind === "maps" ? { maps: url } : { web: url });
            }
          }
          // Only carry a place to child bullets when this line named exactly one
          // (a multi-place line is ambiguous, so links there stay on their own line).
          if (placesOnLine.length === 1) lastPlace = placesOnLine[0];
          else if (placesOnLine.length > 1) lastPlace = null;
          curDay.items.push({ t: body, refs });
        }
        continue;
      }
    }

    if (title && days.length) {
      result.trip = {
        title, subtitle: "Itinerary", dates, basecamp,
        basecampMaps: "", blurb, days,
        source: "Imported markdown",
      };
    }
    result.places = Object.values(placeMap).filter((p) => p.name);
    return result;
  }

  // ---- PDF (best-effort) ---------------------------------------------------
  async function pdfToText(arrayBuffer) {
    if (!window.pdfjsLib) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let out = "";
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      // reconstruct lines by y-position
      let lastY = null, line = "";
      tc.items.forEach((it) => {
        const y = Math.round(it.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 4) { out += line.trim() + "\n"; line = ""; }
        line += it.str + (it.hasEOL ? "\n" : " ");
        lastY = y;
      });
      out += line + "\n";
    }
    return out;
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // Heuristic for plain (non-markdown) PDF text: detect "Name – description" + bare URLs.
  function parsePlainText(text) {
    // If it still has markdown markers, reuse markdown parser.
    if (/^#{1,3}\s|\*\*|\)\s*\|/m.test(text) && /\[[^\]]*\]\(http/.test(text)) {
      return parseMarkdown(text);
    }
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const placeMap = {};
    let curCat = "Other";
    lines.forEach((l) => {
      // heading-ish: short line, Title Case, no sentence punctuation
      if (l.length < 48 && /^[A-Z0-9].*[a-zA-Z]$/.test(l) && !/[.:].+/.test(l) && l.split(" ").length <= 6) {
        curCat = l; return;
      }
      const urls = (l.match(/https?:\/\/[^\s)]+/g) || []);
      const m = l.match(/^[•*\-]?\s*([A-Z][^:–-]{2,60})\s*[:–-]\s*(.+)$/);
      if (m) {
        const name = m[1].trim();
        const sl = slug(name);
        if (!placeMap[sl]) placeMap[sl] = { name, slug: sl, category: curCat, sub: "" };
        placeMap[sl].desc = m[2].replace(/https?:\/\/[^\s)]+/g, "").trim();
        urls.forEach((u) => {
          if (/maps/i.test(u)) placeMap[sl].maps = u; else placeMap[sl].web = u;
        });
      }
    });
    return { trip: null, places: Object.values(placeMap) };
  }

  async function parseFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      const buf = await file.arrayBuffer();
      const text = await pdfToText(buf);
      return parsePlainText(text);
    }
    const text = await file.text();
    return parseMarkdown(text);
  }

  window.Parser = { parseMarkdown, parsePlainText, parseFile, extractLinks, classifyLink };
})();
