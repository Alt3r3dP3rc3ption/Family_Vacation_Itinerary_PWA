/* Seed data: the Copenhagen / Sweden / Minecraft family trip.
   This is the SAME shape the parser produces, so imports merge cleanly.
   Coordinates are approximate, baked in so the Map works offline on first load. */
(function () {
  const maps = (q) =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  // ---- Directory of places -------------------------------------------------
  // category: top-level | sub: subcategory | loc: location region
  const places = [
    // Attractions :: Amusement & Gaming
    { name: "Astralis Nexus", desc: "Massive esports and gaming lounge with high-end PCs.", category: "Attractions", sub: "Amusement & Gaming", loc: "Copenhagen · Indre By", web: "https://link.astralis.gg/m/nexus", maps: maps("Astralis Nexus Tivoli Copenhagen"), lat: 55.6736, lng: 12.5681 },
    { name: "Minecraft Experience: Villager Rescue", desc: "Life-sized, interactive biome rooms where players complete physical quests.", category: "Attractions", sub: "Amusement & Gaming", loc: "Herning", maps: maps("MCH Messecenter Herning"), lat: 56.1300, lng: 8.9430 },
    { name: "Tivoli Gardens", desc: "Iconic amusement park featuring roller coasters, arcade games, and historic gardens.", category: "Attractions", sub: "Amusement & Gaming", loc: "Copenhagen · Indre By", web: "https://www.tivoli.dk/en", maps: maps("Tivoli Gardens Copenhagen"), lat: 55.6736, lng: 12.5681 },
    { name: "Experimentarium", desc: "World-class, interactive science center.", category: "Attractions", sub: "Amusement & Gaming", loc: "Copenhagen · Suburbs", alt: true, lat: 55.7218, lng: 12.5770 },
    { name: "Extremezone VR & Action Park", desc: "Indoor park with VR arena, trampolines, and ninja courses.", category: "Attractions", sub: "Amusement & Gaming", loc: "Malmö", alt: true, lat: 55.5780, lng: 13.0560 },

    // Attractions :: Museums & History
    { name: "National Museum of Denmark", desc: "National history museum featuring an interactive Children’s Museum with a playable Viking ship.", category: "Attractions", sub: "Museums & History", loc: "Copenhagen · Indre By", web: "https://en.natmus.dk/", maps: maps("National Museum of Denmark Copenhagen"), lat: 55.6743, lng: 12.5757 },
    { name: "Rosenborg Castle", desc: "17th-century renaissance castle housing the crown jewels.", category: "Attractions", sub: "Museums & History", loc: "Copenhagen · Indre By", web: "https://www.kongernessamling.dk/en/rosenborg/", maps: maps("Rosenborg Castle Copenhagen"), lat: 55.6857, lng: 12.5773 },
    { name: "Round Tower (Rundetårn)", desc: "Historic 17th-century tower with a stroller-friendly spiral equestrian ramp to the top.", category: "Attractions", sub: "Museums & History", loc: "Copenhagen · Indre By", web: "https://www.rundetaarn.dk/en/", maps: maps("Round Tower Copenhagen"), lat: 55.6814, lng: 12.5757 },
    { name: "HEART Museum of Contemporary Art", desc: "Quiet, spacious architectural art museum designed by Steven Holl.", category: "Attractions", sub: "Museums & History", loc: "Herning", web: "https://www.heartmus.dk/en/", maps: maps("HEART Museum Herning"), lat: 56.1380, lng: 9.0290 },
    { name: "Carl-Henning Pedersen & Else Alfelts Museum", desc: "Art museum covered in blue ceramic tiles and surrounded by a moat.", category: "Attractions", sub: "Museums & History", loc: "Herning", web: "https://www.chpeamuseum.dk/", maps: maps("Carl-Henning Pedersen Museum Herning"), lat: 56.1390, lng: 9.0300 },
    { name: "Malmöhus Castle (Malmöhus Slott)", desc: "Historic moat-surrounded fortress housing an aquarium and natural history exhibits.", category: "Attractions", sub: "Museums & History", loc: "Malmö", web: "https://malmo.se/Uppleva-och-gora/Konst-och-museer/Malmo-Museer/Besok-Malmo-Museer/Malmohus-slott.html", maps: maps("Malmohus Castle Malmo"), lat: 55.6050, lng: 12.9890 },

    // Attractions :: Parks, Nature & Outdoors
    { name: "The King’s Garden (Kongens Have)", desc: "Expansive, flat, highly stroller-friendly grounds surrounding Rosenborg Castle.", category: "Attractions", sub: "Parks & Outdoors", loc: "Copenhagen · Indre By", maps: maps("Kongens Have Copenhagen"), lat: 55.6855, lng: 12.5800 },
    { name: "Geometrical Gardens (De Geometriske Haver)", desc: "A landscape park featuring intricate hedge mazes.", category: "Attractions", sub: "Parks & Outdoors", loc: "Herning", maps: maps("De Geometriske Haver Herning"), lat: 56.1400, lng: 9.0290 },
    { name: "Folkets Park", desc: "The oldest public park in the world, with massive creative playgrounds.", category: "Attractions", sub: "Parks & Outdoors", loc: "Malmö", web: "https://malmo.se/Uppleva-och-gora/Natur-och-parker/Folkets-park.html", maps: maps("Folkets Park Malmo"), lat: 55.5980, lng: 13.0150 },
    { name: "Copenhagen Zoo", desc: "Highly stroller-friendly zoo featuring an Arctic Ring and elephant enclosures.", category: "Attractions", sub: "Parks & Outdoors", loc: "Copenhagen · Suburbs", maps: maps("Copenhagen Zoo"), lat: 55.6727, lng: 12.5236 },
    { name: "Frederiksberg Gardens", desc: "Massive suburban green space with water features and relaxed pathways.", category: "Attractions", sub: "Parks & Outdoors", loc: "Copenhagen · Suburbs", maps: maps("Frederiksberg Gardens Copenhagen"), lat: 55.6722, lng: 12.5226 },

    // Attractions :: Shopping & Leisure
    { name: "Classic Canal Cruise", desc: "Guided boat tours departing from Nyhavn or Gammel Strand.", category: "Attractions", sub: "Shopping & Leisure", loc: "Copenhagen · Indre By", maps: maps("Nyhavn Copenhagen"), lat: 55.6797, lng: 12.5913 },
    { name: "Faraos Cigarer", desc: "Scandinavia’s premier geek, gaming, and pop-culture store.", category: "Attractions", sub: "Shopping & Leisure", loc: "Copenhagen · Indre By", web: "https://www.faraos.dk/", maps: maps("Faraos Cigarer Skindergade Copenhagen"), lat: 55.6796, lng: 12.5736 },
    { name: "Strøget", desc: "One of Europe's longest pedestrian shopping streets.", category: "Attractions", sub: "Shopping & Leisure", loc: "Copenhagen · Indre By", maps: maps("Stroget Copenhagen"), lat: 55.6786, lng: 12.5763 },

    // Food & Dining :: Cafes & Quick Bites
    { name: "Danish Hot Dog Carts (Pølsevogn)", desc: "Traditional street food carts found throughout the city.", category: "Food & Dining", sub: "Cafes & Quick Bites", loc: "Copenhagen · Indre By", lat: 55.6790, lng: 12.5760 },
    { name: "HEART Museum Cafe", desc: "Quiet, high-quality lunch cafe perfect for decompressing.", category: "Food & Dining", sub: "Cafes & Quick Bites", loc: "Herning", web: "https://www.heartmus.dk/en/", maps: maps("HEART Museum Herning"), lat: 56.1380, lng: 9.0290 },
    { name: "Indre By Bakeries, Pizzerias & Burger Joints", desc: "Quick, zero-friction street food surrounding the apartment.", category: "Food & Dining", sub: "Cafes & Quick Bites", loc: "Copenhagen · Indre By", lat: 55.6800, lng: 12.5780 },

    // Food & Dining :: Food Halls & Markets
    { name: "Torvehallerne", desc: "Copenhagen's premier food market offering dozens of distinct fast-casual stalls.", category: "Food & Dining", sub: "Food Halls & Markets", loc: "Copenhagen · Indre By", web: "https://torvehallernekbh.dk/", maps: maps("Torvehallerne Copenhagen"), lat: 55.6837, lng: 12.5700 },
    { name: "Tivoli Food Hall", desc: "Diverse, quick-service food options located on the edge of Tivoli Gardens.", category: "Food & Dining", sub: "Food Halls & Markets", loc: "Copenhagen · Indre By", maps: maps("Tivoli Food Hall Copenhagen"), lat: 55.6730, lng: 12.5670 },

    // Food & Dining :: Restaurants & Squares
    { name: "Lilla Torg", desc: "Picturesque historic square known for restaurants serving traditional Swedish meatballs.", category: "Food & Dining", sub: "Restaurants & Squares", loc: "Malmö", maps: maps("Lilla Torg Malmo"), lat: 55.6060, lng: 12.9990 },
    { name: "Smørrebrød Cafes", desc: "Traditional Danish open-faced sandwich spots (recommended near the National Museum).", category: "Food & Dining", sub: "Restaurants & Squares", loc: "Copenhagen · Indre By", lat: 55.6745, lng: 12.5760 },

    // Transit Hubs & Infrastructure
    { name: "Copenhagen Airport (CPH)", desc: "Main international airport.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Copenhagen · Indre By", web: "https://www.cph.dk/en", maps: maps("Copenhagen Airport CPH"), lat: 55.6180, lng: 12.6508 },
    { name: "Copenhagen Central Station", desc: "Main hub for regional and Intercity trains.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Copenhagen · Indre By", maps: maps("Copenhagen Central Station"), lat: 55.6727, lng: 12.5641 },
    { name: "Kongens Nytorv Metro Station", desc: "Automated M2 line station near the Indre By apartment.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Copenhagen · Indre By", maps: maps("Kongens Nytorv Metro Station Copenhagen"), lat: 55.6800, lng: 12.5850 },
    { name: "Herning Messecenter Station", desc: "Direct train stop for the MCH Messecenter (Minecraft Experience).", category: "Transit", sub: "Hubs & Infrastructure", loc: "Herning", maps: maps("Herning Messecenter Station"), lat: 56.1310, lng: 8.9450 },
    { name: "Birk Centerpark Station", desc: "Local train stop for the Herning art and culture district.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Herning", maps: maps("Birk Centerpark Station Herning"), lat: 56.1380, lng: 9.0270 },
    { name: "Malmö Central Station", desc: "Main transit hub for arriving in Sweden.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Malmö", maps: maps("Malmo Central Station"), lat: 55.6093, lng: 13.0007 },
    { name: "Øresund Bridge", desc: "The massive engineering marvel connecting Denmark and Sweden by train.", category: "Transit", sub: "Hubs & Infrastructure", loc: "Malmö", maps: maps("Oresund Bridge"), lat: 55.5717, lng: 12.8500 },

    // Accommodations
    { name: "Three-Story Apartment (Indre By)", desc: "The primary basecamp. Maximum sleeping space and zero-friction food access.", category: "Stays", sub: "Accommodations", loc: "Copenhagen · Indre By", maps: maps("Indre By Copenhagen"), lat: 55.6800, lng: 12.5790, basecamp: true },
    { name: "Jægersborggade Apartment (Nørrebro)", desc: "Discussed alternative — not selected due to transit logistics.", category: "Stays", sub: "Accommodations", loc: "Copenhagen · Suburbs", alt: true, lat: 55.6930, lng: 12.5460 },
    { name: "Valby Penthouse (Valby)", desc: "Discussed alternative — highly rated, but adds commuter friction with kids.", category: "Stays", sub: "Accommodations", loc: "Copenhagen · Suburbs", alt: true, lat: 55.6620, lng: 12.5130 },
  ];

  // ---- Day-by-day itinerary ------------------------------------------------
  // refs: place names referenced this day (used to cross-link Directory ⇄ Itinerary)
  const days = [
    { date: "2026-06-12", label: "Fri, Jun 12", emoji: "✈️", title: "Departure",
      items: [
        { t: "**Evening:** Depart Raleigh (RDU) for the overnight transatlantic flight." },
        { t: "*Transit Tip:* Layover in Paris (CDG) before the final leg to Denmark. Keep the boys' electronics charged in their carry-ons." },
      ], refs: [] },
    { date: "2026-06-13", label: "Sat, Jun 13", emoji: "🧳", title: "Arrival & the Indre By Reset",
      items: [
        { t: "**Morning/Afternoon:** Arrive at Copenhagen Airport (CPH).", refs: ["Copenhagen Airport (CPH)"] },
        { t: "*Transit Tip:* Take the driverless M2 Metro to Kongens Nytorv station. Kids love sitting at the front window to “drive” the train.", refs: ["Kongens Nytorv Metro Station"] },
        { t: "**Check-in:** Drop bags at the Indre By apartment; everyone claims a bed and decompresses.", refs: ["Three-Story Apartment (Indre By)"] },
        { t: "**Evening:** Low-friction casual dinner (pizza or burgers) within a five-minute walk.", refs: ["Indre By Bakeries, Pizzerias & Burger Joints"] },
        { t: "*Pro-Tip:* Prioritize an early bedtime to force the time-zone adjustment. No sightseeing on day one." },
      ] },
    { date: "2026-06-14", label: "Sun, Jun 14", emoji: "🛡️", title: "Walkable Classics & Vikings",
      items: [
        { t: "**Morning:** Indre By bakery for pastries, then walk to the National Museum of Denmark. Head for the Children’s Museum — a playable Viking ship and dress-up gear.", refs: ["National Museum of Denmark", "Indre By Bakeries, Pizzerias & Burger Joints"] },
        { t: "**Lunch:** Traditional smørrebrød or familiar cafe food near the museum.", refs: ["Smørrebrød Cafes"] },
        { t: "**Afternoon:** Walk back to the apartment for a mid-afternoon breather." },
        { t: "**Evening:** Relaxed stroll down the Strøget pedestrian street.", refs: ["Strøget"] },
      ] },
    { date: "2026-06-15", label: "Mon, Jun 15", emoji: "👑", title: "Castles & Canals",
      items: [
        { t: "**Morning:** Walk to Rosenborg Castle and explore The King’s Garden — flat, stroller-friendly grounds with open grass.", refs: ["Rosenborg Castle", "The King’s Garden (Kongens Have)"] },
        { t: "**Lunch:** Torvehallerne food market — dozens of fast-casual stalls from empanadas to fresh pasta.", refs: ["Torvehallerne"] },
        { t: "**Afternoon:** Classic Canal Cruise from nearby Nyhavn — a full city tour without any walking.", refs: ["Classic Canal Cruise"] },
      ] },
    { date: "2026-06-16", label: "Tue, Jun 16", emoji: "🎢", title: "The Big Day at Tivoli & Astralis",
      items: [
        { t: "**Morning:** Slower morning at the apartment." },
        { t: "**Late Morning / Afternoon:** Walk over to Tivoli Gardens.", refs: ["Tivoli Gardens"] },
        { t: "**For Preston & Owen:** The Astralis Nexus gaming lounge — pro-level gaming PCs.", refs: ["Astralis Nexus"] },
        { t: "**For Carly & Elliot:** Manicured gardens and gentle rides while the older boys game." },
        { t: "**Dinner:** Eat in the park — the Tivoli Food Hall offers diverse, quick-service options.", refs: ["Tivoli Food Hall"] },
      ] },
    { date: "2026-06-17", label: "Wed, Jun 17", emoji: "⛏️", title: "The Epic Journey (Parallel Tracks)",
      items: [
        { t: "**Morning:** Copenhagen Central Station — board an Intercity train to Central Jutland (4-hour scenic ride, great built-in downtime).", refs: ["Copenhagen Central Station"] },
        { t: "**Team Minecraft (Michael, Preston & Owen):** Disembark at Herning Messecenter. Walk into the Minecraft Experience: Villager Rescue — grab Orbs of Interaction, 3–4 hours navigating biome rooms.", refs: ["Herning Messecenter Station", "Minecraft Experience: Villager Rescue"] },
        { t: "**Team Culture & Chill (Carly & Elliot):** One more stop to Birk Centerpark. Lunch at the HEART Museum cafe, explore the Carl-Henning Pedersen Museum, and let Elliot roam the Geometrical Gardens.", refs: ["Birk Centerpark Station", "HEART Museum Cafe", "HEART Museum of Contemporary Art", "Carl-Henning Pedersen & Else Alfelts Museum", "Geometrical Gardens (De Geometriske Haver)"] },
        { t: "**Late Afternoon:** Reunite at Herning Central and board the Intercity back to Copenhagen together." },
        { t: "**Evening:** Late, relaxed dinner near the Indre By apartment.", refs: ["Indre By Bakeries, Pizzerias & Burger Joints"] },
      ] },
    { date: "2026-06-18", label: "Thu, Jun 18", emoji: "🇸🇪", title: "Swedish Day Trip to Malmö",
      items: [
        { t: "**Morning:** Board the Øresundståg across the Øresund Bridge directly into Sweden.", refs: ["Øresund Bridge"] },
        { t: "**Late Morning:** Arrive at Malmö Central Station; walk to Malmöhus Castle — a moat-surrounded fortress with an aquarium and natural history exhibits.", refs: ["Malmö Central Station", "Malmöhus Castle (Malmöhus Slott)"] },
        { t: "**Lunch:** Lilla Torg square for a plate of traditional Swedish meatballs.", refs: ["Lilla Torg"] },
        { t: "**Afternoon:** Folkets Park — the oldest public park in the world, with massive creative playgrounds.", refs: ["Folkets Park"] },
        { t: "**Evening:** 40-minute train back to Denmark for dinner." },
      ] },
    { date: "2026-06-19", label: "Fri, Jun 19", emoji: "🧙", title: "Geek Culture & the Round Tower",
      items: [
        { t: "**Morning:** The Round Tower (Rundetårn) — a spiral equestrian ramp to the top, easy to push a stroller up.", refs: ["Round Tower (Rundetårn)"] },
        { t: "**Midday:** Faraos Cigarer on Skindergade — Scandinavia’s premier geek and gaming store for a final souvenir.", refs: ["Faraos Cigarer"] },
        { t: "**Lunch:** A traditional Danish hot dog cart (pølsevogn) — classic, quick, universally popular.", refs: ["Danish Hot Dog Carts (Pølsevogn)"] },
        { t: "**Afternoon:** Final souvenir shopping and packing up the apartment." },
        { t: "**Evening:** Farewell dinner in the neighborhood." },
      ] },
    { date: "2026-06-20", label: "Sat, Jun 20", emoji: "🛫", title: "Departure",
      items: [
        { t: "**Morning:** Final bakery run, load the bags, ride the M2 Metro back to the airport.", refs: ["Indre By Bakeries, Pizzerias & Burger Joints", "Copenhagen Airport (CPH)"] },
        { t: "**Flight:** Depart CPH, connect through Paris (CDG), arrive home in Raleigh (RDU).", refs: ["Copenhagen Airport (CPH)"] },
      ] },
  ];

  window.SEED = {
    trip: {
      title: "Copenhagen, Sweden & Minecraft",
      subtitle: "Family Itinerary",
      dates: "Jun 12 – Jun 20, 2026",
      basecamp: "Three-Story Apartment · Indre By",
      basecampMaps: maps("Indre By Copenhagen"),
      blurb: "A tailored trip balancing gaming highlights for Preston & Owen, stroller-friendly paths for Elliot, and deep cultural immersion for Michael & Carly.",
      days,
    },
    places,
  };
})();
