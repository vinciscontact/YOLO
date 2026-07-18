/* ═══════════════════════════════════════════════════════
   YOLO — motion system · Vinyl Edition
   GSAP 3 + ScrollTrigger + SplitText + Lenis
   ═══════════════════════════════════════════════════════ */

document.documentElement.classList.add("js"); // disables the no-JS preloader bail

/* A refresh always restarts the record from the top — side A, track 1.
   Set manual ASAP, then re-assert around the browser's async restore points. */
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("pageshow", () => {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
});

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
gsap.defaults({ ease: "power3.out", duration: 0.8 });
/* mobile browsers fire resize when the URL bar collapses — recalculating
   pins mid-scroll makes the page lurch; ignore those, keep real rotations */
ScrollTrigger.config({ ignoreMobileResize: true });

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
  join: "https://chat.whatsapp.com/LpUTXWos2mDB8Ml8j8INHX?s=cl&p=a&ilr=1", // YOLO WhatsApp group
  instagram: "https://instagram.com/yolo.runclub",            // TODO: real handle
  strava: "https://www.strava.com/clubs/yolo-runclub",        // TODO: real club page
};
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = LINKS[a.dataset.link] || "#";
});

/* ── Runners & members counter grows with every join click ──
   Static site: each visitor's WhatsApp join adds +1 locally
   (persisted), so the number they watched climb includes them. */
const JOIN_KEY = "yolo-joins";
const BASE_RUNNERS = 334; /* real member count — joins add on top */
const runnersEl = document.querySelector(".counter"); /* first counter = runners & members */
const joinsSoFar = parseInt(localStorage.getItem(JOIN_KEY) || "0", 10);
runnersEl.dataset.target = BASE_RUNNERS + joinsSoFar;

document.querySelectorAll('[data-link="join"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const n = parseInt(localStorage.getItem(JOIN_KEY) || "0", 10) + 1;
    localStorage.setItem(JOIN_KEY, n);
    const target = BASE_RUNNERS + n;
    runnersEl.dataset.target = target;
    /* if the count-up already played, tick the displayed number up too */
    const shown = parseInt(runnersEl.textContent.replace(/[^\d]/g, ""), 10) || 0;
    if (shown >= BASE_RUNNERS) runnersEl.textContent = target.toLocaleString("en-IN");
    /* gold "+1" floats off the button they clicked */
    const plus = document.createElement("span");
    plus.className = "join-plus";
    plus.textContent = "+1 🏃";
    document.body.appendChild(plus);
    const r = a.getBoundingClientRect();
    gsap.set(plus, { x: r.left + r.width / 2, y: r.top - 6 });
    gsap.to(plus, { y: "-=70", autoAlpha: 0, duration: 1.1, ease: "power1.out", onComplete: () => plus.remove() });
  });
});

/* Perf: below-the-fold imagery loads lazily */
document.querySelectorAll(".sleeve img, .reel-card img, .wall__item img").forEach((img) => {
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
  { sel: "#values",    no: "A4", title: "A4 · The Crate" },
  { sel: "#flip",      no: "↻",  title: "↻ · Flip the Record" },
  { sel: "#memories",  no: "B1", title: "B1 · Memories" },
  { sel: "#believe",   no: "B2", title: "B2 · Six Little Truths" },
  { sel: "#founders",  no: "B3", title: "B3 · The Founders" },
  { sel: "#crew",      no: "B4", title: "B4 · The Core Crew" },
  { sel: "#reviews",   no: "B5", title: "B5 · The Reviews" },
  { sel: "#runs",      no: "B6", title: "B6 · Past Runs" },
  { sel: "#join",      no: "B7", title: "B7 · Say Yes" },
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
  btn.innerHTML = `<span class="dock__track-no">${t.no}</span>${t.title.replace(/^.*?· /, "")}`;
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

/* ── Upcoming event: full-screen vinyl drop → cart ────
   A giant record fills the screen with "UPCOMING EVENT" as
   its label; the needle drops, then the record revs up and
   arcs into the 🛒 at bottom-right along a glowing gold
   trail. Cart click brings it spinning back out. */
const eventSplash = document.getElementById("eventSplash");
const eventRecord = document.getElementById("eventRecord");
const eventDisc = document.getElementById("eventDisc");
const eventArm = document.getElementById("eventArm");
const eventTrail = document.getElementById("eventTrail");
const eventTrailPath = document.getElementById("eventTrailPath");
const eventCart = document.getElementById("eventCart");
const SPLASH_CHROME = [".event-splash__follow", ".event-splash__skip", ".event-splash__close"];
let splashTimer = null;
let splashTl = null;
let discSpin = null;
let cartDocked = false; // cart pop-in + auto-drop only on first showing

/* record is grid-centred, so its resting centre = viewport centre */
function cartOffset() {
  const wasHidden = eventCart.hidden;
  if (wasHidden) {
    eventCart.hidden = false;
    eventCart.style.visibility = "hidden";
  }
  const c = eventCart.getBoundingClientRect();
  if (wasHidden) {
    eventCart.hidden = true;
    eventCart.style.visibility = "";
  }
  return {
    x: c.left + c.width / 2 - window.innerWidth / 2,
    y: c.top + c.height / 2 - window.innerHeight / 2,
  };
}

function openEventSplash() {
  if (!eventSplash.hidden) return;
  clearTimeout(splashTimer);
  eventSplash.hidden = false;
  document.documentElement.classList.add("splash-lock");
  if (prefersReduced) {
    /* static: show the sign, make the cart available immediately */
    eventCart.hidden = false;
    cartDocked = true;
    return;
  }
  if (lenis) lenis.stop();
  if (!discSpin) discSpin = gsap.to(eventDisc, { rotation: "+=360", duration: 3.4, ease: "none", repeat: -1 });
  discSpin.timeScale(1).play();

  gsap.set(SPLASH_CHROME, { autoAlpha: 0 });
  gsap.set(eventTrail, { autoAlpha: 0 });
  gsap.set(eventSplash, { autoAlpha: 1, clearProps: "backgroundColor" });

  splashTl = gsap.timeline({
    onComplete: () => {
      if (!cartDocked) splashTimer = setTimeout(flyToCart, 3200);
    },
  });
  if (cartDocked) {
    /* re-emerge: spin back out of the cart to centre stage */
    const o = cartOffset();
    splashTl
      .fromTo(eventSplash, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      .fromTo(
        eventRecord,
        { x: o.x, y: o.y, scale: 0.04, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "power3.out" },
        0.05
      );
  } else {
    splashTl
      .fromTo(eventSplash, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 })
      .fromTo(eventRecord, { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: "back.out(1.3)" }, 0.1);
  }
  splashTl
    /* needle drops onto the record, tiny settle wobble */
    .fromTo(eventArm, { rotation: 26, autoAlpha: 1 }, { rotation: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.45")
    .to(eventArm, { rotation: 2.5, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" })
    .to(SPLASH_CHROME, { autoAlpha: 1, duration: 0.5, stagger: 0.08 }, "-=0.25");
}

function flyToCart() {
  clearTimeout(splashTimer);
  if (eventSplash.hidden) return;
  if (splashTl) splashTl.kill();
  const firstDock = !cartDocked;
  cartDocked = true;
  eventCart.hidden = false;
  const finish = () => {
    eventSplash.hidden = true;
    document.documentElement.classList.remove("splash-lock");
    gsap.set(eventSplash, { clearProps: "all" });
    gsap.set([eventRecord, eventTrail], { clearProps: "all" });
    if (discSpin) discSpin.timeScale(1).pause();
    if (lenis) lenis.start();
  };
  if (prefersReduced) {
    finish();
    return;
  }
  gsap.killTweensOf([eventSplash, eventRecord, eventArm, eventCart, ...SPLASH_CHROME]);

  /* quadratic arc from screen centre into the cart */
  const w = window.innerWidth;
  const h = window.innerHeight;
  const o = cartOffset();
  const qx = o.x * 0.65;
  const qy = Math.min(o.y * 0.2, -h * 0.18); /* rise before the swoop */
  eventTrail.setAttribute("viewBox", `0 0 ${w} ${h}`);
  eventTrailPath.setAttribute(
    "d",
    `M ${w / 2} ${h / 2} Q ${w / 2 + qx} ${h / 2 + qy} ${w / 2 + o.x} ${h / 2 + o.y}`
  );

  if (discSpin) gsap.to(discSpin, { timeScale: 4, duration: 0.4 }); /* rev up */

  const pos = { t: 0 };
  splashTl = gsap.timeline({ onComplete: finish });
  splashTl
    .to(eventArm, { rotation: 26, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
    .to(SPLASH_CHROME, { autoAlpha: 0, duration: 0.25 }, 0);
  if (firstDock) {
    splashTl.fromTo(eventCart, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" }, 0.15);
  }
  splashTl
    .set(eventTrail, { autoAlpha: 1 }, 0.3)
    .fromTo(eventTrailPath, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.8, ease: "power2.in" }, 0.3)
    .to(pos, {
      t: 1,
      duration: 0.85,
      ease: "power2.in",
      onUpdate: () => {
        /* quadratic bezier: B(t) = 2(1-t)t·Q + t²·target (start = 0,0) */
        const t = pos.t;
        const u = 1 - t;
        gsap.set(eventRecord, { x: 2 * u * t * qx + t * t * o.x, y: 2 * u * t * qy + t * t * o.y });
      },
    }, 0.32)
    .to(eventRecord, { scale: 0.04, duration: 0.85, ease: "power2.in" }, 0.32)
    .to(eventRecord, { autoAlpha: 0, duration: 0.15 }, 1.02)
    .to(eventSplash, { backgroundColor: "rgba(16, 13, 12, 0)", duration: 0.5 }, 0.45)
    .to(eventTrailPath, { drawSVG: "100% 100%", duration: 0.35, ease: "power2.out" }, 1.0)
    /* the cart catches it — squash & bounce */
    .to(eventCart, { scale: 1.32, duration: 0.14, ease: "power2.out" }, 1.08)
    .to(eventCart, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
}

eventCart.addEventListener("click", openEventSplash);
/* tap anywhere sends it to the cart (the follow link still opens first) */
eventSplash.addEventListener("click", () => flyToCart());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !eventSplash.hidden) flyToCart();
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

/* ── Sound: the record on the platter + vinyl crackle bed ──
   "LET ME DRIVE FUNK.mp3" is the actual music; the synthesized
   crackle sits quietly underneath it like surface noise. */
const soundBtn = document.getElementById("dockSound");
const music = new Audio("LET%20ME%20DRIVE%20FUNK.mp3");
music.loop = true;
music.volume = 0.6;
music.preload = "none"; // ~1.2MB — only fetched once the user opts in
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
  gain.gain.value = 0.22; /* ducked under the music — just surface noise */
  src.connect(gain).connect(audioCtx.destination);
  src.start();
}
soundBtn.addEventListener("click", async () => {
  soundOn = !soundOn;
  if (soundOn) {
    if (!audioCtx) startCrackle();
    else await audioCtx.resume();
    music.play().catch(() => {}); /* needle down — the funk starts */
  } else {
    if (audioCtx) await audioCtx.suspend();
    music.pause();
  }
  soundBtn.classList.toggle("is-on", soundOn);
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  soundBtn.setAttribute("aria-label", soundOn ? "Turn off music" : "Turn on music");
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

/* Needle-drop pop — low thump + dusty tick when the "track" changes */
function needlePop() {
  if (!soundOn || !audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const og = audioCtx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
  og.gain.setValueAtTime(0.28, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(og).connect(audioCtx.destination);
  o.start(t);
  o.stop(t + 0.18);
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.3;
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const f = audioCtx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1600;
  src.connect(f).connect(audioCtx.destination);
  src.start(t + 0.01);
}

/* Scratch — filtered noise sweep when the user really rips the scroll */
let lastScratch = 0;
function scratch() {
  if (!soundOn || !audioCtx) return;
  const now = performance.now();
  if (now - lastScratch < 900) return;
  lastScratch = now;
  const t = audioCtx.currentTime;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.16, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const f = audioCtx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 2.5;
  f.frequency.setValueAtTime(420, t);
  f.frequency.exponentialRampToValueAtTime(2400, t + 0.14);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  src.connect(f).connect(g).connect(audioCtx.destination);
  src.start(t);
}

/* One-time sound prompt after the first real scroll */
const SOUND_KEY = "yolo-sound";
const SNOOZE_KEY = "yolo-sound-snooze"; /* session-only: dismissed toast stays away until next visit */
const soundToast = document.getElementById("soundToast");
let soundToastTimer = null;

function hideSoundToast() {
  clearTimeout(soundToastTimer);
  gsap.to(soundToast, {
    y: 60,
    autoAlpha: 0,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      soundToast.hidden = true;
      gsap.set(soundToast, { clearProps: "all" });
    },
  });
}
document.getElementById("soundYes").addEventListener("click", () => {
  localStorage.setItem(SOUND_KEY, "on");
  if (!soundOn) soundBtn.click();
  hideSoundToast();
});
document.getElementById("soundNo").addEventListener("click", () => {
  localStorage.setItem(SOUND_KEY, "off");
  hideSoundToast();
});
if (!localStorage.getItem(SOUND_KEY)) {
  ScrollTrigger.create({
    start: 420,
    once: true,
    onEnter: () => {
      if (sessionStorage.getItem(SNOOZE_KEY)) return;
      /* prefetch the track NOW so "Drop the needle" plays instantly, not after a download */
      music.preload = "auto";
      music.load();
      soundToast.hidden = false;
      gsap.from(soundToast, { y: 80, autoAlpha: 0, duration: 0.7, ease: "power3.out" });
      /* don't nag: if ignored, slide away after 12s (re-offers on the next visit) */
      soundToastTimer = setTimeout(() => {
        sessionStorage.setItem(SNOOZE_KEY, "1");
        hideSoundToast();
      }, 12000);
    },
  });
} else if (localStorage.getItem(SOUND_KEY) === "on") {
  /* returning visitor said yes before — start on their first gesture (autoplay policy) */
  window.addEventListener("pointerdown", () => { if (!soundOn) soundBtn.click(); }, { once: true });
}

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
  document.querySelectorAll("a, button, .wall__item, .reel-card, .sleeve, .doodle-card, .founder, .crew__card, .review-card").forEach((el) => {
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
        document.querySelectorAll(".stat__arc").forEach((arc) => gsap.set(arc, { drawSVG: arc.dataset.sweep + "%" }));
        document.querySelectorAll(".stat__needle").forEach((n) => gsap.set(n, { rotation: parseFloat(n.dataset.angle), svgOrigin: "60 60" }));
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
        .from(".hero__foot", { autoAlpha: 0, duration: 0.7 }, "-=0.5");

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

      /* RPM gauges: arc draws around the dial, needle winds up with the count */
      document.querySelectorAll(".stat__arc").forEach((arc, i) => {
        gsap.fromTo(arc, { drawSVG: "0%" }, {
          drawSVG: arc.dataset.sweep + "%",
          duration: 2,
          ease: "power2.out",
          delay: i * 0.12,
          scrollTrigger: { trigger: ".stats", start: "top 80%", toggleActions: "play none none none" },
        });
      });
      document.querySelectorAll(".stat__needle").forEach((needle, i) => {
        gsap.fromTo(needle, { rotation: -20, svgOrigin: "60 60" }, {
          rotation: parseFloat(needle.dataset.angle),
          duration: 2.1,
          ease: "back.out(1.3)",
          delay: i * 0.12,
          scrollTrigger: { trigger: ".stats", start: "top 80%", toggleActions: "play none none none" },
        });
      });

      /* ── Values: crate digging (desktop pin) / list reveal (mobile) ──
         Each value is a record sleeve in a crate; scrolling tips the front
         sleeve forward and the next one rises, like a collector digging. */
      const crate = document.getElementById("crate");
      const sleeves = gsap.utils.toArray(".sleeve");
      if (crate && sleeves.length) { /* the dig runs on every screen size */
        crate.classList.add("crate--live");
        const crateNow = document.getElementById("crateNow");
        const N = sleeves.length;
        sleeves.forEach((s, i) => {
          gsap.set(s, {
            zIndex: N - i,
            transformOrigin: "50% 100%",
            ...(i > 0 ? { scale: 0.92, yPercent: 5, autoAlpha: i === 1 ? 0.45 : 0 } : {}),
          });
          /* the vinyl peeks out of the active sleeve */
          gsap.set(s.querySelector(".sleeve__vinyl"), { y: i === 0 ? -26 : 0 });
        });
        const crateTl = gsap.timeline({
          scrollTrigger: {
            trigger: crate,
            start: "top top",
            end: "+=" + (N - 1) * 85 + "%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.min(N - 1, Math.round(self.progress * (N - 1)));
              crateNow.textContent = String(idx + 1).padStart(2, "0");
            },
          },
        });
        for (let i = 0; i < N - 1; i++) {
          crateTl
            .to(sleeves[i].querySelector(".sleeve__vinyl"), { y: 0, duration: 0.25, ease: "none" })
            .to(sleeves[i], { rotationX: -68, yPercent: 18, autoAlpha: 0, duration: 1, ease: "power2.in" }, "<")
            .to(sleeves[i + 1], { scale: 1, yPercent: 0, autoAlpha: 1, duration: 1, ease: "power2.out" }, "<")
            .to(sleeves[i + 1].querySelector(".sleeve__vinyl"), { y: -26, duration: 0.35, ease: "power2.out" }, "<0.55");
          if (i + 2 < N) crateTl.to(sleeves[i + 2], { autoAlpha: 0.45, duration: 0.4, ease: "none" }, "<0.3");
        }
      }

      /* ── THE FLIP: side A → side B, scrubbed record flip ── */
      gsap.set("#flipRecord", { rotationX: 10 });
      const flipTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flip",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      flipTl
        .to("#flipRecord", { rotationY: 180, duration: 2, ease: "none" }, 0)
        .to("#flipRecord", { scale: 1.12, duration: 1, ease: "power1.in" }, 0)
        .to("#flipRecord", { scale: 1, duration: 1, ease: "power1.out" }, 1)
        .fromTo(".flip__sheen span", { xPercent: -160 }, { xPercent: 160, duration: 1.1, ease: "none" }, 0.45)
        .to(".flip__word--a", { xPercent: -22, autoAlpha: 0, duration: 0.9, ease: "none" }, 0.3)
        .fromTo(".flip__word--b", { xPercent: 22, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.9, ease: "none" }, 1.05)
        .from(".flip__caption", { autoAlpha: 0, y: 30, duration: 0.45 }, 1.55);

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
      /* contact sheet: each frame develops (B&W → colour) as it passes centre stage */
      gsap.utils.toArray(".wall__item img").forEach((img) => {
        gsap.fromTo(
          img,
          { filter: "grayscale(1) brightness(0.72) contrast(1.05)" },
          {
            filter: "grayscale(0) brightness(1) contrast(1)",
            ease: "none",
            scrollTrigger: { trigger: img, start: "top 85%", end: "top 45%", scrub: true },
          }
        );
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

      /* ── Doodle story cards: slapped onto the corkboard ──
         Each card flies in oversized from off-angle like a tossed polaroid,
         lands with an elastic squash, the tape smacks down AFTER it lands,
         then the doodle sketches itself in. */
      document.querySelectorAll(".doodle-card").forEach((card, i) => {
        const tilt = parseFloat(card.dataset.tilt) || 0;
        const strokes = card.querySelectorAll("svg path, svg circle, svg ellipse");
        const notes = card.querySelectorAll("svg text");
        const fromX = (i % 3 - 1) * 130; /* column decides the toss direction: left / above / right */
        gsap.set(card, { rotation: tilt, transformPerspective: 700 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        tl.from(card, {
          x: fromX,
          y: 150,
          rotation: tilt * 8 + (i % 2 ? 14 : -14),
          scale: 1.35,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
        })
          /* impact squash… */
          .to(card, { scaleX: 1.06, scaleY: 0.94, duration: 0.1, ease: "power2.out" }, "-=0.05")
          /* …and elastic settle onto its resting tilt */
          .to(card, { scaleX: 1, scaleY: 1, rotation: tilt, duration: 0.85, ease: "elastic.out(1.1, 0.4)" })
          /* tape slaps down once the card has landed */
          .from(card, { "--tape-s": 2.6, "--tape-o": 0, duration: 0.32, ease: "back.out(2.6)" }, "-=0.7");
        if (strokes.length) tl.from(strokes, { drawSVG: "0%", duration: 0.7, stagger: 0.035, ease: "power2.inOut" }, "-=0.55");
        if (notes.length) tl.from(notes, { autoAlpha: 0, duration: 0.4 }, "-=0.2");
      });

      /* the wall is tactile: cards tilt in 3D toward the cursor (desktop only) */
      if (isDesktop) {
        document.querySelectorAll(".doodle-card").forEach((card) => {
          const rxTo = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
          const ryTo = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
          card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            ryTo(((e.clientX - r.left) / r.width - 0.5) * 14);
            rxTo(((e.clientY - r.top) / r.height - 0.5) * -14);
          });
          card.addEventListener("mouseleave", () => {
            rxTo(0);
            ryTo(0);
          });
        });
      }

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

      /* ── Interlude: infinite counter-marquees — the grooves never stop ──
         Outlined lines run left, the gold line runs right; scrolling hard
         revs them up like spinning the platter by hand. */
      const interludeTweens = gsap.utils.toArray(".interlude__line").map((line, i) => {
        const rightward = i === 1; /* the gold middle line runs the other way */
        const dur = [34, 26, 30][i]; /* slightly different speeds = organic */
        return gsap.fromTo(
          line,
          { xPercent: rightward ? -50 : 0 },
          { xPercent: rightward ? 0 : -50, duration: dur, ease: "none", repeat: -1, paused: true }
        );
      });
      /* scratch the type when the user scrolls hard */
      const interludeSkew = gsap.quickTo(".interlude__line", "skewX", { duration: 0.5, ease: "power3" });
      ScrollTrigger.create({
        trigger: ".interlude",
        start: "top bottom",
        end: "bottom top",
        /* only spend frames on it while it's on screen */
        onToggle: (self) => interludeTweens.forEach((tw) => (self.isActive ? tw.play() : tw.pause())),
        onUpdate: (self) => {
          const boost = 1 + Math.abs(gsap.utils.clamp(-3, 3, self.getVelocity() / 400));
          interludeTweens.forEach((tw) => {
            tw.timeScale(boost);
            gsap.to(tw, { timeScale: 1, duration: 0.8, overwrite: true });
          });
          interludeSkew(gsap.utils.clamp(-8, 8, self.getVelocity() / -350));
          gsap.delayedCall(0.15, () => interludeSkew(0));
        },
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

  /* ── Noir mode: floating chrome turns maroon while the hero is on screen ── */
  ScrollTrigger.create({
    trigger: ".hero",
    /* hero sits at page top: "top top" would compute to 0 and never activate at scroll 0 */
    start: "top bottom",
    end: "bottom 70px",
    onToggle: (self) => document.body.classList.toggle("is-noir", self.isActive),
  });

  /* ── Dock: "now playing" tracking (functional — runs even with reduced motion) ── */
  TRACKS.forEach((t, i) => {
    ScrollTrigger.create({
      trigger: t.sel,
      start: "top 35%",
      end: "bottom 35%",
      onToggle: (self) => {
        if (self.isActive) {
          if (activeTrack !== i) needlePop(); /* the needle skips to the next track */
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
        if (v > 3.6) scratch(); /* ripping the scroll = scratching the record */
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

/* ── Boot: fonts → preloader → animations → event splash ── */
document.fonts.ready.then(() => {
  runPreloader(() => {
    initAnimations();
    setTimeout(openEventSplash, 1000); // let the hero land, then splash the upcoming event
  });
});
