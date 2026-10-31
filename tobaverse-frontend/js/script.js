/* =========================================================================
   TobaVerse — shared script (navigation, reveal-on-scroll, ripple, contours)
   ========================================================================= */

(function () {
  "use strict";

  /* ---------- Sticky nav shrink + mobile toggle ------------------------- */
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("nav-links--open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- SPA-style navigation for persistent audio ----------------- */
  const pageCleanupHandlers = [];
  const sharedStylePatterns = ["css/style.css", "bootstrap-icons.min.css", "fonts.googleapis.com", "fonts.gstatic.com"];
  const pageScriptElements = [];

  function resolveUrl(value, base = location.href) {
    try {
      return new URL(value, base).href;
    } catch {
      return null;
    }
  }

  function isSharedStyle(href) {
    return sharedStylePatterns.some((pattern) => href.includes(pattern));
  }

  function cleanupPage() {
    while (pageCleanupHandlers.length) {
      const fn = pageCleanupHandlers.pop();
      try {
        fn();
      } catch (error) {
        console.error("TobaVerse page cleanup failed:", error);
      }
    }

    pageScriptElements.forEach((script) => script.remove());
    pageScriptElements.length = 0;
  }

  window.__registerPageCleanup = (fn) => {
    if (typeof fn === "function") {
      pageCleanupHandlers.push(fn);
    }
  };

  function updateActiveNav(pathname) {
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const linkPath = resolveUrl(link.getAttribute("href"), location.href);
      const currentPath = resolveUrl(pathname, location.origin);
      link.classList.toggle("active", linkPath === currentPath);
    });
  }

  function updateHeadFromDoc(doc) {
    const title = doc.querySelector("title");
    if (title) {
      document.title = title.textContent;
    }

    const description = doc.querySelector('meta[name="description"]');
    if (description) {
      let currentMeta = document.querySelector('meta[name="description"]');
      if (!currentMeta) {
        currentMeta = document.createElement("meta");
        currentMeta.name = "description";
        document.head.appendChild(currentMeta);
      }
      currentMeta.content = description.getAttribute("content") || "";
    }

    if (doc.body) {
      document.body.className = doc.body.className;
    }

    if (doc.documentElement && doc.documentElement.lang) {
      document.documentElement.lang = doc.documentElement.lang;
    }
  }

  function updateStylesFromDoc(doc) {
    const newStyles = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))
      .map((link) => resolveUrl(link.getAttribute("href"), doc.baseURI))
      .filter(Boolean);

    const currentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
      .map((link) => resolveUrl(link.getAttribute("href")))
      .filter(Boolean);

    newStyles.forEach((href) => {
      if (!currentStyles.includes(href)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    Array.from(document.querySelectorAll('link[rel="stylesheet"][href]')).forEach((link) => {
      const href = resolveUrl(link.getAttribute("href"));
      if (!href || newStyles.includes(href) || isSharedStyle(href)) {
        return;
      }
      link.remove();
    });
  }

  function observeReveals(root = document) {
    const revealEls = root.querySelectorAll(".reveal:not(.is-visible)");
    if (!revealEls.length) return;
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
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
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  function loadPageScripts(doc) {
    const scripts = Array.from(doc.querySelectorAll('script[src]'))
      .map((script) => resolveUrl(script.getAttribute("src"), doc.baseURI))
      .filter(Boolean)
      .filter((src) => !src.includes("/js/script.js") && !src.includes("/js/music.js"));

    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
      pageScriptElements.push(script);
    });
  }

  async function navigateTo(url, { replaceState = false } = {}) {
    cleanupPage();

    try {
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) {
        window.location.href = url;
        return;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newMain = doc.getElementById("main");
      if (!newMain) {
        window.location.href = url;
        return;
      }

      updateHeadFromDoc(doc);
      updateStylesFromDoc(doc);

      const preservedHeader = document.querySelector("header.site-nav");
      const preservedSkipLink = document.querySelector(".skip-link");
      const preservedAudio = document.getElementById("bgMusic");
      const body = document.body;
      const preservedElements = [preservedSkipLink, preservedHeader, preservedAudio].filter(Boolean);

      Array.from(body.children).forEach((child) => {
        if (!preservedElements.includes(child)) {
          child.remove();
        }
      });

      if (preservedHeader && navLinks && navLinks.classList.contains("nav-links--open")) {
        navLinks.classList.remove("nav-links--open");
        navToggle.setAttribute("aria-expanded", "false");
      }

      body.className = doc.body.className;
      document.documentElement.lang = doc.documentElement.lang;

      if (preservedHeader && preservedHeader.parentElement !== body) {
        body.appendChild(preservedHeader);
      }
      if (preservedSkipLink && preservedSkipLink.parentElement !== body) {
        body.appendChild(preservedSkipLink);
      }
      if (preservedAudio && preservedAudio.parentElement !== body) {
        body.appendChild(preservedAudio);
      }

      Array.from(doc.body.children).forEach((child) => {
        if (child.tagName === "HEADER" && child.classList.contains("site-nav")) return;
        if (child.classList && child.classList.contains("skip-link")) return;
        if (child.tagName === "AUDIO" && child.id === "bgMusic") return;
        if (child.tagName === "SCRIPT") return;
        body.appendChild(child.cloneNode(true));
      });

      updateActiveNav(new URL(url, location.href).pathname);

      if (replaceState) {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }

      window.scrollTo(0, 0);
      loadPageScripts(doc);
      window.setTimeout(() => {
        document.dispatchEvent(new CustomEvent("page:loaded", { detail: { url } }));
      }, 0);
      observeReveals(document);
    } catch (error) {
      console.error("TobaVerse navigation failed:", error);
      window.location.href = url;
    }
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

    const linkUrl = resolveUrl(href, location.href);
    if (!linkUrl) return;

    const url = new URL(linkUrl);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (!url.pathname.endsWith(".html")) return;

    event.preventDefault();
    navigateTo(url.href);
  });

  window.addEventListener("popstate", () => {
    navigateTo(location.href, { replaceState: true });
  });

  /* ---------- Scroll-reveal via IntersectionObserver --------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add("is-visible"), Number(delay));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Button ripple effect (delegated so dynamic buttons work) --- */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  /* ---------- Generative contour-ring SVG (caldera motif) ---------------- */
  function buildContours(container, opts) {
    if (!container) return;
    const {
      rings = 9,
      cx = 50,
      cy = 50,
      spacing = 5.4,
      jitter = 2.2,
      accentEvery = 4,
    } = opts || {};
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");

    for (let i = 1; i <= rings; i++) {
      const r = i * spacing;
      const points = [];
      const segments = 48;
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const wobble = Math.sin(angle * 3 + i) * jitter * (i / rings);
        const rad = r + wobble;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad * 0.86;
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      const path = document.createElementNS(svgns, "polygon");
      path.setAttribute("points", points.join(" "));
      path.setAttribute(
        "class",
        "contour-ring" + (i % accentEvery === 0 ? " accent" : "")
      );
      svg.appendChild(path);
    }
    container.appendChild(svg);
  }

  document.querySelectorAll("[data-contours]").forEach((el) => {
    buildContours(el, {
      rings: Number(el.dataset.rings) || 9,
      spacing: Number(el.dataset.spacing) || 5.4,
    });
  });

  /* ---------- Footer year -------------------------------------------------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();