/* ═══════════════════════════════════════════════════════
   YOLO — motion system · Vinyl Edition
   GSAP 3 + ScrollTrigger + SplitText + Lenis
   ═══════════════════════════════════════════════════════ */

document.documentElement.classList.add("js"); // disables the no-JS preloader bail

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
gsap.defaults({ ease: "power3.out", duration: 0.8 });

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Smooth scroll (skip for reduced motion) ────────── */
let lenis = null;
if (!prefersReduced && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── Club links — ONE place to update when real URLs arrive ── */
const LINKS = {
  join: "https://chat.whatsapp.com/REPLACE_WITH_REAL_INVITE", // TODO: club's WhatsApp group invite
  instagram: "https://instagram.com/yolo.runclub",            // TODO: real handle
  strava: "https://www.strava.com/clubs/yolo-runclub",        // TODO: real club page
};
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = LINKS[a.dataset.link] || "#";
});

/* Perf: below-the-fold imagery loads lazily */
document.querySelectorAll(".value-card img, .reel-card img, .wall__item img").forEach((img) => {
  img.loading = "lazy";
  img.decoding = "async";
});

/* ── Anchor navigation ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.hash);
    if (!target) return;
    e.preventDefault();
    closeDockList();
    if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
    else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ── Turntable dock: sections as tracks ─────────────── */
const TRACKS = [
  { sel: ".hero",      no: "A1", title: "A1 · You Only Live Once" },
  { sel: "#manifesto", no: "A2", title: "A2 · The Manifesto" },
  { sel: "#stats",     no: "A3", title: "A3 · Score Figures" },
  { sel: "#values",    no: "A4", title: "A4 · The Tracklist" },
  { sel: "#memories",  no: "B1", title: "B1 · Memories" },
  { sel: "#believe",   no: "B2", title: "B2 · Six Little Truths" },
  { sel: "#runs",      no: "B3", title: "B3 · On Tour" },
  { sel: "#join",      no: "B4", title: "B4 · Say Yes" },
];
const dockList = document.getElementById("dockList");
const dockTitle = document.getElementById("dockTitle");
let activeTrack = 0;

function scrollToTrack(i) {
  const idx = gsap.utils.clamp(0, TRACKS.length - 1, i);
  const el = document.querySelector(TRACKS[idx].sel);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.2 });
  else el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
}

function closeDockList() {
  dockList.hidden = true;
  document.getElementById("dockDisc").setAttribute("aria-expanded", "false");
  document.getElementById("dockInfo").setAttribute("aria-expanded", "false");
}

function toggleDockList() {
  const opening = dockList.hidden;
  if (opening) {
    dockList.querySelectorAll(".dock__track").forEach((btn, i) =>
      btn.classList.toggle("is-active", i === activeTrack)
    );
  }
  dockList.hidden = !opening;
  document.getElementById("dockDisc").setAttribute("aria-expanded", String(opening));
  document.getElementById("dockInfo").setAttribute("aria-expanded", String(opening));
}

TRACKS.forEach((t, i) => {
  const btn = document.createElement("button");
  btn.className = "dock__track";
  btn.innerHTML = `<span class="dock__track-no">${t.no}</span>${t.title.slice(5)}`;
  btn.addEventListener("click", () => {
    closeDockList();
    scrollToTrack(i);
  });
  dockList.appendChild(btn);
});

document.getElementById("dockDisc").addEventListener("click", toggleDockList);
document.getElementById("dockInfo").addEventListener("click", toggleDockList);
document.getElementById("dockPrev").addEventListener("click", () => scrollToTrack(activeTrack - 1));
document.getElementById("dockNext").addEventListener("click", () => scrollToTrack(activeTrack + 1));
document.addEventListener("click", (e) => {
  if (!dockList.hidden && !e.target.closest(".dock")) closeDockList();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDockList();
});

/* ── Member voices: rotating liner notes ────────────── */
const voices = gsap.utils.toArray(".voice");
if (voices.length) {
  const dotsWrap = document.getElementById("voicesDots");
  const vDur = prefersReduced ? 0 : 0.7;
  let vIdx = 0;
  const dots = voices.map((_, i) => {
    const d = document.createElement("button");
    d.className = "voices__dot";
    d.setAttribute("aria-label", `Testimonial ${i + 1}`);
    d.addEventListener("click", () => showVoice(i));
    dotsWrap.appendChild(d);
    return d;
  });
  function showVoice(i) {
    if (i === vIdx) return;
    gsap.to(voices[vIdx], { autoAlpha: 0, y: -24, duration: vDur });
    gsap.fromTo(voices[i], { y: 24 }, { autoAlpha: 1, y: 0, duration: vDur, delay: vDur * 0.45 });
    dots[vIdx].classList.remove("is-active");
    dots[i].classList.add("is-active");
    vIdx = i;
  }
  gsap.set(voices[0], { autoAlpha: 1 });
  dots[0].classList.add("is-active");
  setInterval(() => showVoice((vIdx + 1) % voices.length), 6000);
}

/* ── Memory wall lightbox ───────────────────────────── */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
const wallImgs = gsap.utils.toArray(".wall__item img");
let lbIdx = 0;
let lbReturnFocus = null;

function lbShow(i) {
  lbIdx = (i + wallImgs.length) % wallImgs.length;
  const im = wallImgs[lbIdx];
  lbImg.src = im.src.replace("w=800", "w=1600");
  lbImg.alt = im.alt;
  lbCap.textContent = im.alt;
}
function lbOpen(i) {
  lbReturnFocus = document.activeElement;
  lbShow(i);
  lightbox.hidden = false;
  if (lenis) lenis.stop();
  if (!prefersReduced) {
    gsap.fromTo(lightbox, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
    gsap.fromTo(".lightbox__figure", { scale: 0.92, y: 24 }, { scale: 1, y: 0, duration: 0.5, ease: "power3.out" });
  }
  document.getElementById("lbClose").focus();
}
function lbCloseFn() {
  const finish = () => {
    lightbox.hidden = true;
    gsap.set(lightbox, { clearProps: "opacity,visibility" });
    if (lenis) lenis.start();
    if (lbReturnFocus) lbReturnFocus.focus();
  };
  if (prefersReduced) finish();
  else gsap.to(lightbox, { autoAlpha: 0, duration: 0.28, onComplete: finish });
}
wallImgs.forEach((im, i) => {
  const fig = im.closest(".wall__item");
  fig.tabIndex = 0;
  fig.setAttribute("role", "button");
  fig.setAttribute("aria-label", "View photo: " + im.alt);
  fig.addEventListener("click", () => lbOpen(i));
  fig.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lbOpen(i); }
  });
});
document.getElementById("lbClose").addEventListener("click", lbCloseFn);
document.getElementById("lbPrev").addEventListener("click", () => lbShow(lbIdx - 1));
document.getElementById("lbNext").addEventListener("click", () => lbShow(lbIdx + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lbCloseFn(); });
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") lbCloseFn();
  if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
  if (e.key === "ArrowRight") lbShow(lbIdx + 1);
});

/* ── Magnetic buttons (fine pointers, motion allowed) ── */
if (!prefersReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".btn, .dock__join, .run__rsvp").forEach((el) => {
    el.classList.add("is-magnetic");
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
    });
  });
}

/* ── Vinyl crackle — synthesized, no audio files, off by default ── */
const soundBtn = document.getElementById("dockSound");
let audioCtx = null;
let soundOn = false;

function startCrackle() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const sr = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(1, sr * 2, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * 0.015; // faint needle hiss
    if (Math.random() < 0.0004) {           // sparse dusty pops
      const amp = 0.15 + Math.random() * 0.3;
      for (let j = 0; j < 50 && i + j < d.length; j++) {
        d[i + j] += (Math.random() * 2 - 1) * amp * (1 - j / 50);
      }
      i += 50;
    }
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.5;
  src.connect(gain).connect(audioCtx.destination);
  src.start();
}
soundBtn.addEventListener("click", async () => {
  soundOn = !soundOn;
  if (soundOn) {
    if (!audioCtx) startCrackle();
    else await audioCtx.resume();
  } else if (audioCtx) {
    await audioCtx.suspend();
  }
  soundBtn.classList.toggle("is-on", soundOn);
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  soundBtn.setAttribute("aria-label", soundOn ? "Turn off vinyl crackle sound" : "Turn on vinyl crackle sound");
});
function blip() {
  if (!soundOn || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "triangle";
  o.frequency.value = 520;
  g.gain.setValueAtTime(0.12, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.1);
}
document.getElementById("dockPrev").addEventListener("click", blip);
document.getElementById("dockNext").addEventListener("click", blip);

/* ── Custom cursor (fine pointers, motion allowed) ──── */
if (!prefersReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.querySelector(".cursor");
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
  let cursorShown = false;
  window.addEventListener("mousemove", (e) => {
    if (!cursorShown) {
      cursorShown = true;
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    }
    xTo(e.clientX);
    yTo(e.clientY);
  });
  const grow = () => gsap.to(cursor, { scale: 3.2, duration: 0.35 });
  const shrink = () => gsap.to(cursor, { scale: 1, duration: 0.35 });
  document.querySelectorAll("a, button, .wall__item, .reel-card, .value-card, .doodle-card").forEach((el) => {
    el.addEventListener("mouseenter", grow);
    el.addEventListener("mouseleave", shrink);
  });
}

/* ── Nav border on scroll ───────────────────────────── */
ScrollTrigger.create({
  start: 60,
  onUpdate: (self) =>
    document.getElementById("nav").classList.toggle("is-scrolled", self.scroll() > 60),
});

/* ── Reading progress bar ───────────────────────────── */
ScrollTrigger.create({
  trigger: document.body,
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => gsap.set(".progress-bar", { scaleX: self.progress }),
});

/* ── Preloader — vinyl spins (CSS), letters rise ────── */
gsap.set(".preloader__word span", { yPercent: 110 });

function runPreloader(onDone) {
  const pre = document.getElementById("preloader");
  if (prefersReduced) {
    pre.remove();
    onDone();
    return;
  }
  const tl = gsap.timeline({
    onComplete: () => {
      pre.remove();
      onDone();
    },
  });
  tl.to(".preloader__word span", {
    yPercent: 0,
    duration: 0.9,
    ease: "power4.out",
    stagger: 0.07,
  })
    .to(".preloader__tag", { opacity: 1, duration: 0.5 }, "-=0.4")
    .to(pre, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.6");
}

/* ── Main animations (built after fonts + preloader) ── */
function initAnimations() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 900px)",
      isMobile: "(max-width: 899px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions;

      if (reduceMotion) {
        gsap.set("[data-reveal='lines'], .split-scrub, .split-hero, .reveal, .doodle-card", {
          clearProps: "all",
          autoAlpha: 1,
          visibility: "visible",
        });
        document.querySelectorAll(".counter").forEach((c) => {
          c.textContent = Number(c.dataset.target).toLocaleString("en-IN");
        });
        return;
      }

      /* ── HERO: char cascade on the display lines ── */
      const heroSplit = SplitText.create(".split-hero", { type: "chars,words" });
      gsap.set(".split-hero", { visibility: "visible" });
      const heroTl = gsap.timeline();
      heroTl
        .from(heroSplit.chars, {
          yPercent: 120,
          autoAlpha: 0,
          rotationX: -50,
          transformOrigin: "50% 100%",
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.028,
          onComplete: () => gsap.set(heroSplit.chars, { clearProps: "willChange" }),
        })
        .from(".hero__eyebrow", { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.9")
        .from(".hero__vinyl", { scale: 0.86, autoAlpha: 0, duration: 1.6, ease: "power3.out" }, "-=1.1")
        .from(".hero__foot", { autoAlpha: 0, duration: 0.7 }, "-=0.5");

      /* The hero record never stops spinning */
      gsap.to(".hero__vinyl", { rotation: 360, duration: 26, ease: "none", repeat: -1 });

      /* Mouse-parallax depth on the whole collage (desktop only, after entrance) */
      if (isDesktop) {
        heroTl.eventCallback("onComplete", () => {
          const hero = document.querySelector(".hero");
          const layers = gsap.utils.toArray(".hero [data-depth]").map((el) => ({
            d: parseFloat(el.dataset.depth),
            xTo: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
            yTo: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
          }));
          hero.addEventListener("mousemove", (e) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            layers.forEach((l) => {
              l.xTo(nx * 36 * l.d);
              l.yTo(ny * 26 * l.d);
            });
          });
        });
      }

      /* ── Vinyl records spin with scroll (signature motif) ── */
      gsap.utils.toArray(".vinyl-scrollspin").forEach((disc) => {
        gsap.to(disc, {
          rotation: 360,
          ease: "none",
          scrollTrigger: {
            trigger: disc.closest("section") || disc,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      /* ── Masked line reveals (site-wide) ── */
      document.querySelectorAll("[data-reveal='lines']").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              ease: "power4.out",
              stagger: 0.1,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }),
        });
        gsap.set(el, { visibility: "visible" });
      });

      /* ── Generic fade-up reveals ── */
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });

      /* ── Marquee: constant drift + scroll-velocity boost ── */
      const marqueeTween = gsap.to(".marquee__inner", {
        xPercent: -50,
        ease: "none",
        duration: 22,
        repeat: -1,
      });
      ScrollTrigger.create({
        trigger: ".marquee",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 300);
          marqueeTween.timeScale(1 + Math.abs(v));
          gsap.to(marqueeTween, { timeScale: 1, duration: 0.8, overwrite: true });
        },
      });

      /* ── Manifesto: words light up as you read ── */
      const scrub = SplitText.create(".split-scrub", { type: "words" });
      gsap.set(".split-scrub", { visibility: "visible" });
      gsap.set(scrub.words, { opacity: 0.14 });
      gsap.to(scrub.words, {
        opacity: 1,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: {
          trigger: ".split-scrub",
          start: "top 72%",
          end: "bottom 45%",
          scrub: true,
        },
      });

      /* ── Stats: score figures count up ── */
      document.querySelectorAll(".counter").forEach((el) => {
        const target = Number(el.dataset.target);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          snap: { val: 1 },
          scrollTrigger: {
            trigger: el.closest(".stats"),
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString("en-IN");
          },
        });
      });
      gsap.from(".stat", {
        y: 50,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.9,
        scrollTrigger: { trigger: ".stats", start: "top 82%", toggleActions: "play none none reverse" },
      });

      /* ── Values: horizontal scroll (desktop) / batch reveal (mobile) ── */
      if (isDesktop) {
        const track = document.querySelector(".h-track");
        const getScroll = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -getScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: ".h-section",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + getScroll(),
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      } else {
        gsap.set(".value-card", { autoAlpha: 0, y: 50 });
        ScrollTrigger.batch(".value-card", {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.8, overwrite: true }),
        });
      }

      /* ── Memories reel: cards slide in + subtle drift; skew on velocity ── */
      gsap.set(".reel-card", { autoAlpha: 0, x: 90 });
      ScrollTrigger.batch(".reel-card", {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, x: 0, stagger: 0.12, duration: 1, overwrite: true }),
      });
      if (isDesktop) {
        gsap.to(".reel__track", {
          xPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: ".reel",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      /* ── Memory wall: staggered rise, gentle skew by scroll velocity ── */
      gsap.set(".wall__item", { autoAlpha: 0, y: 70 });
      ScrollTrigger.batch(".wall__item", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9, overwrite: true }),
      });
      const skewSetter = gsap.quickTo(".wall__item img", "skewY", { duration: 0.4, ease: "power3" });
      ScrollTrigger.create({
        trigger: ".wall",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          skewSetter(gsap.utils.clamp(-4, 4, self.getVelocity() / -400));
          gsap.delayedCall(0.15, () => skewSetter(0));
        },
      });

      /* ── Doodle story cards: settle in, sketch themselves, then act ── */
      document.querySelectorAll(".doodle-card").forEach((card) => {
        const tilt = parseFloat(card.dataset.tilt) || 0;
        const strokes = card.querySelectorAll("svg path, svg circle, svg ellipse");
        const notes = card.querySelectorAll("svg text");
        gsap.set(card, { rotation: tilt });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        tl.from(card, {
          y: 80,
          autoAlpha: 0,
          rotation: tilt * 5,
          duration: 0.9,
          ease: "back.out(1.4)",
        });
        if (strokes.length) tl.from(strokes, { drawSVG: "0%", duration: 0.7, stagger: 0.035, ease: "power2.inOut" }, "-=0.45");
        if (notes.length) tl.from(notes, { autoAlpha: 0, duration: 0.4 }, "-=0.2");
      });

      /* Loop animators for the stick people (data-attribute driven):
         data-swing  — limb pendulum (run cycle), rotates ±value around data-origin
         data-wave   — arm wave, rotates 0→value and back
         data-bob    — whole-figure running bounce
         data-float  — slow hover (the leaper)
         data-pulse  — sparkles / motion lines blinking
         data-phase  — start offset so limbs alternate               */
      const seconds = (el, fallback) => parseFloat(el.dataset.phase || fallback || 0);
      document.querySelectorAll("[data-swing]").forEach((el) => {
        const rot = parseFloat(el.dataset.swing);
        gsap.set(el, { svgOrigin: el.dataset.origin.replace(",", " ") });
        gsap.fromTo(el, { rotation: -rot }, {
          rotation: rot, duration: 0.35, ease: "sine.inOut",
          yoyo: true, repeat: -1, delay: seconds(el),
        });
      });
      document.querySelectorAll("[data-wave]").forEach((el) => {
        gsap.set(el, { svgOrigin: el.dataset.origin.replace(",", " ") });
        gsap.to(el, {
          rotation: parseFloat(el.dataset.wave), duration: 0.55, ease: "sine.inOut",
          yoyo: true, repeat: -1, delay: seconds(el),
        });
      });
      document.querySelectorAll("[data-bob]").forEach((el) => {
        gsap.to(el, {
          y: -parseFloat(el.dataset.bob), duration: 0.35, ease: "sine.inOut",
          yoyo: true, repeat: -1, delay: seconds(el),
        });
      });
      document.querySelectorAll("[data-float]").forEach((el) => {
        gsap.to(el, {
          y: -parseFloat(el.dataset.float), duration: 1.3, ease: "sine.inOut",
          yoyo: true, repeat: -1,
        });
      });
      document.querySelectorAll("[data-pulse]").forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0.15 }, {
          autoAlpha: 1, duration: 0.7, ease: "sine.inOut",
          yoyo: true, repeat: -1, delay: seconds(el),
        });
      });

      /* ── CTA: giant lines rise ── */
      gsap.from(".cta__line", {
        yPercent: 105,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".cta",
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      /* ── Footer big word ── */
      gsap.from(".footer__big", {
        yPercent: 40,
        autoAlpha: 0,
        duration: 1.1,
        scrollTrigger: { trigger: ".footer", start: "top 85%" },
      });
    }
  );

  /* ── Dock: "now playing" tracking (functional — runs even with reduced motion) ── */
  TRACKS.forEach((t, i) => {
    ScrollTrigger.create({
      trigger: t.sel,
      start: "top 35%",
      end: "bottom 35%",
      onToggle: (self) => {
        if (self.isActive) {
          activeTrack = i;
          dockTitle.textContent = t.title;
        }
      },
      onUpdate: (self) => {
        if (activeTrack === i) gsap.set("#dockProgress", { scaleX: self.progress });
      },
    });
  });

  if (!prefersReduced) {
    /* dock slides up once the page is ready */
    gsap.from(".dock", { y: 110, autoAlpha: 0, duration: 1, ease: "power4.out", delay: 0.3 });

    /* the little record never stops spinning — and speeds up as you scroll;
       the neon YOLO burns brighter with scroll speed, then settles to an ember */
    const discSpin = gsap.to(".dock__disc-vinyl", { rotation: 360, duration: 4, ease: "none", repeat: -1 });
    const neonGlow = document.querySelector(".hero__neon-glow");
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = gsap.utils.clamp(0, 5, Math.abs(self.getVelocity()) / 500);
        discSpin.timeScale(1 + v);
        gsap.to(discSpin, { timeScale: 1, duration: 0.8, overwrite: true });
        if (neonGlow) {
          gsap.set(neonGlow, { opacity: 0.3 + (v / 5) * 0.7 });
          gsap.to(neonGlow, { opacity: 0.3, duration: 1.4, ease: "power2.out", overwrite: true });
        }
      },
    });
  }

  /* ── Memory clips: play only while on screen (saves battery/data) ── */
  document.querySelectorAll(".reel-card video").forEach((video) => {
    ScrollTrigger.create({
      trigger: video,
      start: "top 95%",
      end: "bottom 5%",
      onEnter: () => video.play().catch(() => {}),
      onEnterBack: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });
  });

  /* Recalculate pin/trigger positions once images have loaded */
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ── Boot: fonts → preloader → animations ───────────── */
document.fonts.ready.then(() => {
  runPreloader(initAnimations);
});
