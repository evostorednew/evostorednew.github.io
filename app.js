/* Evostored – Interaktion. Kein Framework, keine Abhängigkeiten. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------- Navigation */
  var burger = document.querySelector(".nav-burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-drawer a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------- Reveals */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  document.querySelectorAll(".rv, .chart-draw").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------------------------------------------- Hero: Beispieltag */
  var flow = document.querySelector(".flow-scene");
  if (flow) {
    var stateText = flow.querySelector(".flow-state span");
    var socFill = flow.querySelector(".fs-soc-fill");
    var socText = flow.querySelector(".fs-soc-text");
    var SOC_MAX_W = 120; /* Breite der SoC-Leiste im SVG */
    var phases = [
      { evening: false, label: "Mittag · Überschuss wird gespeichert", soc: 0.84 },
      { evening: true, label: "Abend · Speicher liefert zurück", soc: 0.41 }
    ];
    var phaseIndex = 0;

    function applyPhase() {
      var p = phases[phaseIndex];
      flow.classList.toggle("is-evening", p.evening);
      if (stateText) stateText.textContent = p.label;
      if (socFill) socFill.setAttribute("width", String(Math.round(SOC_MAX_W * p.soc)));
      if (socText) socText.textContent = Math.round(p.soc * 100) + " %";
      phaseIndex = (phaseIndex + 1) % phases.length;
    }

    applyPhase();
    if (!reduceMotion) window.setInterval(applyPhase, 7000);
  }

  /* ---------------------------------------------- App-Panel */
  var device = document.querySelector(".device");
  if (device) {
    var deviceObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          deviceObserver.unobserve(entry.target);
          var bar = device.querySelector(".soc-bar i");
          if (bar) bar.style.width = bar.dataset.width || "84%";
        });
      },
      { threshold: 0.4 }
    );
    deviceObserver.observe(device);
  }

  /* ---------------------------------------------- Skalierung: 1 → 500 */
  var scale = document.querySelector(".scale-stage");
  if (scale) {
    var countEl = scale.querySelector(".scale-count");
    var dots = Array.prototype.slice.call(scale.querySelectorAll(".dotfield i"));
    var steps = [1, 10, 100, 500];
    var stepIndex = 0;
    var timer = null;

    function showStep(index) {
      var value = steps[index];
      if (countEl) countEl.textContent = value.toLocaleString("de-DE");
      /* Punkte proportional füllen: 500 Haushalte = volles Feld */
      var onCount = Math.max(1, Math.round((value / steps[steps.length - 1]) * dots.length));
      dots.forEach(function (dot, i) {
        dot.classList.toggle("on", i < onCount);
      });
    }

    var scaleObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          scaleObserver.unobserve(entry.target);
          if (reduceMotion) {
            showStep(steps.length - 1);
            return;
          }
          showStep(0);
          timer = window.setInterval(function () {
            stepIndex += 1;
            if (stepIndex >= steps.length) {
              window.clearInterval(timer);
              return;
            }
            showStep(stepIndex);
          }, 1100);
        });
      },
      { threshold: 0.35 }
    );
    scaleObserver.observe(scale);
  }
})();
