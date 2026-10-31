/* =========================================================================
   TobaVerse — Map page logic
   Real Lake Toba destinations rendered as clickable SVG markers, a filter
   system, an info card, a destination card grid, and a hero parallax
   effect. All content reuses real, named places — nothing invented.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA — 10 real locations around Lake Toba. Coordinates are given as
     percentages of the illustrated SVG's viewBox (0–100), positioned to
     roughly reflect real relative geography, not a to-scale survey map.
     -------------------------------------------------------------------- */
  const LOCATIONS = [
    {
      id: "silangit-airport",
      name: "Silangit Airport",
      x: 50, y: 92,
      categories: ["Airport"],
      district: "Siborongborong, North Tapanuli",
      image: "assets/images/map/silangit-airport.jpg",
      description: "The main gateway airport serving Lake Toba, with regular flights connecting to Jakarta and Medan.",
      tips: "Arrange your onward transfer before landing — taxi counters are limited outside arrival hours.",
      hours: "Flight-schedule dependent",
      rating: 4.2,
      travelTimeFromParapat: "Approx. 3 hours by car",
      mapsQuery: "Silangit+International+Airport",
    },
    {
      id: "balige",
      name: "Balige",
      x: 46, y: 74,
      categories: ["Culture", "Villages"],
      district: "Toba Regency",
      image: "assets/images/map/balige.jpg",
      description: "A lakeside town on Toba's southern shore, home to the T.B. Silalahi Center and the open-air Soposurung field.",
      tips: "Pair a visit with the T.B. Silalahi Center for a half-day of Batak cultural history.",
      hours: "Town is open access; sites within keep standard daytime hours",
      rating: 4.5,
      travelTimeFromParapat: "Approx. 1.5 hours by car",
      mapsQuery: "Balige+Toba+Samosir",
    },
    {
      id: "ajibata-port",
      name: "Ajibata Port",
      x: 62, y: 58,
      categories: ["Ports"],
      district: "Ajibata, Toba Regency",
      image: "assets/images/map/ajibata-port.jpg",
      description: "The main ferry harbor on the eastern shore, connecting the mainland to Tomok on Samosir Island.",
      tips: "Vehicle ferries can queue on weekends — arrive 30 minutes before departure.",
      hours: "Ferries run roughly 06:00 – 19:00 daily",
      rating: 4.1,
      travelTimeFromParapat: "Approx. 10 minutes by car",
      mapsQuery: "Ajibata+Ferry+Port",
    },
    {
      id: "tomok",
      name: "Tomok",
      x: 54, y: 52,
      categories: ["Culture", "Villages"],
      district: "Samosir Island",
      image: "assets/images/map/tomok.jpg",
      description: "The main ferry landing on Samosir Island, known for its traditional market and Batak king's tomb.",
      tips: "The souvenir market gets busy with day-trip groups around midday — early morning is quieter.",
      hours: "08:00 – 18:00 daily",
      rating: 4.2,
      travelTimeFromParapat: "Approx. 50 minutes (ferry + short walk)",
      mapsQuery: "Tomok+Samosir",
    },
    {
      id: "pangururan",
      name: "Pangururan",
      x: 38, y: 30,
      categories: ["Villages"],
      district: "Samosir Regency (capital)",
      image: "assets/images/map/pangururan.jpg",
      description: "The administrative capital of Samosir Regency, sitting on the isthmus that connects the island to the mainland, near natural hot springs.",
      tips: "Combine with a stop at the nearby Aek Rangat hot springs at the base of Pusuk Buhit.",
      hours: "Town is open access",
      rating: 4.0,
      travelTimeFromParapat: "Approx. 2.5 hours by car",
      mapsQuery: "Pangururan+Samosir",
    },
    {
      id: "bukit-holbung",
      name: "Bukit Holbung",
      x: 44, y: 48,
      categories: ["Nature", "Viewpoints"],
      district: "Muara, Samosir Island",
      image: "assets/images/map/bukit-holbung.jpg",
      description: "A rolling grass ridge nicknamed the 'Teletubbies Hill,' famous for sunrise views straight onto Lake Toba.",
      tips: "Arrive by 5:30am for sunrise — there's almost no shade once the sun is up.",
      hours: "24 hours (best 05:00 – 09:00)",
      rating: 4.8,
      travelTimeFromParapat: "Approx. 1.5 hours (ferry + drive)",
      mapsQuery: "Bukit+Holbung",
    },
    {
      id: "huta-siallagan",
      name: "Huta Siallagan",
      x: 58, y: 48,
      categories: ["Culture", "Villages"],
      district: "Ambarita, Samosir Island",
      image: "assets/images/map/huta-siallagan.jpg",
      description: "A walled stone village where 19th-century Batak kings once held tribal court on a ring of carved stone chairs.",
      tips: "Hire a local guide at the entrance — the courtyard's history is mostly passed down orally.",
      hours: "08:00 – 17:30 daily",
      rating: 4.7,
      travelTimeFromParapat: "Approx. 1 hour (ferry + short drive)",
      mapsQuery: "Huta+Siallagan+Samosir",
    },
    {
      id: "sipiso-piso",
      name: "Sipiso-piso Waterfall",
      x: 40, y: 8,
      categories: ["Nature"],
      district: "Merek, Karo Regency",
      image: "assets/images/map/sipiso-piso.jpg",
      description: "One of Indonesia's tallest waterfalls, plunging into the Lake Toba basin from the northern caldera rim.",
      tips: "The viewing platform is close to the parking area, but the trail down to the waterfall base is steep — wear proper shoes.",
      hours: "07:00 – 18:00 daily",
      rating: 4.6,
      travelTimeFromParapat: "Approx. 2 hours by car",
      mapsQuery: "Sipiso-piso+Waterfall",
    },
    {
      id: "parapat",
      name: "Parapat",
      x: 66, y: 62,
      categories: ["Ports", "Villages"],
      district: "Simalungun Regency",
      image: "assets/images/map/parapat.jpg",
      description: "Lake Toba's main gateway town on the eastern shore, with the busiest ferry harbor and traditional market.",
      tips: "The fish market at the harbor is busiest — and freshest — before 10am.",
      hours: "Harbor and market 06:00 – 19:00 daily",
      rating: 4.4,
      travelTimeFromParapat: "—",
      mapsQuery: "Parapat+Lake+Toba",
    },
    {
      id: "tele-view",
      name: "Tele View Tower",
      x: 22, y: 40,
      categories: ["Viewpoints"],
      district: "Tele, Samosir Regency",
      image: "assets/images/map/tele-view.jpg",
      description: "A viewing tower on the western caldera rim, offering one of the widest panoramas over Samosir Island and the lake.",
      tips: "Go on a clear afternoon — morning mist often hasn't cleared from the valley below.",
      hours: "08:00 – 18:00 daily",
      rating: 4.5,
      travelTimeFromParapat: "Approx. 2.5 hours by car",
      mapsQuery: "Menara+Pandang+Tele",
    },
  ];

  const CATEGORY_LABELS = ["All", "Nature", "Culture", "Ports", "Airport", "Viewpoints", "Villages"];

  let activeFilter = "All";
  let activeMarkerId = null;

  /* ---------------------------------------------------------------------
     RENDER: Filter chips
     -------------------------------------------------------------------- */
  const filterRow = document.getElementById("mapFilters");
  if (filterRow) {
    filterRow.innerHTML = CATEGORY_LABELS.map(
      (label) => `<button class="map-chip${label === "All" ? " is-active" : ""}" data-filter="${label}">${label}</button>`
    ).join("");

    filterRow.querySelectorAll(".map-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        filterRow.querySelectorAll(".map-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeFilter = chip.dataset.filter;
        applyFilter();
      });
    });
  }

  /* ---------------------------------------------------------------------
     RENDER: SVG markers
     -------------------------------------------------------------------- */
  const markersLayer = document.getElementById("markersLayer");
  const svgNS = "http://www.w3.org/2000/svg";

  function buildMarkers() {
    if (!markersLayer) return;
    LOCATIONS.forEach((loc) => {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "map-marker");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `View details for ${loc.name}`);
      g.dataset.id = loc.id;

      const cx = loc.x * 8; // viewBox is 0-800 wide
      const cy = loc.y * 6; // viewBox is 0-600 tall

      const pulse = document.createElementNS(svgNS, "circle");
      pulse.setAttribute("class", "pin-pulse");
      pulse.setAttribute("cx", cx);
      pulse.setAttribute("cy", cy);
      pulse.setAttribute("r", "6");

      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("class", "pin-dot");
      dot.setAttribute("cx", cx);
      dot.setAttribute("cy", cy);
      dot.setAttribute("r", "6");

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", cx);
      label.setAttribute("y", cy - 12);
      label.setAttribute("text-anchor", "middle");
      label.textContent = loc.name;

      g.appendChild(pulse);
      g.appendChild(dot);
      g.appendChild(label);

      g.addEventListener("click", () => selectMarker(loc.id));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectMarker(loc.id);
        }
      });

      markersLayer.appendChild(g);
    });
  }

  function applyFilter() {
    const markers = markersLayer ? markersLayer.querySelectorAll(".map-marker") : [];
    markers.forEach((m) => {
      const loc = LOCATIONS.find((l) => l.id === m.dataset.id);
      const matches = activeFilter === "All" || (loc && loc.categories.includes(activeFilter));
      m.classList.toggle("is-dimmed", !matches);
    });

    // Also filter the destination cards below the map
    document.querySelectorAll(".map-dest-card").forEach((card) => {
      const loc = LOCATIONS.find((l) => l.id === card.dataset.id);
      const matches = activeFilter === "All" || (loc && loc.categories.includes(activeFilter));
      card.style.display = matches ? "" : "none";
    });
  }

  /* ---------------------------------------------------------------------
     INFO CARD
     -------------------------------------------------------------------- */
  const infoCard = document.getElementById("mapInfoCard");

  function starIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
  }

  function selectMarker(id) {
    const loc = LOCATIONS.find((l) => l.id === id);
    if (!loc || !infoCard) return;

    activeMarkerId = id;
    markersLayer.querySelectorAll(".map-marker").forEach((m) => {
      m.classList.toggle("is-active", m.dataset.id === id);
    });

    infoCard.innerHTML = `
      <div class="mi-photo">
        <span class="mi-badge">${loc.categories[0]}</span>
        <img src="${loc.image}" alt="${loc.name}" loading="lazy" width="480" height="300" />
      </div>
      <div class="mi-body">
        <span class="mi-loc">${loc.district}</span>
        <h3>${loc.name}</h3>
        <p class="mi-desc">${loc.description}</p>
        <div class="mi-meta">
          <div class="row"><b>Travel Tip</b><span>${loc.tips}</span></div>
          <div class="row"><b>Opening Hours</b><span>${loc.hours}</span></div>
          <div class="row"><b>Rating</b><span>${starIcon()} ${loc.rating.toFixed(1)} / 5</span></div>
        </div>
        <div class="mi-actions">
          <button class="btn btn-dark mi-view-btn" data-id="${loc.id}">View Destination</button>
          <a class="btn btn-outline" href="https://www.google.com/maps/dir/?api=1&destination=${loc.mapsQuery}" target="_blank" rel="noopener">Get Route</a>
        </div>
      </div>
    `;

    const viewBtn = infoCard.querySelector(".mi-view-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        const card = document.querySelector(`.map-dest-card[data-id="${loc.id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("is-highlighted");
          setTimeout(() => card.classList.remove("is-highlighted"), 1600);
        }
      });
    }
  }

  /* ---------------------------------------------------------------------
     RENDER: Destination cards
     -------------------------------------------------------------------- */
  const destGrid = document.getElementById("destCardsGrid");

  function renderDestCards() {
    if (!destGrid) return;
    destGrid.innerHTML = LOCATIONS.map(
      (loc, i) => `
      <article class="map-dest-card reveal fade-up" data-delay="${(i % 4) * 90}" data-id="${loc.id}">
        <div class="thumb">
          <span class="badge">${loc.categories[0]}</span>
          <span class="rating">${starIcon()} ${loc.rating.toFixed(1)}</span>
          <img src="${loc.image}" alt="${loc.name}, ${loc.district}" loading="lazy" width="400" height="300" />
        </div>
        <div class="body">
          <span class="district">${loc.district}</span>
          <h4>${loc.name}</h4>
          <p class="desc">${loc.description}</p>
          <span class="travel-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            ${loc.travelTimeFromParapat}
          </span>
        </div>
      </article>`
    ).join("");

    destGrid.querySelectorAll(".map-dest-card").forEach((card) => {
      card.addEventListener("click", () => selectMarker(card.dataset.id));
    });

    observeReveals(destGrid);
  }

  /* ---------------------------------------------------------------------
     Hero parallax (subtle, disabled for prefers-reduced-motion)
     -------------------------------------------------------------------- */
  const heroBg = document.querySelector(".map-hero .hero-bg");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (heroBg && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          heroBg.style.transform = `translateY(${window.scrollY * 0.22}px)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------------
     Reveal-on-scroll (self-contained, mirrors other page scripts)
     -------------------------------------------------------------------- */
  function observeReveals(scope) {
    const root = scope || document;
    const els = root.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     INIT
     -------------------------------------------------------------------- */
  buildMarkers();
  renderDestCards();
  observeReveals(document);
})();