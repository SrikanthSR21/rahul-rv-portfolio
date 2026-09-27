(function () {
  "use strict";

  const CONTENT_URL = "content/site-content.json";
  const $app = document.getElementById("app");

  document.getElementById("footerYear").textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightboxContent");
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  function openLightboxVideo(src) {
    lightboxContent.innerHTML = "";
    const v = document.createElement("video");
    v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
    lightboxContent.appendChild(v);
    lightbox.classList.add("open");
  }
  function openLightboxImage(src, alt) {
    lightboxContent.innerHTML = "";
    const img = document.createElement("img");
    img.src = src; img.alt = alt || "";
    lightboxContent.appendChild(img);
    lightbox.classList.add("open");
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxContent.innerHTML = "";
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function isDirectVideo(url) {
    return /\.(mp4|webm|mov)$/i.test(url || "");
  }
  function isEmbeddable(url) {
    return /youtube\.com|youtu\.be|vimeo\.com|instagram\.com|facebook\.com|fb\.watch/i.test(url || "");
  }
  function embedUrl(url) {
    if (/youtu\.be\//.test(url)) {
      const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (/youtube\.com\/watch/.test(url)) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (/youtube\.com\/shorts\//.test(url)) {
      const id = url.split("youtube.com/shorts/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (/vimeo\.com\//.test(url)) {
      const id = url.split("vimeo.com/")[1].split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    if (/instagram\.com\/(reel|p|tv)\//.test(url)) {
      const clean = url.split(/[?#]/)[0].replace(/\/$/, "");
      return `${clean}/embed`;
    }
    if (/facebook\.com\/.*\/videos\//.test(url) || /fb\.watch\//.test(url)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    }
    return url;
  }

  function lazyImg(src, alt, cls) {
    return `<img data-lazy="${esc(src)}" alt="${esc(alt || "")}" class="skeleton ${cls || ""}" loading="lazy">`;
  }

  function applyLazyLoading(root) {
    const imgs = root.querySelectorAll("img[data-lazy]");
    if (!("IntersectionObserver" in window)) {
      imgs.forEach((img) => { img.src = img.dataset.lazy; img.classList.remove("skeleton"); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.lazy;
          img.addEventListener("load", () => img.classList.remove("skeleton"), { once: true });
          io.unobserve(img);
        }
      });
    }, { rootMargin: "200px" });
    imgs.forEach((img) => io.observe(img));
  }

  function applyFadeIn(root) {
    const els = root.querySelectorAll(".lazy-fade");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  // ---- Section renderers ----

  function renderHome(d) {
    return `
    <section id="home" class="hero">
      <div class="hero-bg"></div>
      <div class="container">
        <div>
          <div class="eyebrow">Portfolio</div>
          <h1>${esc(d.name)}</h1>
          <div class="headline">${esc(d.headline)}</div>
          <p class="tagline">${esc(d.tagline)}</p>
          <div class="btn-row">
            <a href="#" class="btn btn-primary" id="watchShowreelBtn">${esc(d.ctaWatchText || "Watch Showreel")}</a>
            <a href="#contact" class="btn btn-outline">${esc(d.ctaContactText || "Contact for Projects")}</a>
          </div>
        </div>
        <div class="hero-portrait-wrap lazy-fade">
          ${lazyImg(d.portraitImage, d.name)}
        </div>
      </div>
    </section>`;
  }

  function renderAbout(d) {
    const langs = (d.languages || []).map((l) => `<span class="fact-pill">${esc(l)}</span>`).join("");
    return `
    <section id="about">
      <div class="container about-grid">
        <div class="about-photo lazy-fade">${lazyImg(d.profileImage, "About Rahul")}</div>
        <div>
          <div class="eyebrow">About</div>
          <h2>${esc(d.heading)}</h2>
          <p>${esc(d.bio)}</p>
          <div class="about-facts">
            <span class="fact-pill">Age ${esc(d.age)}</span>
            <span class="fact-pill">${esc(d.location)}</span>
            <span class="fact-pill">${esc(d.education)}</span>
            ${langs}
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderJourney(d) {
    const items = (d.milestones || []).map((m) => `
      <div class="timeline-item lazy-fade">
        <div class="timeline-year">${esc(m.year)}</div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.description)}</p>
      </div>`).join("");
    return `
    <section id="journey">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">Journey</div>
          <h2>${esc(d.heading)}</h2>
        </div>
        <div class="timeline">${items}</div>
      </div>
    </section>`;
  }

  function renderPortfolio(d) {
    const cards = (d.projects || []).map((p, pi) => {
      const vids = (p.videos || []).filter((v) => v && v.videoUrl);
      const videoBadge = vids.length
        ? `<div class="play-badge" data-project-video="${pi}"><span>&#9658;</span></div>`
        : "";
      return `
      <div class="card lazy-fade">
        <div class="card-media">${lazyImg(p.coverImage, p.title)}${videoBadge}</div>
        <div class="card-body">
          <h3>${esc(p.title)}</h3>
          <div class="card-meta">${esc(p.role)}${p.year ? " · " + esc(p.year) : ""}</div>
          <p>${esc(p.description)}</p>
        </div>
      </div>`;
    }).join("");
    return `
    <section id="portfolio">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">Portfolio</div>
          <h2>${esc(d.heading)}</h2>
          <p>${esc(d.subheading)}</p>
        </div>
        <div class="card-grid">${cards || emptyState("Projects coming soon.")}</div>
      </div>
    </section>`;
  }

  function emptyState(text) {
    return `<div style="color:var(--text-dim);padding:20px 0">${esc(text)}</div>`;
  }

  function renderVideos(d) {
    const items = (d.items || []).map((v, i) => `
      <div class="card video-card lazy-fade" data-video-src="${esc(v.videoUrl)}" data-index="${i}">
        <div class="card-media">
          ${lazyImg(v.thumbnail, v.title)}
          <div class="play-badge"><span>&#9658;</span></div>
        </div>
        <div class="card-body">
          <h3>${esc(v.title)}</h3>
          ${v.description ? `<p>${esc(v.description)}</p>` : ""}
        </div>
      </div>`).join("");
    return `
    <section id="videos">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">Videos</div>
          <h2>${esc(d.heading)}</h2>
          <p>${esc(d.subheading)}</p>
        </div>
        <div class="card-grid">${items || emptyState("Videos coming soon.")}</div>
      </div>
    </section>`;
  }

  function renderCurrentProject(d) {
    return `
    <section id="currentProject">
      <div class="container">
        <div class="project-feature">
          <div class="project-poster lazy-fade">${lazyImg(d.posterImage, d.title)}</div>
          <div>
            <span class="status-badge">${esc(d.status)}</span>
            <h2>${esc(d.title)}</h2>
            <div class="card-meta">${esc(d.language)} · ${esc(d.type)}</div>
            <p>${esc(d.description)}</p>
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderSkills(d) {
    const skills = (d.items || []).map((s) => `<li>${esc(s)}</li>`).join("");
    const openTo = (d.openTo || []).map((s) => `<li>${esc(s)}</li>`).join("");
    return `
    <section id="skills">
      <div class="container">
        <div class="section-head">
          <div class="eyebrow">Skills</div>
          <h2>${esc(d.heading)}</h2>
        </div>
        <div class="skills-cols">
          <div><h3>Skills</h3><ul class="tag-list">${skills}</ul></div>
          <div><h3>Open To</h3><ul class="tag-list">${openTo}</ul></div>
        </div>
      </div>
    </section>`;
  }

  function renderContact(d) {
    return `
    <section id="contact">
      <div class="container">
        <div class="section-head center">
          <div class="eyebrow">Contact</div>
          <h2>${esc(d.heading)}</h2>
          <p>${esc(d.subheading)}</p>
        </div>
        <div class="contact-grid">
          <a class="contact-card" href="tel:${esc(d.phone)}">
            <div class="icon">&#128222;</div>
            <div class="label">Phone</div>
            <div class="value">${esc(d.phone)}</div>
          </a>
          <a class="contact-card" href="${esc(d.whatsapp)}" target="_blank" rel="noopener">
            <div class="icon">&#128172;</div>
            <div class="label">WhatsApp</div>
            <div class="value">Message on WhatsApp</div>
          </a>
          <a class="contact-card" href="mailto:${esc(d.email)}">
            <div class="icon">&#9993;</div>
            <div class="label">Email</div>
            <div class="value">${esc(d.email)}</div>
          </a>
          <a class="contact-card" href="${esc(d.instagram)}" target="_blank" rel="noopener">
            <div class="icon">&#128247;</div>
            <div class="label">Instagram</div>
            <div class="value">@thangu____</div>
          </a>
        </div>
      </div>
    </section>`;
  }

  const RENDERERS = {
    home: renderHome, about: renderAbout, journey: renderJourney,
    portfolio: renderPortfolio, videos: renderVideos,
    currentProject: renderCurrentProject, skills: renderSkills, contact: renderContact
  };

  function render(content) {
    document.title = content.meta.siteTitle || document.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", content.meta.seoDescription || "");
    const favicon = document.getElementById("favicon-link");
    if (favicon && content.meta.favicon) favicon.setAttribute("href", content.meta.favicon);

    const order = content.sectionOrder || Object.keys(RENDERERS);
    const visibility = content.sectionVisibility || {};
    let html = "";
    order.forEach((key) => {
      if (visibility[key] === false) return;
      const renderer = RENDERERS[key];
      if (renderer && content[key]) html += renderer(content[key]);
    });
    $app.innerHTML = html;

    applyLazyLoading($app);
    applyFadeIn($app);

    // Showreel button
    const watchBtn = document.getElementById("watchShowreelBtn");
    if (watchBtn) {
      watchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const src = content.home.showreelVideo;
        if (!src) { window.location.hash = "#videos"; return; }
        isEmbeddable(src) ? openEmbed(src) : openLightboxVideo(src);
      });
    }

    // Video card clicks
    $app.querySelectorAll(".video-card").forEach((card) => {
      card.addEventListener("click", () => {
        const src = card.dataset.videoSrc;
        if (!src) return;
        isEmbeddable(src) ? openEmbed(src) : openLightboxVideo(src);
      });
    });

    // Portfolio project video badge clicks
    $app.querySelectorAll("[data-project-video]").forEach((badge) => {
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        const pi = Number(badge.dataset.projectVideo);
        const project = (content.portfolio.projects || [])[pi];
        const vids = project ? (project.videos || []).filter((v) => v && v.videoUrl) : [];
        if (!vids.length) return;
        const src = vids[0].videoUrl;
        isEmbeddable(src) ? openEmbed(src) : openLightboxVideo(src);
      });
    });

    function openEmbed(url) {
      lightboxContent.innerHTML = `<div style="position:relative;padding-top:56.25%">
        <iframe src="${esc(embedUrl(url))}" allow="autoplay; fullscreen" allowfullscreen
          style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:8px"></iframe>
      </div>`;
      lightbox.classList.add("open");
    }
  }

  const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";

  if (isPreview) {
    // Draft preview mode: read content written by the admin dashboard instead of fetching the file.
    try {
      const draft = JSON.parse(window.localStorage.getItem("siteContentDraft") || "null");
      if (draft) {
        render(draft);
      } else {
        $app.innerHTML = `<div class="container" style="padding-top:140px;text-align:center;color:#b7b5ad">No draft found.</div>`;
      }
    } catch (err) {
      $app.innerHTML = `<div class="container" style="padding-top:140px;text-align:center;color:#b7b5ad">Could not read draft.</div>`;
    }
  } else {
    fetch(CONTENT_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load content");
        return r.json();
      })
      .then(render)
      .catch((err) => {
        $app.innerHTML = `<div class="container" style="padding-top:140px;text-align:center;color:#b7b5ad">
          Content could not be loaded. Please try again shortly.</div>`;
        console.error(err);
      });
  }
})();
