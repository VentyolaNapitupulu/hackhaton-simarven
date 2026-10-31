/* =========================================================================
   TobaVerse — Journey page logic
   Transportation options data, card rendering, the "View Details" modal,
   and a subtle scroll-based parallax on the hero background.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     DATA
     -------------------------------------------------------------------- */
  const OPTIONS = [
    {
      id: "car-rental",
      title: "Car Rental",
      image: "assets/images/journey/transportation/car-rental.jpg",
      isPng: false,
      badge: "Self-drive",
      description: "Rent a comfortable private car to explore Lake Toba and nearby attractions at your own pace.",
      features: ["Air Conditioning", "Automatic Transmission", "Driver Available", "5–7 Seats"],
      travelTime: "Flexible, self-paced",
      bestFor: "Families & small groups",
      cost: "Rp 400,000 – 700,000 / day",
      goodToKnow: "Book a day ahead during weekends and dry-season holidays — cars sell out fastest around Parapat and Balige.",
      contact: "Book a car rental by email at hello@tobaverse.travel or call +62 812 3456 7890.",
    },
    {
      id: "motorcycle-rental",
      title: "Motorcycle Rental",
      image: "assets/images/journey/transportation/motorcycle.png",
      isPng: true,
      badge: "Solo & scenic",
      description: "Perfect for solo travelers looking to discover scenic roads and hidden villages around Lake Toba.",
      features: ["Helmet Included", "Fuel Efficient", "Easy Parking", "Daily Rental"],
      travelTime: "Flexible, self-paced",
      bestFor: "Solo travelers & photographers",
      cost: "Rp 80,000 – 120,000 / day",
      goodToKnow: "Highland roads can be steep and winding — bring a full tank, protective gear, and a local map.",
      contact: "Reserve a motorcycle rental via hello@tobaverse.travel or WhatsApp +62 812 3456 7890.",
    },
    {
      id: "ferry",
      title: "Ferry Crossing",
      image: "assets/images/journey/transportation/ferry.jpg",
      isPng: false,
      badge: "Scenic crossing",
      description: "Cross Lake Toba from Ajibata to Tomok and enjoy breathtaking volcanic lake scenery.",
      features: ["Scenic Crossing", "40–50 Minutes", "Frequent Departures", "Passenger & Vehicle Ferry"],
      travelTime: "40 – 50 minutes",
      bestFor: "Budget travelers & day-trippers",
      cost: "Rp 10,000 – 100,000 (passenger to vehicle)",
      goodToKnow: "Ferries can queue during weekends and holidays — arrive 30 minutes early to keep your schedule.",
      contact: "Ferry ticketing is handled at Ajibata harbor; questions can be sent to hello@tobaverse.travel.",
    },
    {
      id: "airport-transfer",
      title: "Airport Transfer",
      image: "assets/images/journey/transportation/airport.jpg",
      isPng: false,
      badge: "Arrival day",
      description: "Travel easily from Silangit International Airport to Lake Toba with private or shared transportation.",
      features: ["Airport Pickup", "Comfortable Ride", "Local Drivers", "Flexible Schedule"],
      travelTime: "Around 2.5 – 3 hours to Parapat",
      bestFor: "First-time visitors flying in",
      cost: "Rp 150,000 – 350,000 / trip",
      goodToKnow: "Shared shuttles run on a schedule while private transfers are on-demand — book private ahead if your flight lands late.",
      contact: "Email hello@tobaverse.travel or call +62 812 3456 7890 for airport transfer bookings.",
    },
  ];

  /* ---------------------------------------------------------------------
     RENDER: Transportation cards
     -------------------------------------------------------------------- */
  const grid = document.getElementById("journeyGrid");

  function renderCards() {
    grid.innerHTML = OPTIONS.map(
      (o, i) => `
      <article class="journey-card${o.isPng ? " is-png" : ""} reveal fade-up" data-delay="${i * 90}" data-id="${o.id}">
        <div class="thumb">
          <img src="${o.image}" alt="${o.title}" loading="lazy" width="400" height="300" />
        </div>
        <div class="body">
          <h3>${o.title}</h3>
          <p class="desc">${o.description}</p>
          <ul class="feature-list">${o.features.map((f) => `<li>${f}</li>`).join("")}</ul>
          <button class="btn btn-dark btn-details" data-id="${o.id}" aria-haspopup="dialog">View Details</button>
        </div>
      </article>`
    ).join("");

    observeReveals(grid);
  }

  /* ---------------------------------------------------------------------
     MODAL: View Details
     -------------------------------------------------------------------- */
  const overlay = document.getElementById("journeyModal");
  const modalBody = document.getElementById("journeyModalBody");
  let lastFocusedEl = null;

  function renderModal(o) {
    modalBody.innerHTML = `
      <div class="modal-header${o.isPng ? " is-png" : ""}">
        <img src="${o.image}" alt="${o.title}" loading="lazy" />
        <div class="modal-title-wrap">
          <span class="badge">${o.badge}</span>
          <h2 id="journeyModalTitle">${o.title}</h2>
        </div>
        <button class="modal-close" aria-label="Close details">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-intro">${o.description}</p>

        <div class="modal-meta-row">
          <div class="meta"><span class="label">Travel Time</span><span class="value">${o.travelTime}</span></div>
          <div class="meta"><span class="label">Best For</span><span class="value">${o.bestFor}</span></div>
          <div class="meta"><span class="label">Estimated Cost</span><span class="value">${o.cost}</span></div>
        </div>

        <div class="modal-section">
          <h3>Features</h3>
          <div class="modal-tags">${o.features.map((f) => `<span>${f}</span>`).join("")}</div>
        </div>

            <div class="modal-section">
          <h3>Good to Know</h3>
          <p>${o.tip}</p>
        </div>

        <div class="modal-section">
          <h3>Contact</h3>
          <p>${o.contact || "Email hello@tobaverse.travel for booking details."}</p>
        </div>

        <div class="modal-footer-actions">
          <a class="btn btn-primary" href="mailto:hello@tobaverse.travel?subject=${encodeURIComponent(o.title + " enquiry")}">Contact for Booking</a>
          <button class="btn btn-outline modal-dismiss">Close</button>
        </div>
      </div>
    `;
  }

  function openModal(id) {
    const o = OPTIONS.find((x) => x.id === id);
    if (!o) return;
    lastFocusedEl = document.activeElement;
    renderModal(o);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = modalBody.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
    const modalClose = modalBody.querySelector(".modal-close");
    const modalDismiss = modalBody.querySelector(".modal-dismiss");
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalDismiss) modalDismiss.addEventListener("click", closeModal);
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
     Hero parallax (subtle, disabled for prefers-reduced-motion)
     -------------------------------------------------------------------- */
  const heroBg = document.querySelector(".journey-hero .hero-bg");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (heroBg && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const offset = window.scrollY * 0.22;
          heroBg.style.transform = `translateY(${offset}px)`;
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
     GRID CLICK HANDLING
     -------------------------------------------------------------------- */
  function handleGridClick(event) {
    const button = event.target.closest(".btn-details");
    if (!button || !grid.contains(button)) return;
    const id = button.dataset.id;
    if (!id) return;
    openModal(id);
  }

  /* ---------------------------------------------------------------------
     INIT
     -------------------------------------------------------------------- */
  renderCards();
  grid.addEventListener("click", handleGridClick);
  observeReveals(document);
})();

/* =========================================================================
   APPENDED — FAQ accordion for the new "Frequently Asked Questions" section.
   Self-contained; does not modify any code above.
   ========================================================================= */
(function () {
  "use strict";

  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Classic single-open accordion: close any other open item first.
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = "0px";
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = "0px";
      } else {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
})();