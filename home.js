/* JURECO home — interaction layer (index.html only) */
(function () {
    'use strict';

    /* Animations hide content by default only when this class is present,
       so a JS failure can never leave the page blank. */
    document.documentElement.classList.add('js');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(pointer: fine)').matches;

    /* Failsafe watchdog: if a reveal element sits inside the viewport but
       never received .in (broken/silent observer, exotic browser), unstick
       it. Below-fold elements keep their normal scroll-triggered reveals. */
    var REVEAL_SEL = '.r-up, .r-fade, .r-clip, .r-clip-alt, .r-clip-up, .r-line, ' +
        '.quote-inner, .fade-up, .g-item, .li-item, .tl-row, .proc-row, ' +
        '.level-item, .matrix-block, .sea-quote-strip, .lwmp-quote-strip, ' +
        '.mep-quote-strip, .cds-quote-strip, .intro-strip';
    setTimeout(function () {
        document.body.classList.add('loaded');
        setInterval(function () {
            var vh = window.innerHeight;
            document.querySelectorAll(REVEAL_SEL).forEach(function (el) {
                if (el.classList.contains('in')) return;
                var r = el.getBoundingClientRect();
                if (r.top < vh && r.bottom > 0 && (r.width || r.height)) {
                    el.classList.add('in');
                }
            });
        }, 1500);
    }, 2500);

    /* ── hero load choreography ─────────────────────────────── */
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });
    // fallback in case load already fired or hangs on slow assets
    setTimeout(function () { document.body.classList.add('loaded'); }, 900);

    /* ── header state ───────────────────────────────────────── */
    var hd = document.querySelector('.hd');
    function onScrollHd() {
        hd.classList.toggle('solid', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScrollHd, { passive: true });
    onScrollHd();

    /* ── dropdowns (hover on desktop, click everywhere) ─────── */
    document.querySelectorAll('.hd-item').forEach(function (item) {
        var btn = item.querySelector('.hd-link');
        if (fine) {
            item.addEventListener('mouseenter', function () { item.classList.add('open'); });
            item.addEventListener('mouseleave', function () { item.classList.remove('open'); });
        }
        if (btn) {
            btn.addEventListener('click', function (e) {
                if (btn.tagName === 'BUTTON') e.preventDefault();
                var was = item.classList.contains('open');
                document.querySelectorAll('.hd-item').forEach(function (i) { i.classList.remove('open'); });
                if (!was) item.classList.add('open');
            });
        }
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.hd-item')) {
            document.querySelectorAll('.hd-item').forEach(function (i) { i.classList.remove('open'); });
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.hd-item').forEach(function (i) { i.classList.remove('open'); });
            document.body.classList.remove('menu-open');
        }
    });

    /* ── mobile menu ────────────────────────────────────────── */
    var burger = document.querySelector('.hd-burger');
    if (burger) {
        burger.addEventListener('click', function () {
            var open = document.body.classList.toggle('menu-open');
            burger.setAttribute('aria-expanded', String(open));
        });
        document.querySelectorAll('.m-menu a').forEach(function (a) {
            a.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ── reveal system ──────────────────────────────────────── */
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) {
                en.target.classList.add('in');
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.r-up, .r-fade, .r-clip, .r-clip-alt, .r-clip-up, .r-line, .quote-inner, .fade-up').forEach(function (el) {
        io.observe(el);
    });

    /* ── FAQ accordions (inner pages) ───────────────────────── */
    var accBtns = document.querySelectorAll('.accordion-btn, .acc-btn');
    accBtns.forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', function () {
            var item = btn.parentElement;
            var wasOpen = item.classList.contains('open');
            document.querySelectorAll('.accordion-item, .acc-item').forEach(function (i) {
                i.classList.remove('open');
                var b = i.querySelector('.accordion-btn, .acc-btn');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ── parallax (hero figure + quote background) ──────────── */
    if (!reduced) {
        var heroImg = document.querySelector('.hero-fig img');
        var quoteBg = document.querySelector('.quote-bg');
        var quoteSec = document.querySelector('.quote');
        var ticking = false;

        function parallax() {
            ticking = false;
            var y = window.scrollY;
            if (heroImg && y < window.innerHeight * 1.4) {
                heroImg.style.transform = 'translateY(' + (y * 0.12) + 'px)';
            }
            if (quoteBg && quoteSec) {
                var r = quoteSec.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
                    quoteBg.style.transform = 'translateY(' + (p * -60) + 'px)';
                }
            }
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
        }, { passive: true });
        parallax();
    }

    /* ── services: cursor-follow image preview (desktop) ────── */
    var peek = document.querySelector('.svc-peek');
    if (peek && fine && !reduced) {
        var imgs = peek.querySelectorAll('img');
        var px = 0, py = 0, cx = 0, cy = 0, raf = null;

        function loop() {
            cx += (px - cx) * 0.12;
            cy += (py - cy) * 0.12;
            peek.style.transform = 'translate(' + (cx - 90) + 'px,' + (cy - 115) + 'px) scale(1)';
            raf = requestAnimationFrame(loop);
        }

        var list = document.querySelector('.svc-list');
        list.addEventListener('mousemove', function (e) {
            px = e.clientX; py = e.clientY;
        });
        document.querySelectorAll('.svc-row').forEach(function (row) {
            row.addEventListener('mouseenter', function () {
                var key = row.getAttribute('data-peek');
                imgs.forEach(function (im) { im.classList.toggle('show', im.dataset.key === key); });
                peek.classList.add('on');
                if (!raf) { cx = px; cy = py; loop(); }
            });
        });
        list.addEventListener('mouseleave', function () {
            peek.classList.remove('on');
            if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
    }

    /* ── magnetic primary buttons (desktop) ─────────────────── */
    if (fine && !reduced) {
        document.querySelectorAll('.btn-main').forEach(function (btn) {
            var lbl = btn.querySelector('.lbl');
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width / 2) * 0.18;
                var dy = (e.clientY - r.top - r.height / 2) * 0.3;
                btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                if (lbl) lbl.style.transform = 'translate(' + dx * 0.4 + 'px,' + dy * 0.4 + 'px)';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
                if (lbl) lbl.style.transform = '';
            });
        });
    }

    /* ── audit form: floating labels ────────────────────────── */
    document.querySelectorAll('.audit-form .field').forEach(function (field) {
        var input = field.querySelector('input, textarea');
        if (!input) return;
        function sync() { field.classList.toggle('filled', input.value.trim() !== ''); }
        input.addEventListener('input', sync);
        input.addEventListener('blur', sync);
        sync();
    });
})();
