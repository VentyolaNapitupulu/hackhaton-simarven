/* =========================================================================
   TobaVerse — Culture page logic
   Timeline eras, clan (marga) data + modal, traditional house flip cards,
   ulos gallery, and the Dalihan Na Tolu interactive diagram.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA
     -------------------------------------------------------------------- */
  const ERAS = [
    {
      id: "prehistoric",
      label: "Prehistoric",
      period: "Before the 12th century",
      title: "Settling the caldera",
      desc: "Long before written record, communities settled the highlands ringing Lake Toba, tracing their genealogy back to a shared ancestor, Si Raja Batak. Oral tradition — not text — carried history forward through this period.",
      points: [
        "Megalithic stone monuments and carved sarcophagi survive from this era around Samosir and the Toba highlands.",
        "Ancestor veneration and animist belief shaped early ritual life, later layered with Hindu-Buddhist influence from trade contact.",
        "Genealogies (tarombo) were memorized and recited rather than written, a practice still maintained today.",
      ],
    },
    {
      id: "kingdom",
      label: "Kingdom",
      period: "12th – 19th century",
      title: "Clans, courts, and the Sisingamangaraja line",
      desc: "Batak society organized around clan territories governed by customary law, with the Sisingamangaraja dynasty at Bakkara holding a spiritual and political authority recognized across much of the Toba highlands.",
      points: [
        "Village clusters were self-governing under clan elders, with disputes settled at customary courts like the one preserved at Huta Siallagan.",
        "The Sisingamangaraja title combined religious authority with regional leadership, passed down through twelve generations.",
        "Trade in camphor, benzoin resin, and highland produce connected Toba's communities to wider Sumatran trade networks.",
      ],
    },
    {
      id: "colonial",
      label: "Colonial Era",
      period: "1860s – 1945",
      title: "Missions, resistance, and administration",
      desc: "Dutch colonial expansion reached the Toba highlands through the second half of the 19th century, arriving alongside German and Dutch Christian missionaries — and meeting sustained resistance under Sisingamangaraja XII.",
      points: [
        "Missionary Ludwig Ingwer Nommensen began work among the Toba Batak from the 1860s, and Christianity became widely adopted over the following decades.",
        "Sisingamangaraja XII led armed resistance against Dutch annexation until his death in 1907.",
        "Colonial administration introduced new roads and schooling that gradually connected Toba's villages to wider Sumatra.",
      ],
    },
    {
      id: "modern",
      label: "Modern Era",
      period: "1945 – present",
      title: "Migration, memory, and Geopark status",
      desc: "Since Indonesian independence, Batak communities have spread across the archipelago and abroad, while institutions around the lake work to keep language, weaving, music, and clan structure alive for new generations.",
      points: [
        "Large Batak diaspora communities in Jakarta, Medan, and beyond maintain clan associations and hold regular reunions.",
        "Lake Toba was recognized as a UNESCO Global Geopark, tying geological and cultural heritage together.",
        "Cultural centers such as the T.B. Silalahi Center in Balige actively document and teach Batak traditions today.",
      ],
    },
  ];

  const CLANS = [
    {
      id: "sitorus",
      name: "Sitorus",
      color: "#1F7A5C",
      region: "Porsea, Tobasa",
      history:
        "Batak genealogical tradition places the Sitorus marga within the Sumba lineage branch of the Toba Batak family tree. The clan's ancestral villages cluster around Sibisa, Porsea, Tobasa on the lake's southern shore, an area still closely associated with the marga's customary elders today.",
      notes: ["Sumba lineage branch", "Ancestral home: southern Toba shore", "Active clan association (punguan) network"],
    },
    {
      id: "simanjuntak",
      name: "Simanjuntak",
      color: "#1D6F8C",
      region: "Balige",
      history:
        "One of the larger Toba Batak marga by population, Simanjuntak descent is traced through the Naiambaton branch of the wider genealogy. Historic settlement areas span the Balige, and the clan maintains one of the most active diaspora associations of any Batak marga.",
      notes: ["Naiambaton branch", "Large modern diaspora", "Regular nationwide clan gatherings"],
    },
    {
      id: "sinaga",
      name: "Sinaga",
      color: "#9C3B3B",
      region: "Samosir",
      history:
        "The Sinaga marga belongs to the Naipospos lineage cluster, with ancestral roots historically centered near Samosir. Oral origin stories passed within the clan link the marga's name to symbolic associations with a serpent figure, a motif that still appears in some family ceremonial retellings.",
      notes: ["Naipospos lineage cluster", "Northwestern shore ancestry", "Serpent motif in oral origin stories"],
    },
    {
      id: "panjaitan",
      name: "Panjaitan",
      color: "#E08D3C",
      region: "Matio, Sitorang, Balige",
      history:
        "Panjaitan descent is recorded within the Toba genealogical tree alongside related marga settled around Balige, Matio, and Sitorang. The clan is widely recognized nationally through General Donald Isaac Panjaitan, one of Indonesia's national heroes, whose family roots trace to this marga.",
      notes: ["Balige / Silalahi lineage area", "Nationally recognized modern figures", "Strong customary land ties"],
    },
    {
      id: "nainggolan",
      name: "Nainggolan",
      color: "#3FAE85",
      region: "Samosir (Onan Runggu)",
      history:
        "The Nainggolan marga's ancestral villages sit on Samosir Island's eastern shore near Onan Runggu. Batak oral history associates early generations of the clan with guardianship of local ceremonial adat land, a role reflected in the marga's continuing customary standing in the area.",
      notes: ["Eastern Samosir ancestry", "Historic adat land guardianship", "Onan Runggu customary area"],
    },
    {
      id: "hutapea",
      name: "Hutapea",
      color: "#C77D2E",
      region: "Balige & Laguboti",
      history:
        "The name Hutapea combines huta (village) with the name of its founding settlement, a naming pattern common among Toba marga. The clan's home villages lie in the Balige–Laguboti basin, on the same southern shore shared with several related lineage branches.",
      notes: ["Village-founder naming pattern", "Southern Toba basin ancestry", "Related to nearby Balige lineages"],
    },
  ];

  const HOUSES = [
    {
      id: "bolon",
      name: "Rumah Bolon",
      image: "assets/images/culture/architecture/rumah-bolon.jpg",
      explanation:
        "Raised on wooden piles with a steep, saddle-shaped roof echoing a buffalo's horns, Rumah Bolon was built to hold an entire extended family — its vertical structure of piles, floor, and roof is often read as mirroring the Batak cosmos itself.",
    },
    {
      id: "jabu",
      name: "Jabu",
      image: "assets/images/culture/architecture/jabu.jpg",
      explanation:
        "Inside a traditional house, the single open floor is divided into named sections — jabu — rather than walled rooms, each carrying a fixed social role that enacts Dalihan Na Tolu in miniature.",
    },
  ];

  const ULOS = [
    {
      id: "ragidup",
      name: "Ulos Ragidup",
      image: "assets/images/culture/ulos/ulos-ragiidup.jpg",
      meaning: "'Pattern of Life' — the most complex and sacred ulos, traditionally reserved for major life ceremonies as a wish for a long, complete life.",
    },
    {
      id: "ragihotang",
      name: "Ulos Ragihotang",
      image: "assets/images/culture/ulos/ulos-ragihotang.jpg",
      meaning: "Dominated by deep black tones, worn at funerals and mourning ceremonies as an expression of grief and remembrance.",
    },
    {
      id: "sibolang",
      name: "Ulos Sibolang",
      image: "assets/images/culture/ulos/ulos-sibolang.jpg",
      meaning: "A dark blue-black mourning ulos, traditionally given by a wife's family to her in-laws during bereavement.",
    },
    {
      id: "mangiring",
      name: "Ulos Mangiring",
      image: "assets/images/culture/ulos/ulos-mangiring.jpeg",
      meaning: "'Following in a row' — repeating parallel motifs symbolize togetherness, given to couples as a wish for many descendants.",
    },
    {
      id: "bintang-maratur",
      name: "Ulos Bintang Maratur",
      image: "assets/images/culture/ulos/ulos-bintang-maratur.jpg",
      meaning: "'Orderly stars' — given to bless a growing family with the wish for well-ordered, harmonious offspring.",
    },
    {
      id: "sadum",
      name: "Ulos Sadum",
      image: "assets/images/culture/ulos/ulos-sadum.jpg",
      meaning: "A vividly colored, festive ulos worn at celebrations — a textile of welcome and joy rather than mourning.",
    },
  ];

  const DNT_ROLES = {
    "hula-hula": {
      tag: "Wife-givers",
      title: "Hula-hula",
      desc: "The family that a man's wife comes from. In Dalihan Na Tolu, hula-hula are treated with the highest respect and are seated and served first at every ceremony — the source of life and blessing within the kinship system.",
    },
    "dongan-tubu": {
      tag: "Same-clan kin",
      title: "Dongan Tubu",
      desc: "Male members who share the same marga — brothers in the widest sense. This leg of the triangle represents solidarity and equality: dongan tubu stand together and support one another as one lineage.",
    },
    boru: {
      tag: "Wife-receivers",
      title: "Boru",
      desc: "The family that receives a daughter in marriage. Boru take on a role of service and support at ceremonies — organizing, serving, and carrying out the practical work that keeps an event running.",
    },
  };

  /* ---------------------------------------------------------------------
     RENDER: Timeline
     -------------------------------------------------------------------- */
  const track = document.getElementById("timelineTrack");
  const fillLine = document.getElementById("timelineFill");
  const panel = document.getElementById("eraPanel");

  function renderTimelineNav() {
    track.innerHTML = ERAS.map(
      (era, i) => `
      <button class="era-btn${i === 0 ? " is-active" : ""}" data-era="${era.id}" aria-pressed="${i === 0}">
        <span class="dot">${String(i + 1).padStart(2, "0")}</span>
        <span class="label">${era.label}</span>
      </button>`
    ).join("");
  }

  function renderEraPanel(id) {
    const era = ERAS.find((e) => e.id === id);
    if (!era) return;
    panel.innerHTML = `
      <div>
        <span class="era-period">${era.period}</span>
        <h3>${era.title}</h3>
        <p class="era-desc">${era.desc}</p>
      </div>
      <ul class="era-points">${era.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    `;
    const idx = ERAS.findIndex((e) => e.id === id);
    const pct = (idx / (ERAS.length - 1)) * 100;
    fillLine.style.width = pct + "%";
  }

  function wireTimeline() {
    track.querySelectorAll(".era-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        track.querySelectorAll(".era-btn").forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        renderEraPanel(btn.dataset.era);
      });
    });
  }

  /* ---------------------------------------------------------------------
     RENDER: Clans + modal
     -------------------------------------------------------------------- */
  const clanGrid = document.getElementById("clanGrid");
  const clanModal = document.getElementById("clanModal");
  const clanModalBody = document.getElementById("clanModalBody");
  let lastFocused = null;

  function initials(name) {
    return name.slice(0, 2).toUpperCase();
  }

  function renderClans() {
    clanGrid.innerHTML = CLANS.map(
      (c, i) => `
      <button class="clan-card reveal fade-up" data-delay="${(i % 6) * 60}" data-id="${c.id}" aria-haspopup="dialog">
        <span class="glyph" style="background:${c.color}">${initials(c.name)}</span>
        <h4>${c.name}</h4>
        <span class="tag">${c.region}</span>
      </button>`
    ).join("");

    clanGrid.querySelectorAll(".clan-card").forEach((card) => {
      card.addEventListener("click", () => openClanModal(card.dataset.id));
    });
    observeReveals(clanGrid);
  }

  function openClanModal(id) {
    const c = CLANS.find((x) => x.id === id);
    if (!c) return;
    lastFocused = document.activeElement;
    clanModalBody.innerHTML = `
      <div class="modal-header" style="background:${c.color}">
        <span class="badge">Marga · Batak Clan</span>
        <h2 id="clanModalTitle">${c.name}</h2>
        <button class="modal-close" aria-label="Close">✕</button>
      </div>
      <div class="modal-body-inner">
        <p>${c.history}</p>
        <div class="modal-tags">${c.notes.map((n) => `<span>${n}</span>`).join("")}</div>
      </div>
    `;
    clanModal.classList.add("open");
    clanModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = clanModalBody.querySelector(".modal-close");
    closeBtn.focus();
    closeBtn.addEventListener("click", closeClanModal);
  }

  function closeClanModal() {
    clanModal.classList.remove("open");
    clanModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  clanModal.addEventListener("click", (e) => {
    if (e.target === clanModal) closeClanModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && clanModal.classList.contains("open")) closeClanModal();
  });

  /* ---------------------------------------------------------------------
     RENDER: Houses (image gallery)
     -------------------------------------------------------------------- */
  const houseGrid = document.getElementById("houseGrid");

  function renderHouses() {
    houseGrid.innerHTML = HOUSES.map(
      (h, i) => `
      <article class="house-card reveal fade-up" data-delay="${i * 100}">
        <div class="house-thumb">
          <img src="${h.image}" alt="${h.name}, traditional Batak architecture" loading="lazy" width="480" height="340" />
        </div>
        <div class="house-body">
          <h3>${h.name}</h3>
          <p>${h.explanation}</p>
        </div>
      </article>`
    ).join("");

    observeReveals(houseGrid);
  }

  /* ---------------------------------------------------------------------
     RENDER: Ulos gallery
     -------------------------------------------------------------------- */
  const ulosGallery = document.getElementById("ulosGallery");

  function renderUlos() {
    ulosGallery.innerHTML = ULOS.map(
      (u, i) => `
      <div class="ulos-item reveal fade-up" data-delay="${(i % 3) * 90}" tabindex="0">
        <img class="photo" src="${u.image}" alt="${u.name}, a traditional Batak woven textile" loading="lazy" width="360" height="450" />
        <div class="caption">
          <h4>${u.name}</h4>
          <p>${u.meaning}</p>
        </div>
      </div>`
    ).join("");
    observeReveals(ulosGallery);
  }

  /* ---------------------------------------------------------------------
     RENDER: Dalihan Na Tolu diagram
     -------------------------------------------------------------------- */
  const dntNodes = document.querySelectorAll(".dnt-node");
  const roleCards = document.querySelectorAll(".role-card");

  function showRole(id) {
    dntNodes.forEach((n) => n.classList.toggle("is-active", n.dataset.role === id));
    roleCards.forEach((c) => c.classList.toggle("show", c.dataset.role === id));
  }

  dntNodes.forEach((node) => {
    node.addEventListener("click", () => showRole(node.dataset.role));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showRole(node.dataset.role);
      }
    });
  });

  /* ---------------------------------------------------------------------
     Reveal-on-scroll (self-contained, works for repeated renders)
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
  renderTimelineNav();
  renderEraPanel(ERAS[0].id);
  wireTimeline();
  renderClans();
  renderHouses();
  renderUlos();
  showRole("hula-hula");
  observeReveals(document);
})();