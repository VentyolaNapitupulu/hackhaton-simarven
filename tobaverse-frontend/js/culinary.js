/* =========================================================================
   TobaVerse — Culinary page logic
   Food data (with local images), search + category filtering, card
   rendering, and the "Read Story" modal with restaurant recommendations.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA
     -------------------------------------------------------------------- */
  const FOODS = [
    {
      id: "arsik",
      name: "Arsik",
      image: "assets/images/culinary/arsik.jpg",
      origin: "Balige & the Toba southern shore",
      description: "A whole spiced carp simmered in turmeric and andaliman, served intact as a dish of blessing at family ceremonies.",
      taste: "Savory, Tangy, Andaliman",
      categories: ["Main Dish", "Traditional", "Popular"],
      price: "Rp 40,000 – 55,000",
      culturalTag: "Ceremonial dish",
      history: "Arsik is one of the oldest dishes in the Batak Toba kitchen, traditionally cooked with the fish kept whole rather than cut into pieces, and remains a fixture at weddings, homecomings, and family gatherings across the Toba region.",
      culturalSignificance: "Serving a whole fish signals completeness and blessing for the guest of honor. Arsik is frequently among the first dishes presented to hula-hula — the wife-giving family — during Dalihan Na Tolu ceremonies, making the dish inseparable from Batak social custom.",
      ingredients: ["Whole freshwater carp (ikan mas) or tilapia", "Turmeric and fresh ginger", "Andaliman (Batak pepper)", "Lemongrass and shallots", "Kecombrang (torch ginger flower)", "Unripe cikala fruit for sourness"],
      preparation: "The fish is scored but kept whole, layered with a thick turmeric-andaliman paste and aromatics, then simmered slowly and gently in a shallow pan until the sauce reduces to a thick, fragrant coating — the fish is never fried and rarely flipped out of respect for its form.",
      whenEaten: "Served at weddings, homecomings, and any ceremony where guests of honor are present.",
      facts: [
        "Andaliman produces a tingling numbness similar to Sichuan pepper rather than straightforward heat.",
        "The fish is traditionally left whole and unflipped throughout cooking as a mark of respect.",
        "Arsik is often the first ceremonial dish served to a family's hula-hula (wife-givers).",
      ],
      tips: [
        "Ask for the fish to be served whole — this is intentional, not an error.",
        "Andaliman causes a numbing sensation; pace yourself if you're new to it.",
        "Best enjoyed with warm rice and a side of dali ni horbo.",
      ],
      restaurants: [
        {
          name: "RM Panca",
          address: "Jl. Raja Paindoan No. 14, Balige, Toba Regency",
          rating: 4.4,
          hours: "08:00 – 21:00 daily",
          mapsQuery: "RM+Panca+Balige",
        },
        {
          name: "Rumah Makan Sabar Menanti",
          address: "Jl. Sisingamangaraja, Balige, Toba Regency",
          rating: 4.3,
          hours: "08:00 – 20:00 daily",
          mapsQuery: "Rumah+Makan+Sabar+Menanti+Balige",
        },
      ],
    },
    {
      id: "naniura",
      name: "Naniura",
      image: "assets/images/culinary/naniura.jpg",
      origin: "Samosir Island",
      description: "Often called Batak 'sashimi' — raw fish cured entirely with citrus and andaliman, once served only to Batak kings.",
      taste: "Fresh, Raw Fish, Citrus",
      categories: ["Main Dish", "Traditional"],
      price: "Rp 45,000 – 65,000",
      culturalTag: "Royal dish",
      history: "Naniura is often described as the Batak Toba precursor to sashimi, and was historically reserved for kings and nobility because of the skill required to safely prepare raw fish using only acid and spice, with no heat at all.",
      culturalSignificance: "Because it was once royal-only fare, serving Naniura today still carries a sense of honoring a guest — it remains a specialty dish rather than an everyday meal.",
      ingredients: ["Fresh whole carp (ikan mas)", "Andaliman", "Jeruk jungga (sour local citrus)", "Shallots, ginger, and turmeric", "Chili"],
      preparation: "Fish fillets are butterflied and thoroughly massaged with a ground paste of andaliman, ginger, turmeric, and shallots, then 'cooked' only by the acidity of jeruk jungga juice over several hours — no flame is used at any point.",
      whenEaten: "Served cold as a specialty dish for honored guests or festive family gatherings.",
      facts: [
        "Sometimes called 'Batak sashimi' by visitors, though the preparation method is entirely its own.",
        "The citrus juice is strong enough to firm the fish's texture without any heat.",
        "Historically prepared only by cooks trusted with a king's health, given the risk of improperly cured raw fish.",
      ],
      tips: [
        "Order this only from an established kitchen — the raw-fish curing process requires real skill.",
        "Ask if today's fish was caught that morning; freshness matters most here.",
        "Pairs well with a bitter local herbal drink to cut the richness.",
      ],
      restaurants: [
        {
          name: "Pulo Samosir Restaurant",
          address: "Tuktuk Siadong, Simanindo, Samosir Regency",
          rating: 4.3,
          hours: "09:00 – 21:00 daily",
          mapsQuery: "Pulo+Samosir+Restaurant+Tuktuk+Samosir",
        },
        {
          name: "Rumah Makan Marondang",
          address: "Ambarita, Simanindo, Samosir Regency",
          rating: 4.2,
          hours: "08:00 – 20:00 daily",
          mapsQuery: "Rumah+Makan+Marondang+Ambarita+Samosir",
        },
      ],
    },
    {
      id: "dali-ni-horbo",
      name: "Dali ni Horbo",
      image: "assets/images/culinary/dali-ni-horbo.jpg",
      origin: "Highland villages around Toba",
      description: "A soft buffalo-milk curd, sometimes called 'Batak cheese,' simmered in the same spiced sauce as arsik.",
      taste: "Mild, Milky, Creamy",
      categories: ["Main Dish", "Traditional"],
      price: "Rp 20,000 – 30,000",
      culturalTag: "Highland specialty",
      history: "Dali ni Horbo is a fresh buffalo-milk curd made by gently heating raw buffalo milk with a natural souring leaf until it sets — a technique used in Batak highland kitchens long before modern cheese-making reached the region.",
      culturalSignificance: "Often served alongside spicier dishes to balance the heat, Dali ni Horbo is considered a marker of a genuinely traditional Batak meal rather than a modernized one.",
      ingredients: ["Raw buffalo milk", "Daun pangi or papaya leaf extract (natural coagulant)", "Turmeric and andaliman for the accompanying sauce"],
      preparation: "Milk is heated gently and combined with the souring leaf extract until it curdles into a soft white curd, which is then typically simmered again in a spiced sauce similar to arsik's seasoning.",
      whenEaten: "A side dish at family meals and ceremonial spreads, rarely eaten entirely on its own.",
      facts: [
        "Sometimes called 'Batak cheese,' though its texture is closer to soft tofu than dairy cheese.",
        "Buffalo milk's higher fat content gives the curd its distinct richness.",
        "The souring leaf replaces rennet entirely in the curdling process.",
      ],
      tips: [
        "Order it alongside a spicier dish like arsik to balance the mild curd.",
        "It's often served warm, straight from the simmering sauce.",
        "Ask your server if a non-spicy version is available if you're sensitive to heat.",
      ],
      restaurants: [
        {
          name: "Rumah Makan Lomak",
          address: "Jl. Lingkaran, Tuktuk Siadong, Simanindo, Samosir Regency",
          rating: 4.5,
          hours: "08:00 – 22:00 daily",
          mapsQuery: "Rumah+Makan+Lomak+Tuktuk+Samosir",
        },
        {
          name: "Warung Pak Torang",
          address: "Tuktuk Siadong, Simanindo, Samosir Regency",
          rating: 4.2,
          hours: "08:00 – 19:00 daily",
          mapsQuery: "Warung+Pak+Torang+Tuktuk+Samosir",
        },
      ],
    },
    {
      id: "mie-gomak",
      name: "Mie Gomak",
      image: "assets/images/culinary/mie-gomak.jpg",
      origin: "Tapanuli highland markets",
      description: "Thick, chewy noodles tossed in a light andaliman sauce or coconut broth — the Batak highlands' everyday breakfast staple.",
      taste: "Rich, Savory, Batak Spice",
      categories: ["Main Dish", "Popular"],
      price: "Rp 15,000 – 25,000",
      culturalTag: "Everyday staple",
      history: "Mie Gomak takes its name from the Batak word 'gomak,' referring to the traditional method of scooping the thick noodles by hand, and has long served as a filling breakfast across Tapanuli's highland markets.",
      culturalSignificance: "Unlike arsik or naniura, mie gomak is a workaday staple rather than a ceremonial dish — it reflects the everyday food culture that sits alongside Batak's more formal, ceremonial fare.",
      ingredients: ["Thick udon-like rice noodles", "Coconut milk or a light andaliman-spiced sauce", "Boiled egg", "Fried shallots", "Grilled fish or shredded chicken"],
      preparation: "The noodles are boiled until firm, then tossed either in a rich coconut-based sauce or served alongside a light broth, finished with fried shallots and a sprinkle of ground andaliman.",
      whenEaten: "Commonly eaten for breakfast, or as a quick, hearty meal at any time of day.",
      facts: [
        "Sometimes compared to Italian pasta for its thick, chewy noodle shape.",
        "The dish's name literally references being handled by hand during serving.",
        "Found in both a 'dry' tossed version and a soupier, 'wet' version.",
      ],
      tips: [
        "Ask for the 'dry' version if you prefer tossed noodles rather than a soupy bowl.",
        "It's commonly a breakfast dish, so mornings are the best time to find it fresh.",
        "A side of fried shallots and sambal is usually free to add.",
      ],
      restaurants: [
        {
          name: "Rumah Makan Islam Murni",
          address: "Jl. Sisingamangaraja, Parapat, Simalungun Regency",
          rating: 4.3,
          hours: "06:00 – 21:30 daily",
          mapsQuery: "Rumah+Makan+Islam+Murni+Parapat",
        },
        {
          name: "Kedai Mie Gomak Bu Rita",
          address: "Jl. Sisingamangaraja, Parapat, Simalungun Regency",
          rating: 4.4,
          hours: "06:00 – 20:00 daily",
          mapsQuery: "Kedai+Mie+Gomak+Bu+Rita+Parapat",
        },
      ],
    },
    {
      id: "ombus-ombus",
      name: "Ombus-ombus",
      image: "assets/images/culinary/ombus-ombus.jpg",
      origin: "Siborongborong, Tapanuli Utara",
      description: "A warm rice cake filled with palm sugar and steamed in banana leaf — a favorite roadside snack on the way to Toba.",
      taste: "Sweet, Soft, Traditional",
      categories: ["Snack", "Traditional", "Popular"],
      price: "Rp 10,000 – 20,000 (per pack)",
      culturalTag: "Blessing snack",
      history: "Ombus-ombus originates from Siborongborong, a highland market town on the main route to Toba, where the steamed rice cake became a signature local snack sold to travelers passing through.",
      culturalSignificance: "Often brought as a small gift when visiting family, ombus-ombus is associated with warmth in both senses — 'ombus' evokes the steam rising from something freshly made and freshly given.",
      ingredients: ["Rice flour", "Grated coconut", "Palm sugar (gula aren)", "Banana leaf wrapping"],
      preparation: "A rice-flour and coconut dough is filled with palm sugar, wrapped tightly in banana leaf, and steamed until soft — the leaf also infuses the cake with its own aroma as it steams.",
      whenEaten: "Eaten warm as a snack with coffee or tea, especially popular with travelers stopping through Siborongborong.",
      facts: [
        "Best eaten immediately after steaming, while still warm.",
        "The banana-leaf wrapping contributes flavor, not just packaging.",
        "A favorite roadside souvenir for people driving the Balige–Siborongborong route.",
      ],
      tips: [
        "Eat it warm — it firms up and loses some flavor once fully cooled.",
        "Buy directly from Siborongborong's roadside stalls for the freshest batch.",
        "Great paired with a hot cup of Kopi Lintong.",
      ],
      restaurants: [
        {
          name: "Pasar Siborongborong roadside kiosks",
          address: "Jl. Lintas Sumatra, Siborongborong, Tapanuli Utara",
          rating: 4.4,
          hours: "06:00 – 18:00 daily",
          mapsQuery: "Pasar+Siborongborong+Tapanuli+Utara",
        },
        {
          name: "Toko Ombus-ombus Bu Nurmala",
          address: "Jl. Lintas Sumatra, Siborongborong, Tapanuli Utara",
          rating: 4.5,
          hours: "06:00 – 18:00 daily",
          mapsQuery: "Toko+Ombus+Ombus+Bu+Nurmala+Siborongborong",
        },
      ],
    },
    {
      id: "kopi-lintong",
      name: "Kopi Lintong",
      image: "assets/images/culinary/kopi-lintong.jpg",
      origin: "Lintongnihuta, Humbang Hasundutan",
      description: "A single-origin highland arabica, wet-hulled in the classic Sumatran style for a heavy body and low acidity.",
      taste: "Bold, Full-bodied, Chocolatey Finish",
      categories: ["Drink", "Traditional", "Popular"],
      price: "Rp 15,000 – 25,000 (per cup)",
      culturalTag: "Highland coffee",
      history: "Kopi Lintong takes its name from Lintongnihuta, a highland district near Lake Toba known for its volcanic soil and ideal arabica-growing altitude, cultivated by smallholder farmers for generations.",
      culturalSignificance: "Highland coffee farming is deeply tied to Batak livelihoods around Toba, and offering a cup of Kopi Lintong to a guest is a common, everyday gesture of hospitality.",
      ingredients: ["100% arabica beans grown around Lintongnihuta", "Processed using the traditional giling basah (wet-hulled) method"],
      preparation: "Cherries are hand-picked, pulped, briefly fermented, then hulled while still slightly moist before drying — the wet-hulled method distinctive to Sumatra that gives the coffee its low acidity and heavy body.",
      whenEaten: "Brewed and served throughout the day, from breakfast through to evening conversation on a lapo's porch.",
      facts: [
        "The wet-hulling method is almost unique to Sumatra and shapes the coffee's earthy, low-acid profile.",
        "Lintongnihuta's volcanic soil is a legacy of the same eruption that formed Lake Toba.",
        "Often grown at elevations above 1,200 meters.",
      ],
      tips: [
        "Ask for it brewed traditionally (tubruk-style) for the fullest body.",
        "Highland lapo stalls often serve it unsweetened by default — ask ahead if you want sugar.",
        "Best in the cooler morning or evening hours when the highland air turns chilly.",
      ],
      restaurants: [
        {
          name: "Kios Kopi Lintong, Pasar Lintongnihuta",
          address: "Pasar Lintongnihuta, Humbang Hasundutan Regency",
          rating: 4.5,
          hours: "07:00 – 17:00 daily",
          mapsQuery: "Pasar+Lintongnihuta+Humbang+Hasundutan",
        },
        {
          name: "Warkop Toba Highland",
          address: "Jl. Balige–Siborongborong, Lintongnihuta, Humbang Hasundutan",
          rating: 4.4,
          hours: "07:00 – 19:00 daily",
          mapsQuery: "Warkop+Toba+Highland+Lintongnihuta",
        },
      ],
    },
  ];

  /* ---------------------------------------------------------------------
     RENDER: Cards
     -------------------------------------------------------------------- */
  const grid = document.getElementById("foodGrid");
  const emptyState = document.getElementById("foodGridEmpty");
  const searchInput = document.getElementById("foodSearch");
  const chips = document.querySelectorAll(".c-chip[data-filter]");

  let activeFilter = "All";

  function starIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`;
  }

  function matchesQuery(food, q) {
    if (!q) return true;
    const hay = (food.name + " " + food.origin + " " + food.categories.join(" ")).toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function renderCards() {
    const q = searchInput ? searchInput.value.trim() : "";
    const list = FOODS.filter(
      (f) => (activeFilter === "All" || f.categories.includes(activeFilter)) && matchesQuery(f, q)
    );

    grid.innerHTML = list
      .map(
        (f, i) => `
      <article class="food-card reveal fade-up" data-delay="${(i % 3) * 90}" data-id="${f.id}">
        <div class="thumb">
          <span class="cultural-tag">${f.culturalTag}</span>
          <span class="price-badge">${f.price.split(",")[0]}+</span>
          <img src="${f.image}" alt="${f.name}, a traditional Batak dish from ${f.origin}" loading="lazy" width="400" height="300" />
        </div>
        <div class="body">
          <span class="origin-line">${f.origin}</span>
          <h3>${f.name}</h3>
          <p class="desc">${f.description}</p>
          <div class="taste-row">${f.taste.split(",").map(item => `<span>${item.trim()}</span>`).join("")}</div>
          <div class="actions">
            <button class="btn btn-dark btn-story" data-id="${f.id}" aria-haspopup="dialog">Read Story</button>
            <a class="btn btn-outline" href="https://maps.google.com/?q=${f.restaurants[0].mapsQuery}" target="_blank" rel="noopener" aria-label="Open ${f.restaurants[0].name} on Google Maps">Open Maps</a>
          </div>
        </div>
      </article>`
      )
      .join("");

    emptyState.classList.toggle("show", list.length === 0);
    observeReveals(grid);

    grid.querySelectorAll(".btn-story").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.id));
    });
  }

  /* ---------------------------------------------------------------------
     SEARCH + FILTER WIRING
     -------------------------------------------------------------------- */
  if (searchInput) searchInput.addEventListener("input", renderCards);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter;
      renderCards();
    });
  });

  /* ---------------------------------------------------------------------
     MODAL
     -------------------------------------------------------------------- */
  const overlay = document.getElementById("foodModal");
  const modalBody = document.getElementById("foodModalBody");
  let lastFocusedEl = null;

  function renderModal(f) {
    modalBody.innerHTML = `
      <div class="modal-header">
        <img src="${f.image}" alt="${f.name}" loading="lazy" />
        <div class="modal-title-wrap">
          <span class="badge">${f.culturalTag}</span>
          <h2 id="foodModalTitle">${f.name}</h2>
        </div>
        <button class="modal-close" aria-label="Close story">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-intro">${f.description}</p>

        <div class="modal-meta-row">
          <div class="meta"><span class="label">Origin</span><span class="value">${f.origin}</span></div>
          <div class="meta"><span class="label">Taste Profile</span><span class="value">${f.taste}</span></div>
          <div class="meta"><span class="label">Category</span><span class="value">${f.categories.join(", ")}</span></div>
        </div>

        <div class="modal-section"><h3>History</h3><p>${f.history}</p></div>

        <div class="modal-section"><h3>Cultural Significance</h3><p>${f.culturalSignificance}</p></div>

        <div class="modal-section">
          <h3>Ingredients</h3>
          <div class="modal-tags">${f.ingredients.map((i) => `<span>${i}</span>`).join("")}</div>
        </div>

        <div class="modal-section"><h3>Traditional Preparation</h3><p>${f.preparation}</p></div>

        <div class="modal-section">
          <h3>Recommended Restaurants</h3>
          <div class="restaurant-list">
            ${f.restaurants
              .map(
                (r) => `
              <div class="restaurant-card">
                <div class="info">
                  <h4>${r.name}</h4>
                  <p>${r.address}</p>
                  <div class="r-meta">
                    <span>${starIcon()} ${r.rating.toFixed(1)} / 5</span>
                    <span>Open ${r.hours}</span>
                  </div>
                </div>
                <a class="btn btn-primary" href="https://maps.google.com/?q=${r.mapsQuery}" target="_blank" rel="noopener">Open Google Maps</a>
              </div>`
              )
              .join("")}
          </div>
        </div>

        <div class="modal-section"><h3>Interesting Facts</h3><ul>${f.facts.map((x) => `<li>${x}</li>`).join("")}</ul></div>

        <div class="modal-section"><h3>Tips for Visitors</h3><ul>${f.tips.map((x) => `<li>${x}</li>`).join("")}</ul></div>

        <div class="modal-footer-actions">
          <button class="btn btn-outline modal-dismiss">Close</button>
        </div>
      </div>
    `;
  }

  function openModal(id) {
    const f = FOODS.find((x) => x.id === id);
    if (!f) return;
    lastFocusedEl = document.activeElement;
    renderModal(f);
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
     Reveal-on-scroll (self-contained, mirrors explore.js / culture.js)
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
  renderCards();
})();