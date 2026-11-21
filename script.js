/* =========================================================
   VIDI Brechó — Scripts
   ========================================================= */
(function () {
  "use strict";

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fallback para imagens que ainda não existem ---------- */
  function markMissing(img) {
    var holder = img.closest(".card, .about__img, .cat");
    if (holder) holder.classList.add("is-missing");
  }
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { markMissing(img); });
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* ---------- Preloader / animação de entrada ---------- */
  var preloader = document.getElementById("preloader");
  var bar = document.getElementById("preloaderBar");
  var heroVideo = document.getElementById("heroVideo");
  var finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;
    bar.style.width = "100%";
    setTimeout(function () {
      preloader.classList.add("is-done");
      body.classList.remove("is-loading");
      if (heroVideo) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); }
      setTimeout(function () { preloader.classList.add("is-gone"); }, 1500);
    }, 350);
  }

  // Progresso simulado + espera mínima para a animação das letras
  var progress = 0;
  var tick = setInterval(function () {
    progress = Math.min(progress + Math.random() * 14, 90);
    bar.style.width = progress + "%";
  }, 180);

  var minTime = new Promise(function (r) { setTimeout(r, reduceMotion ? 300 : 2300); });
  var pageLoaded = new Promise(function (r) {
    if (document.readyState === "complete") r();
    else window.addEventListener("load", r);
  });
  var videoReady = new Promise(function (r) {
    if (!heroVideo || heroVideo.readyState >= 3) return r();
    heroVideo.addEventListener("canplay", r, { once: true });
    heroVideo.addEventListener("error", r, { once: true });
    setTimeout(r, 4000); // não espera o vídeo para sempre
  });
  Promise.all([minTime, pageLoaded, videoReady]).then(function () {
    clearInterval(tick);
    finishIntro();
  });
  setTimeout(function () { clearInterval(tick); finishIntro(); }, 8000); // segurança

  /* ---------- Header: fundo ao rolar ---------- */
  var header = document.getElementById("header");
  var hero = document.querySelector(".hero");
  var heroContent = document.querySelector(".hero__content");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 60);

    // Parallax suave no hero
    if (!reduceMotion && y < window.innerHeight * 1.2) {
      heroContent.style.transform = "translateY(" + y * 0.25 + "px)";
      heroContent.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.75));
      if (heroVideo) heroVideo.style.transform = "scale(" + (1 + y * 0.00008) + ") translateY(" + y * 0.08 + "px)";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  burger.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });

  /* ---------- Reveal ao rolar ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  // atraso escalonado para itens irmãos
  revealEls.forEach(function (el) {
    var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    var i = Array.prototype.indexOf.call(siblings, el);
    el.style.setProperty("--d", (i * 0.12) + "s");
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Carrossel ---------- */
  var viewport = document.getElementById("carouselViewport");
  var track = document.getElementById("carouselTrack");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var progressBar = document.getElementById("carouselProgress");
  var autoplayId = null;
  var userInteracting = false;

  function step() {
    var slide = track.querySelector(".slide");
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }
  function maxScroll() { return viewport.scrollWidth - viewport.clientWidth; }

  function updateCarousel() {
    var max = maxScroll();
    var ratio = max > 0 ? viewport.scrollLeft / max : 0;
    var visible = viewport.clientWidth / viewport.scrollWidth;
    var w = Math.max(visible * 100, 12);
    progressBar.style.width = w + "%";
    progressBar.style.marginLeft = (ratio * (100 - w)) + "%";
    prevBtn.disabled = viewport.scrollLeft <= 4;
    nextBtn.disabled = viewport.scrollLeft >= max - 4;
  }

  function go(dir) {
    var max = maxScroll();
    if (dir > 0 && viewport.scrollLeft >= max - 4) {
      viewport.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      viewport.scrollBy({ left: dir * step(), behavior: "smooth" });
    }
  }
  prevBtn.addEventListener("click", function () { go(-1); });
  nextBtn.addEventListener("click", function () { go(1); });
  viewport.addEventListener("scroll", updateCarousel, { passive: true });
  window.addEventListener("resize", updateCarousel);
  viewport.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });

  // Arrastar com o mouse (touch já funciona nativamente)
  var isDown = false, startX = 0, startLeft = 0, moved = false;
  viewport.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse") return;
    isDown = true; moved = false; startX = e.clientX; startLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", function (e) {
    if (!isDown) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    viewport.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove("is-dragging");
    // encaixa no slide mais próximo
    var s = step();
    viewport.scrollTo({ left: Math.round(viewport.scrollLeft / s) * s, behavior: "smooth" });
  });
  viewport.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

  // Autoplay (pausa ao interagir ou quando fora da tela)
  function startAutoplay() {
    if (reduceMotion || autoplayId) return;
    autoplayId = setInterval(function () { if (!userInteracting) go(1); }, 4200);
  }
  function stopAutoplay() { clearInterval(autoplayId); autoplayId = null; }

  ["mouseenter", "touchstart", "focusin"].forEach(function (ev) {
    viewport.addEventListener(ev, function () { userInteracting = true; }, { passive: true });
  });
  ["mouseleave", "touchend", "focusout"].forEach(function (ev) {
    viewport.addEventListener(ev, function () { setTimeout(function () { userInteracting = false; }, 1500); }, { passive: true });
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? startAutoplay() : stopAutoplay();
    }, { threshold: 0.35 }).observe(document.getElementById("carousel"));
  }
  updateCarousel();

  /* ---------- Efeito de inclinação nos cards (apenas desktop com mouse) ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-8px) perspective(800px) rotateY(" + x * 7 + "deg) rotateX(" + (-y * 7) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();