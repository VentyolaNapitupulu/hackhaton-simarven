/* =========================================================================
   TobaVerse — Events page logic
   Upcoming events, cultural experiences, the annual month timeline, and
   the event gallery are all data-driven and rendered into the markup
   defined by css/events.css.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA — only real, well-known Lake Toba events. No invented festivals,
     no fabricated dates: everything without an announced date reads "TBA".
     -------------------------------------------------------------------- */
  const UPCOMING_EVENTS = [
    {
      id: "f1-powerboat",
      name: "F1 Powerboat Lake Toba",
      image: "assets/images/events/f1-powerboat.jpg",
      location: "Balige",
      date: "TBA",
      description: "An international powerboat championship attracting athletes and visitors from around the world.",
    },
    {
      id: "horas-samosir-fiesta",
      name: "Horas Samosir Fiesta",
      image: "assets/images/events/horas-samosir-fiesta.jpg",
      location: "Pangururan, Samosir",
      date: "TBA",
      description: "A vibrant cultural festival celebrating Batak traditions through performances, local cuisine, handicrafts, and community activities.",
    },
    {
      id: "samosir-music-international",
      name: "Samosir Music International",
      image: "assets/images/events/samosir-music-international.jpg",
      location: "Samosir Island",
      date: "TBA",
      description: "A music festival bringing together local and international musicians in the breathtaking scenery of Lake Toba.",
    },
    {
      id: "pesta-rondang-bittang",
      name: "Pesta Rondang Bittang",
      image: "assets/images/events/pesta-rondang-bittang.jpg",
      location: "Simalungun",
      date: "TBA",
      description: "One of North Sumatra's oldest traditional thanksgiving celebrations filled with dance, music, and Batak cultural heritage.",
    },
  ];

  const CULTURAL_EXPERIENCES = [
    {
      id: "tortor-dance",
      name: "Traditional Tortor Dance",
      image: "assets/images/events/tortor-dance.jpg",
      description: "Experience the iconic Batak dance performed during ceremonies and celebrations.",
    },
    {
      id: "sigale-gale",
      name: "Sigale-gale Performance",
      image: "assets/images/events/sigale-gale.jpg",
      description: "Witness the famous wooden puppet performance unique to Samosir Island.",
    },
    {
      id: "ulos-weaving",
      name: "Traditional Ulos Weaving",
      image: "assets/images/events/ulos-weaving.jpg",
      description: "Discover how local artisans preserve the centuries-old tradition of weaving Ulos.",
    },
    {
      id: "gondang-batak",
      name: "Gondang Batak Music",
      image: "assets/images/events/gondang-batak.jpg",
      description: "Enjoy authentic Batak musical performances featuring traditional instruments.",
    },
  ];

  const MONTHS = [
    { label: "January", event: null },
    { label: "February", event: null },
    { label: "March", event: null },
    { label: "April", event: null },
    { label: "May", event: null },
    { label: "June", event: null },
    { label: "July", event: "Festival Danau Toba" },
    { label: "August", event: "Horas Samosir Fiesta" },
    { label: "September", event: "Samosir Music International" },
    { label: "October", event: "Pesta Rondang Bittang" },
    { label: "November", event: null },
    { label: "December", event: null },
  ];

const GALLERY = [
  { image:"assets/images/events/gallery-1.jpg", alt:"Cultural festival performance at Lake Toba" },
  { image:"assets/images/events/gallery-2.jpg", alt:"Traditional Batak dance performance" },
  { image:"assets/images/events/gallery-3.jpg", alt:"Community celebration around Lake Toba" },
  { image:"assets/images/events/gallery-4.jpg", alt:"Sigale-gale wooden puppet performance" },
  { image:"assets/images/events/gallery-5.jpg", alt:"Gondang Batak musical performance" },
  { image:"assets/images/events/gallery-6.jpg", alt:"Festival crowd at Lake Toba" }
];

  /* ---------------------------------------------------------------------
     RENDER: Upcoming events
     -------------------------------------------------------------------- */
  const eventsGrid = document.getElementById("eventsGrid");
  if (eventsGrid) {
    eventsGrid.innerHTML = UPCOMING_EVENTS.map(
      (e, i) => `
      <article class="event-card reveal fade-up" data-delay="${i * 90}">
        <div class="thumb">
          <span class="date-badge">${e.date}</span>
          <img src="${e.image}" alt="${e.name}" loading="lazy" width="400" height="300" />
        </div>
        <div class="body">
          <span class="loc">${e.location}</span>
          <h3>${e.name}</h3>
          <p class="desc">${e.description}</p>
        </div>
      </article>`
    ).join("");
    observeReveals(eventsGrid);
  }

  /* ---------------------------------------------------------------------
     RENDER: Cultural experiences
     -------------------------------------------------------------------- */
  const experienceGrid = document.getElementById("experienceGrid");
  if (experienceGrid) {
    experienceGrid.innerHTML = CULTURAL_EXPERIENCES.map(
      (c, i) => `
      <article class="experience-card reveal fade-up" data-delay="${i * 90}">
        <div class="thumb">
          <img src="${c.image}" alt="${c.name}" loading="lazy" width="360" height="360" />
        </div>
        <div class="body">
          <h4>${c.name}</h4>
          <p>${c.description}</p>
        </div>
      </article>`
    ).join("");
    observeReveals(experienceGrid);
  }

  /* ---------------------------------------------------------------------
     RENDER: Annual event timeline
     -------------------------------------------------------------------- */
  const timelineScroll = document.getElementById("timelineScroll");
  if (timelineScroll) {
    timelineScroll.innerHTML = MONTHS.map(
      (m, i) => `
      <div class="month-card${m.event ? " has-event" : ""} reveal fade-up" data-delay="${i * 30}">
        <span class="month-label">${m.label}</span>
        <h4>${m.event ? m.event : "—"}</h4>
        <span class="event-date">TBA</span>
      </div>`
    ).join("");
    observeReveals(timelineScroll);
  }

  /* ---------------------------------------------------------------------
     RENDER: Event gallery
     -------------------------------------------------------------------- */
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) {
    galleryGrid.innerHTML = GALLERY.map(
      (g, i) => `
      <div class="gallery-item reveal fade-up" data-delay="${(i % 3) * 90}">
        <img src="${g.image}" alt="${g.alt}" loading="lazy" width="480" height="480" />
      </div>`
    ).join("");
    observeReveals(galleryGrid);
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

  observeReveals(document);
})();