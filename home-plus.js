/* ============================================================
   JURECO — homepage micro-interaction layer (index.html ONLY)
   Runs after home.js and deliberately does NOT re-implement
   anything it already owns (header state, dropdowns, mobile
   menu, reveals, hero/quote parallax, magnetic .btn-main,
   floating form labels).

   Only three things live here, because only these three
   genuinely need JavaScript.
   ============================================================ */
(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(pointer: fine)').matches;

    /* ── 1. reading progress hairline ───────────────────────── */
    if (!reduced) {
        var bar = document.createElement('div');
        bar.className = 'jp-prog';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);

        var ticking = false;
        function paint() {
            ticking = false;
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(paint); }
        }, { passive: true });
        paint();
    }

    /* ── 2. stats settle into place instead of just appearing ── */
    var stats = document.querySelectorAll('.who-meta .k');
    if (stats.length && !reduced) {
        var sio = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                count(en.target);
                sio.unobserve(en.target);
            });
        }, { threshold: 0.6 });
        stats.forEach(function (el) { sio.observe(el); });
    }

    function count(el) {
        var raw = el.textContent.trim();
        var m = raw.match(/^(\d+)(\D*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10);
        var suffix = m[2];
        var pad = m[1].length;
        if (!target) return;

        var start = null;
        var dur = 900;
        function frame(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased)).padStart(pad, '0') + suffix;
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ── 3. the hero watermark leans toward the pointer ───────
       A few pixels only — enough that the page feels aware of
       the cursor without anyone noticing why.                */
    var ghost = document.querySelector('.hero-ghost');
    var hero = document.querySelector('.hero-wrapper, .hero');
    if (ghost && hero && fine && !reduced) {
        var raf = null;
        hero.addEventListener('mousemove', function (e) {
            if (raf) return;
            raf = requestAnimationFrame(function () {
                raf = null;
                var r = hero.getBoundingClientRect();
                var dx = ((e.clientX - r.left) / r.width - 0.5) * 14;
                var dy = ((e.clientY - r.top) / r.height - 0.5) * 8;
                ghost.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
            });
        }, { passive: true });
        hero.addEventListener('mouseleave', function () { ghost.style.transform = ''; });
    }
})();
