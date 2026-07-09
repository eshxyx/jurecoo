/* JURECO inner pages — interaction layer (not loaded on index.html) */
(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(pointer: fine)').matches;

    /* ── ghost word behind page hero ────────────────────────── */
    var codes = {
        'eia.html': 'ОВД', 'lap.html': 'ІЕД', 'sea.html': 'СЕО',
        'lwmp.html': 'МПУВ', 'mep.html': 'МЕП', 'cds.html': 'СРГ',
        'about.html': 'Jureco'
    };
    var page = (location.pathname.split('/').pop() || '').toLowerCase();
    var hero = document.querySelector('.eia-hero, .iep-hero, .sea-hero, .lwmp-hero, .mep-hero, .cds-hero');
    if (hero && codes[page]) {
        var ghost = document.createElement('span');
        ghost.className = 'page-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.textContent = codes[page];
        hero.appendChild(ghost);
    }

    /* ── reading progress rail ──────────────────────────────── */
    var rail = document.createElement('div');
    rail.className = 'read-rail';
    rail.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rail);

    /* ── grid + list stagger: tag children, observe container ─ */
    var gridSel = '.three-grid, .phases-grid, .four-grid, .principles-grid, .oblig-grid, ' +
        '.industry-grid, .editorial-grid, .help-cards-grid, .process-steps, .testi-grid, ' +
        '.levels-chain, .facts-timeline, .timeline-dates, .stats-row';
    document.querySelectorAll(gridSel).forEach(function (grid) {
        [].forEach.call(grid.children, function (child, i) {
            if (!child.classList.contains('level-item')) child.classList.add('g-item');
            child.style.transitionDelay = Math.min(i * 70, 480) + 'ms';
        });
    });
    document.querySelectorAll('.report-checklist, .oblig-check-list, .help-list, .check-list, .cross-list, .risk-list').forEach(function (list) {
        [].forEach.call(list.children, function (li, i) {
            li.classList.add('li-item');
            li.style.transitionDelay = Math.min(i * 90, 540) + 'ms';
        });
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var t = en.target;
            t.classList.add('in');
            if (t.matches && t.matches(gridSel)) {
                [].forEach.call(t.children, function (c) { c.classList.add('in'); });
            }
            if (t.classList.contains('report-checklist') || t.classList.contains('oblig-check-list') ||
                t.classList.contains('help-list') || t.classList.contains('check-list') ||
                t.classList.contains('cross-list') || t.classList.contains('risk-list')) {
                [].forEach.call(t.children, function (c) { c.classList.add('in'); });
            }
            io.unobserve(t);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(gridSel).forEach(function (el) { io.observe(el); });
    document.querySelectorAll('.report-checklist, .oblig-check-list, .help-list, .check-list, .cross-list, .risk-list').forEach(function (el) { io.observe(el); });
    document.querySelectorAll('.tl-row, .proc-row, .level-item, .matrix-block, .sea-quote-strip, .lwmp-quote-strip, .mep-quote-strip, .cds-quote-strip, .intro-strip').forEach(function (el) { io.observe(el); });

    /* ── stat number count-up ───────────────────────────────── */
    function countUp(el) {
        var raw = el.childNodes[0] && el.childNodes[0].nodeType === 3 ? el.childNodes[0].nodeValue : null;
        if (raw === null) return;
        var txt = raw.trim();
        if (!/^[\d\s ]+$/.test(txt) || txt === '') return;
        var target = parseInt(txt.replace(/[\s ]/g, ''), 10);
        if (isNaN(target) || target === 0) return;
        var sep = /[\s ]/.test(txt);
        var t0 = null, dur = Math.min(900 + target % 700, 1600);
        function fmt(n) {
            var s = String(n);
            return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
        }
        function tick(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.childNodes[0].nodeValue = fmt(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
        }
        el.childNodes[0].nodeValue = fmt(0);
        requestAnimationFrame(tick);
    }
    if (!reduced) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('.stat-num, .stat-n, .fact-num, .tdate-num, .hero-badge-num').forEach(function (el) {
            cio.observe(el);
        });
    }

    /* ── timeline axis draw on scroll ───────────────────────── */
    var axes = document.querySelectorAll('.timeline-axis, .proc-axis');
    if (axes.length && !reduced) {
        var ticking = false;
        function drawAxes() {
            ticking = false;
            axes.forEach(function (axis) {
                var wrap = axis.parentElement;
                var r = wrap.getBoundingClientRect();
                var vh = window.innerHeight;
                var p = (vh * 0.8 - r.top) / (r.height + vh * 0.3);
                axis.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
            });
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(drawAxes); }
        }, { passive: true });
        drawAxes();
    } else {
        axes.forEach(function (a) { a.style.transform = 'scaleY(1)'; });
    }

    /* ── hero image parallax + reading rail (one rAF loop) ──── */
    var heroImg = document.querySelector('.hero-img-frame img, .hero-img-wrap img');
    if (!reduced) {
        var railTicking = false;
        function onScroll() {
            railTicking = false;
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            rail.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
            if (heroImg && h.scrollTop < window.innerHeight * 1.2) {
                heroImg.style.transform = 'translateY(' + h.scrollTop * 0.1 + 'px) scale(1.06)';
            }
        }
        window.addEventListener('scroll', function () {
            if (!railTicking) { railTicking = true; requestAnimationFrame(onScroll); }
        }, { passive: true });
        onScroll();
    }

    /* ── subtle 3D tilt on secondary visuals (desktop) ──────── */
    if (fine && !reduced) {
        document.querySelectorAll('.help-visual, .img-bordered, .img-frame').forEach(function (fig) {
            var img = fig.querySelector('img');
            if (!img) return;
            fig.style.perspective = '900px';
            fig.addEventListener('mousemove', function (e) {
                var r = fig.getBoundingClientRect();
                var rx = ((e.clientY - r.top) / r.height - 0.5) * -3.2;
                var ry = ((e.clientX - r.left) / r.width - 0.5) * 3.2;
                img.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.04)';
            });
            fig.addEventListener('mouseleave', function () {
                img.style.transform = '';
            });
        });
    }
})();
