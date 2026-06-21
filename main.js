/* =========================================================
   Dr. [Your Name] — Homeopathy Clinic
   Vanilla JS, no dependencies. Each block is independent —
   safe to delete a whole block if you remove that feature.
   ========================================================= */

   
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Mobile nav ---------- */
  (function mobileNav() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("mobileNav");
    if (!toggle || !panel) return;

    function closeNav() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
    function openNav() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  })();

  /* ---------- Scroll reveal ---------- */
  (function scrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ---------- Animated counters ---------- */
  (function counters() {
    var nodes = document.querySelectorAll(".counter-value[data-count-to]");
    if (!nodes.length) return;

    function animateCount(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";

      if (prefersReducedMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
        var value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(animateCount);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    nodes.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ---------- Testimonial carousel ---------- */
  (function carousel() {
    var track = document.getElementById("storiesCarousel");
    var prevBtn = document.getElementById("storiesPrev");
    var nextBtn = document.getElementById("storiesNext");
    var dotsWrap = document.getElementById("storiesDots");
    if (!track || !dotsWrap) return;

    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    /* build dots */
    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to story " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        cards[i].scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          inline: "start",
          block: "nearest",
        });
      });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function scrollByCard(direction) {
      var cardWidth = cards[0].getBoundingClientRect().width + 20; /* gap */
      track.scrollBy({
        left: direction * cardWidth,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") scrollByCard(1);
      if (e.key === "ArrowLeft") scrollByCard(-1);
    });

    /* sync active dot with scroll position */
    var syncTimeout;
    track.addEventListener("scroll", function () {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(function () {
        var trackLeft = track.getBoundingClientRect().left;
        var closestIndex = 0;
        var closestDist = Infinity;
        cards.forEach(function (card, i) {
          var dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        });
        dots.forEach(function (dot, i) {
          dot.setAttribute("aria-selected", i === closestIndex ? "true" : "false");
        });
      }, 100);
    });
  })();

  /* ---------- Footer year ---------- */
  (function footerYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  })();
})();

(function () {
  const loader = document.getElementById('site-loader');
  const canvas = document.getElementById('loader-canvas');
  const ctx = canvas.getContext('2d');
  let balls = [], frame = 0, doneTime = null;
  let textPhase = 0, textFrame = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function makeBalls() {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2 - 30;
    const count = 9;
    const spacing = 26;
    balls = [];
    for (let i = 0; i < count; i++) {
      const r = 7;
      const targetX = cx + (i - Math.floor(count / 2)) * spacing;
      balls.push({
        x: targetX, y: -r - 20,
        vy: 0, r,
        targetX, targetY: cy,
        settled: false,
        delay: i * 10,
        t: 0, opacity: 0
      });
    }
  }

  function drawBall(x, y, r, op) {
    ctx.save();
    ctx.globalAlpha = op;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.restore();
  }

function drawText(progress) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 - 30;
  const textY1 = cy + 40;
  const textY2 = cy + 70;
  const maxSlide = 80;
  const ease = progress < 0.5 ? 2*progress*progress : -1+(4-2*progress)*progress;

  ctx.save();
  ctx.letterSpacing = '3px';

  // Line 1: "Jay Verma" (blue) + " Homeopathy" (light green)
  const slide1 = maxSlide * (1 - ease);
  ctx.globalAlpha = ease;
  ctx.textAlign = 'center';

  const line1a = 'Dr Jay Verma';
  const line1b = '  Homeopathy';
  ctx.font = '300 28px serif';
  const w1a = ctx.measureText(line1a).width;
  const w1b = ctx.measureText(line1b).width;
  const line1total = w1a + w1b;
  const line1startX = cx - line1total / 2 - slide1;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#7eb8e8';
  ctx.font = '600 28px serif';
  ctx.fillText(line1a, line1startX, textY1);

  ctx.fillStyle = '#90d4a0';
  ctx.font = '300 28px serif';
  ctx.fillText(line1b, line1startX + w1a, textY1);

  // Divider dot
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(cx, textY1 + 10, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Line 2: "Fast " (orange) + "Homeopathy" (light green)
  const slide2 = maxSlide * (1 - ease);
  const line2a = 'Fast ';
  const line2b = 'Homeopathy';
  ctx.font = '600 28px serif';
  const w2a = ctx.measureText(line2a).width;
  ctx.font = '300 28px serif';
  const w2b = ctx.measureText(line2b).width;
  const line2total = w2a + w2b;
  const line2startX = cx - line2total / 2 + slide2;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8924a';
  ctx.font = '600 28px serif';
  ctx.fillText(line2a, line2startX, textY2);

  ctx.fillStyle = '#90d4a0';
  ctx.font = '300 28px serif';
  ctx.fillText(line2b, line2startX + w2a, textY2);

  ctx.restore();
}
  function tick() {
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    let allSettled = true;

    for (let b of balls) {
      b.t++;
      if (b.t < b.delay) { allSettled = false; continue; }

      if (!b.settled) {
        b.opacity = Math.min(1, (b.t - b.delay) / 8);
        b.vy = Math.min(b.vy + 1.2, 22);
        b.y += b.vy;
        if (b.y >= b.targetY) {
          b.y = b.targetY;
          b.vy *= -0.2;
          if (Math.abs(b.vy) < 1.5) { b.settled = true; b.y = b.targetY; }
        }
        allSettled = false;
      }
      drawBall(b.x, b.y, b.r, b.opacity);
    }

    if (allSettled) {
      textFrame++;
      const progress = Math.min(1, textFrame / 35);
      drawText(progress);

      if (!doneTime && progress >= 1) doneTime = frame;
      if (doneTime && frame - doneTime > 50) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 700);
        return;
      } else {
        for (let b of balls) drawBall(b.x, b.y, b.r, b.opacity);
        drawText(progress);
      }
    }

    requestAnimationFrame(tick);
  }

  resize();
  makeBalls();
  tick();
})();
