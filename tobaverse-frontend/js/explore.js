/* =========================================================================
   TobaVerse — Explore page logic
   Destination data, dynamic card rendering, search + category filtering,
   the "Read Story" modal, and the interactive map section.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. DESTINATION DATA
     -------------------------------------------------------------------- */
  const DESTINATIONS = [
    {
      id: "huta-siallagan",
      image: "assets/images/destinations/huta-siallagan.jpg",
      name: "Huta Siallagan",
      category: "Heritage",
      location: "Ambarita, Samosir Island",
      rating: 4.7,
      description:
        "A walled stone village on Samosir Island where 19th-century Batak kings once held tribal court on a ring of carved stone chairs.",
      history:
        "Huta Siallagan was founded generations ago by the Siallagan clan and remains encircled by its original defensive stone wall. The village's most recognized feature is the Batu Parsidangan, a courtyard of stone chairs and a table where kings and elders convened to judge disputes and, according to local record, to carry out sentences on convicted wrongdoers.",
      story:
        "Elders describe the courtyard as a place of accountability rather than spectacle: the chairs are arranged so the accused always faced the king, the clan witnesses, and the executioner in a fixed order, a layout still explained by descendants who live in the village today.",
      facts: [
        "The stone furniture is carved from single blocks of volcanic rock and has stood in place for roughly two centuries.",
        "Traditional Bolon houses inside the village have saddle-shaped roofs said to echo the bow of a buffalo horn.",
        "The Siallagan clan still resides within the walls, making it a living village rather than a reconstructed one.",
      ],
      nearby: ["Tomok Traditional Market", "Sigale-gale Wooden Puppet House", "Tuktuk lakeside strip"],
      culinary: ["Naniura (Batak-style raw fish, citrus-cured)", "Mie Gomak with grilled fish", "Fresh andaliman-spiced chicken"],
      tips: [
        "Hire a local guide at the entrance — the courtyard's history is passed down orally and rarely written on signage.",
        "Dress respectfully; this is a residential village, not an open-air museum.",
        "Combine with Tomok in the same afternoon; both sit on the same stretch of Samosir's east coast.",
      ],
      hours: "08:00 – 17:30 daily",
      bestTime: "Morning, before tour buses arrive from Tomok",
      mapsQuery: "Huta+Siallagan+Samosir",
    },
    {
      id: "bukit-holbung",
      image: "assets/images/destinations/bukit-holbung.jpg",
      name: "Bukit Holbung",
      category: "Viewpoint",
      location: "Muara, Samosir Island",
      rating: 4.8,
      description:
        "A rolling grass ridge nicknamed the 'Teletubbies Hill,' famous for sunrise views that pour directly onto Lake Toba below.",
      history:
        "Once used purely as grazing land by nearby villages, Bukit Holbung was reopened to visitors within the past decade after photographers began sharing images of its treeless, undulating slopes. It has since become one of Samosir's most-hiked viewpoints.",
      story:
        "Locals still graze cattle on the upper slopes early in the morning, so the hill's postcard-green color is partly the result of generations of pasture management rather than a manicured park.",
      facts: [
        "The climb to the summit ridge takes 30–45 minutes on a clear dirt path with no technical sections.",
        "Paragliders launch from Holbung's upper slopes on calm mornings, using the lake as an open landing zone.",
        "The hill has no tree cover, which is exactly what produces its uninterrupted 360° views.",
      ],
      nearby: ["Muara harbor", "Aek Rangat hot springs", "Sipinsur viewpoint (via the ring road)"],
      culinary: ["Grilled tilapia (nila) from lakeside warungs at the base", "Kopi Sidikalang (North Sumatra highland coffee)"],
      tips: [
        "Arrive by 5:30am for sunrise — the hill has almost no shade once the sun is up.",
        "Bring water; there are no stalls at the summit, only at the base.",
        "The grass is slick after rain, so trekking shoes are worth the extra weight.",
      ],
      hours: "24 hours (best 05:00 – 09:00 and 16:00 – 18:00)",
      bestTime: "Sunrise, April to September (dry season)",
      mapsQuery: "Bukit+Holbung",
    },
    {
      id: "sipinsur",
      image: "assets/images/destinations/sipinsur.jpg",
      name: "Sipinsur Viewpoint",
      location: "Humbang Hasundutan Regency",
      category: "Viewpoint",
      rating: 4.6,
      description:
        "A cliffside terrace with gazebos and a suspended photo bridge, framing Samosir Island across the widest part of the lake.",
      history:
        "Sipinsur sits along the historic route once used by Batak king Sisingamangaraja XII, and the site has been developed with walking terraces and viewing decks to make that panorama accessible to visitors travelling the ring road between Sibolga and Balige.",
      story:
        "Because the terrace looks almost straight down the throat of the caldera toward Samosir, guides often use Sipinsur as the spot to explain the scale of the original eruption — the island in view is itself larger than several small nations.",
      facts: [
        "The viewpoint sits at roughly 1,400 meters above sea level, well above the lake's own shoreline at ~900 meters.",
        "A small suspended bridge extends over the cliff edge purely for photographs.",
        "On clear days the view spans across to both Samosir Island and the Balige basin.",
      ],
      nearby: ["Sisingamangaraja XII historical sites", "Dolok Sanggul town", "Balige (via the ring road south)"],
      culinary: ["Ombus-ombus steamed rice cakes from Siborong-borong", "Local highland arabica coffee"],
      tips: [
        "Best visited mid-morning; the valley below fills with mist for the first hour after sunrise.",
        "There's a small entrance fee for the photo bridge and gazebo terraces.",
        "Combine with a drive toward Balige for a full loop of the lake's southern arc.",
      ],
      hours: "07:00 – 18:00 daily",
      bestTime: "Mid-morning to early afternoon",
      mapsQuery: "Sipinsur",
    },
    {
      id: "huta-ginjang",
      image: "assets/images/destinations/huta-ginjang.jpg",
      name: "Huta Ginjang",
      category: "Viewpoint",
      location: "Muara District",
      rating: 4.7,
      description:
        "One of the highest terraces around the caldera rim, holding almost the entire lake and Samosir Island in a single frame.",
      history:
        "Huta Ginjang means 'upper village,' a fitting name for a settlement perched near the top of the caldera wall. Its elevation made it a natural site for a viewing platform once road access improved, and it is now a regular paragliding launch point during regional competitions.",
      story:
        "From this height, guides point out how the lake's outline traces the rim of the original blast — the reason Huta Ginjang is often used as the first stop on any full-day tour of the caldera, orienting visitors before they descend to the shoreline.",
      facts: [
        "Sits at roughly 1,555 meters above sea level — among the highest publicly accessible viewpoints on the lake.",
        "Hosts an annual paragliding festival that draws pilots from across Indonesia.",
        "On a clear day, the view stretches far enough to take in nearly the full outline of Samosir Island.",
      ],
      nearby: ["Muara harbor and market", "Bukit Holbung", "Sipinsur"],
      culinary: ["Corn and sweet potato roasted at roadside stalls", "Fresh lake fish soup (natinombur)"],
      tips: [
        "Go on a weekday if possible; weekends bring heavy motorbike traffic up the narrow access road.",
        "Bring a light jacket — wind at the summit is noticeably cooler than at lake level.",
        "Time your visit for late afternoon to catch the light raking across the water.",
      ],
      hours: "06:00 – 18:30 daily",
      bestTime: "Late afternoon, clear-sky days",
      mapsQuery: "Huta+Ginjang",
    },
    {
      id: "balige",
      image: "assets/images/destinations/balige.jpg",
      name: "Balige",
      category: "Culture",
      location: "Toba Samosir Regency",
      rating: 4.5,
      description:
        "A lakeside town on Toba's southern shore, and the cultural anchor for Batak Toba heritage, music, and the region's open-air Soposurung field.",
      history:
        "Balige has long served as an administrative and cultural center for the Toba Batak, sitting where the Asahan valley meets the lake's southern basin. It grew as a market town and later as a hub for cultural preservation efforts led by prominent Batak families.",
      story:
        "The town's Soposurung field regularly hosts Batak cultural festivals, choir competitions, and Tor-Tor dance performances — traditions that are still taught to Balige's schoolchildren rather than staged only for visitors.",
      facts: [
        "Home to the T.B. Silalahi Center, one of the region's most complete Batak cultural museums.",
        "Balige's harbor hosts traditional Solu Bolon boat races during regional festivals.",
        "The town gives its name to Toba Samosir Regency's administrative seat.",
      ],
      nearby: ["Museum TB Silalahi Center", "Soposurung open field", "Sipinsur viewpoint (north on the ring road)"],
      culinary: ["Arsik (spiced turmeric fish stew)", "Saksang (traditional spiced dish, pork or jackfruit versions)", "Fresh lake-caught mujair"],
      tips: [
        "Time a visit around a local festival if possible — Balige's cultural calendar is more active than most lakeside towns.",
        "The Soposurung field is walkable from the town center; no vehicle needed once you arrive.",
        "Pair with the T.B. Silalahi Center for a half-day of Batak history in one stop.",
      ],
      hours: "Town is open access; sites within keep standard daytime hours",
      bestTime: "During festival season (June–August) or any clear weekday",
      mapsQuery: "Balige+Toba+Samosir",
    },
    {
      id: "parapat",
      image: "assets/images/destinations/parapat.jpg",
      name: "Parapat",
      category: "Nature",
      location: "Eastern shore, Simalungun Regency",
      rating: 4.4,
      description:
        "Lake Toba's main gateway town — ferry harbor to Samosir, a lively traditional market, and the lakeside strip where Toba's food culture concentrates.",
      history:
        "Parapat grew around its harbor, which has connected the eastern shore to Tomok on Samosir Island since regular ferry service began. That constant flow of travelers turned the town's waterfront into the region's busiest concentration of eateries, souvenir stalls, and fish markets.",
      story:
        "Fishermen bring in the day's catch to Parapat's harborside stalls each morning, and the town's cooks — many from families who have run the same stands for decades — turn it into fresh grilled and stewed fish by midday.",
      facts: [
        "The harbor runs regular ferries to Tomok on Samosir Island, roughly every hour during daylight.",
        "Parapat's Tigaraja Market is one of the largest traditional markets on the lake's eastern shore.",
        "The town sits directly on the Trans-Sumatra highway, making it the natural first stop for most visitors arriving from Medan.",
      ],
      nearby: ["Ferry terminal to Tomok, Samosir", "Bukit Indah Simarjarunjung", "Ajibata harbor"],
      culinary: ["Ikan mas arsik (spiced carp stew)", "Grilled nila fresh off the harbor grills", "Dali ni horbo (Batak buffalo-milk 'cheese')"],
      tips: [
        "Buy ferry tickets directly at the harbor counter; prices are fixed and posted.",
        "The fish market is busiest — and freshest — before 10am.",
        "Use Parapat as your base for day trips rather than an overnight stop if you prefer quieter lodging on Samosir.",
      ],
      hours: "Harbor and market: 06:00 – 19:00 daily",
      bestTime: "Morning, to catch the fish market and first ferries",
      mapsQuery: "Parapat+Lake+Toba",
    },
    {
      id: "museum-tb-silalahi",
      image: "assets/images/destinations/museum-tb-silalahi.jpg",
      name: "Museum TB Silalahi Center",
      category: "Culture",
      location: "Balige",
      rating: 4.6,
      description:
        "A purpose-built museum preserving Batak Toba artifacts, traditional houses, and the personal history of General T.B. Silalahi.",
      history:
        "Established by General Dr. T.B. Silalahi as a personal contribution to preserving Batak culture, the center combines a museum wing, a replica traditional village, and a hall documenting his own military and public service career.",
      story:
        "The center was built specifically so that Batak descendants scattered across Indonesia and abroad would have one place to bring their children back to — a deliberate act of cultural continuity rather than a typical tourist attraction.",
      facts: [
        "Houses a full-scale replica of a traditional Batak village, including several house types from different Batak sub-groups.",
        "Contains a dedicated hall on Batak ulos textile weaving, one of the region's most recognizable crafts.",
        "The complex sits directly on the shore of Lake Toba's southern basin, with the museum grounds opening onto the water.",
      ],
      nearby: ["Soposurung field", "Balige town center", "Lake Toba southern shoreline"],
      culinary: ["Café within the museum grounds serving Batak coffee", "Balige town's arsik fish stalls, a short drive away"],
      tips: [
        "Set aside at least two hours — the grounds are larger than they first appear.",
        "English-language signage is limited in places; a guide adds useful context to the artifact halls.",
        "Photography is generally welcome outdoors but check signage inside specific exhibit rooms.",
      ],
      hours: "09:00 – 17:00, closed on public holidays",
      bestTime: "Weekday mornings for a quieter visit",
      mapsQuery: "TB+Silalahi+Center+Balige",
    },
    {
      id: "pantai-lumban-bulbul",
      image: "assets/images/destinations/pantai-lumban-bulbul.jpeg",
      name: "Pantai Lumban Bulbul",
      category: "Nature",
      location: "Muara District, near Parapat",
      rating: 4.3,
      description:
        "A soft, sandy lakeside beach where locals and visitors swim in Toba's cool, clear water without any of the harbor's boat traffic.",
      history:
        "Unlike much of Toba's rockier shoreline, Lumban Bulbul's stretch of pale sand formed naturally at a shallow bend in the lake, and it has been used as a swimming spot by nearby communities long before organized tourism arrived.",
      story:
        "Weekend crowds here are mostly domestic families rather than international tour groups, giving Lumban Bulbul a noticeably local, unhurried atmosphere compared to Parapat's harborfront.",
      facts: [
        "The lake's water at this stretch stays a consistently cool temperature year-round due to its depth just offshore.",
        "The beach has no strong current, making it one of the safer swimming spots on the eastern shore.",
        "Sunset here faces directly across the water toward Samosir's silhouette.",
      ],
      nearby: ["Parapat town and harbor", "Huta Ginjang viewpoint (short drive uphill)", "Ajibata ferry pier"],
      culinary: ["Grilled corn and roadside snacks along the beach access road", "Fresh coconut sold by the shore"],
      tips: [
        "Weekdays are far quieter than weekends, when local families fill the shoreline.",
        "Bring your own mat or chair; rentals are limited outside peak season.",
        "Combine with a sunset stop after a day trip to the Huta Ginjang viewpoint above.",
      ],
      hours: "24 hours, staffed food stalls 08:00 – 19:00",
      bestTime: "Late afternoon into sunset",
      mapsQuery: "Pantai+Lumban+Bulbul",
    },
    {
      id: "tomok",
      image: "assets/images/destinations/tomok.jpg",
      name: "Tomok Village",
      category: "Heritage",
      location: "Tomok, Samosir Regency",
      rating: 4.7,
      description:
        "One of the most iconic Batak villages on Samosir Island, known for its royal heritage, traditional houses, cultural performances, and vibrant souvenir market.",
      history:
        "Tomok was once the center of the Sidabutar Kingdom. The village preserves the legacy of Batak Toba civilization through ancient stone tombs, traditional architecture, and centuries-old customs that continue to be practiced today.",
      story:
        "Walking through Tomok feels like stepping into a living museum. Visitors are welcomed by Batak hospitality, traditional music, ulos weaving, and cultural performances that showcase the rich identity of the Batak people.",
      facts: [
        "Home to the famous King Sidabutar Stone Tomb dating back hundreds of years.",
        "Traditional Batak houses with distinctive saddle-shaped roofs are still preserved.",
        "The village is one of the busiest cultural tourism destinations on Samosir Island."
      ],
      nearby: [
        "King Sidabutar Tomb",
        "Tomok Traditional Market",
        "Batak Museum Tomok"
        ],
        culinary: [
          "Naniura",
          "Mie Gomak",
          "Arsik",
          "Fresh Lake Toba Coffee"
        ],
        tips: [
          "Visit in the morning before tour groups arrive.",
          "Bring cash if you want to buy ulos and local handicrafts.",
          "Respect local customs when entering historical sites."
        ],
        hours: "08:00 – 18:00",
        bestTime: "Morning (08:00 – 11:00)",
        mapsQuery: "Tomok+Village+Samosir"
      },
  ];

  const CATEGORY_COLORS = {
    Nature: "#1F7A5C",
    Heritage: "#E08D3C",
    Viewpoint: "#1D6F8C",
    Culture: "#9C3B3B",
    Food: "#C77D2E",
  };

  /* ---------------------------------------------------------------------
     2. RENDERING
     -------------------------------------------------------------------- */
  const grid = document.getElementById("destGrid");
  const emptyState = document.getElementById("gridEmpty");
  const searchInput = document.getElementById("destSearch");
  const searchCount = document.getElementById("searchCount");
  const chips = document.querySelectorAll(".chip[data-filter]");

  let activeFilter = "All";

  function starIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
  }

  function matchesQuery(dest, q) {
    if (!q) return true;
    const hay = (dest.name + " " + dest.category + " " + dest.location).toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function renderCards() {
    const q = searchInput ? searchInput.value.trim() : "";
    const list = DESTINATIONS.filter(
      (d) => (activeFilter === "All" || d.category === activeFilter) && matchesQuery(d, q)
    );

    grid.innerHTML = list
      .map(
        (d, i) => `
      <article class="dest-card reveal fade-up" data-delay="${(i % 3) * 90}" data-id="${d.id}" style="--cat-color:${CATEGORY_COLORS[d.category] || "#1D6F8C"}">
        <div class="thumb">
          <span class="badge">${d.category}</span>
          <span class="rating">${starIcon()} ${d.rating.toFixed(1)}</span>
          <img src="${d.image}" alt="${d.name}, ${d.location}" loading="lazy" width="400" height="300" />
        </div>
        <div class="body">
          <span class="loc">${d.location}</span>
          <h3>${d.name}</h3>
          <p class="desc">${d.description}</p>
          <div class="actions">
            <button class="btn btn-dark btn-story" data-id="${d.id}" aria-haspopup="dialog">Read Story</button>
            <a class="btn btn-outline" href="https://maps.google.com/?q=${d.mapsQuery}" target="_blank" rel="noopener" aria-label="View ${d.name} details on Google Maps">View Details</a>
          </div>
        </div>
      </article>`
      )
      .join("");

    if (searchCount) {
      searchCount.textContent = `${list.length} destination${list.length === 1 ? "" : "s"}`;
    }
    emptyState.classList.toggle("show", list.length === 0);

    observeReveals();
    grid.querySelectorAll(".btn-story").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.id));
    });
  }

  /* Local reveal-on-scroll observer (works for repeated re-renders) */
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver(
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
    grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     4. SEARCH + FILTER WIRING
     -------------------------------------------------------------------- */
  if (searchInput) {
    searchInput.addEventListener("input", () => renderCards());
  }
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter;
      renderCards();
    });
  });

  /* Support ?cat= query param coming from the homepage category rail */
  const params = new URLSearchParams(window.location.search);
  const initialCat = params.get("cat");
  if (initialCat) {
    const match = Array.from(chips).find((c) => c.dataset.filter === initialCat);
    if (match) {
      chips.forEach((c) => c.classList.remove("is-active"));
      match.classList.add("is-active");
      activeFilter = initialCat;
    }
  }

  /* ---------------------------------------------------------------------
     5. "READ STORY" MODAL
     -------------------------------------------------------------------- */
  const overlay = document.getElementById("storyModal");
  const modalBody = document.getElementById("modalBody");
  let lastFocusedEl = null;

  function renderModal(d) {
    modalBody.innerHTML = `
      <div class="modal-header">
        <img src="${d.image}" alt="${d.name}, ${d.location}" loading="lazy" />
        <div class="modal-title-wrap">
          <span class="badge">${d.category}</span>
          <h2 id="modalTitle">${d.name}</h2>
        </div>
        <button class="modal-close" aria-label="Close story">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-meta-row">
          <div class="meta"><span class="label">Location</span><span class="value">${d.location}</span></div>
          <div class="meta"><span class="label">Rating</span><span class="value">★ ${d.rating.toFixed(1)} / 5</span></div>
          <div class="meta"><span class="label">Opening Hours</span><span class="value">${d.hours}</span></div>
          <div class="meta"><span class="label">Best Time to Visit</span><span class="value">${d.bestTime}</span></div>
        </div>

        <div class="modal-section">
          <h3>History</h3>
          <p>${d.history}</p>
        </div>
        <div class="modal-section">
          <h3>Cultural Story</h3>
          <p>${d.story}</p>
        </div>
        <div class="modal-section">
          <h3>Interesting Facts</h3>
          <ul>${d.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
        </div>
        <div class="modal-section">
          <h3>Nearby Attractions</h3>
          <div class="modal-tags">${d.nearby.map((n) => `<span>${n}</span>`).join("")}</div>
        </div>
        <div class="modal-section">
          <h3>Recommended Culinary</h3>
          <div class="modal-tags">${d.culinary.map((c) => `<span>${c}</span>`).join("")}</div>
        </div>
        <div class="modal-section">
          <h3>Travel Tips</h3>
          <ul>${d.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
        </div>

        <div class="modal-footer-actions">
          <a class="btn btn-primary" href="https://maps.google.com/?q=${d.mapsQuery}" target="_blank" rel="noopener">Open in Google Maps</a>
          <button class="btn btn-outline modal-dismiss">Close</button>
        </div>
      </div>
    `;
  }

  function openModal(id) {
    const d = DESTINATIONS.find((x) => x.id === id);
    if (!d) return;
    lastFocusedEl = document.activeElement;
    renderModal(d);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = modalBody.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
    modalBody.querySelector(".modal-close").addEventListener("click", closeModal);
    modalBody.querySelector(".modal-dismiss").addEventListener("click", closeModal);
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });
  }

  /* ---------------------------------------------------------------------
     6. INIT
     -------------------------------------------------------------------- */
  renderCards();
})();