/* ============================================================
   JURECO — homepage interaction layer (index.html ONLY)
   Vendored: GSAP + ScrollTrigger + Lenis (local, no CDN).
   Degrades gracefully: if GSAP/Lenis are missing or blocked,
   content still reveals via IntersectionObserver.
   ============================================================ */
(function () {
    'use strict';

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine    = matchMedia('(pointer: fine)').matches;
    var isPhone = matchMedia('(max-width: 860px)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    /* ── 0. utilities ───────────────────────────────────────── */
    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

    /* split a text node into per-character spans (keeps spaces) */
    function splitChars(el) {
        var text = el.textContent;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (c === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
            var wrap = document.createElement('span');
            wrap.className = 'ch-wrap';
            var ch = document.createElement('span');
            ch.className = 'ch';
            ch.textContent = c;
            wrap.appendChild(ch);
            frag.appendChild(wrap);
        }
        el.textContent = '';
        el.appendChild(frag);
        return $$('.ch', el);
    }

    /* ── 1. reveal fallback (always available) ──────────────── */
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.clipPath = 'none';
            io.unobserve(el);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 10% 0px' });

    function fallbackReveals() {
        $$('.rv, .rv-fade, .rv-clip').forEach(function (el) {
            el.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1), clip-path .9s cubic-bezier(.22,1,.36,1)';
            io.observe(el);
        });
        $$('.ch').forEach(function (c) { c.style.transform = 'none'; });
        $$('.q-line > span').forEach(function (s) { s.style.transform = 'none'; });
    }

    /* hard failsafe: nothing stays invisible, ever */
    setTimeout(function () {
        $$('.rv, .rv-fade, .rv-clip').forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top < innerHeight * 1.2 && getComputedStyle(el).opacity === '0') {
                el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none';
            }
        });
        /* split characters and quote lines must never stay parked off-screen */
        $$('.ch').forEach(function (c) {
            if (c.getBoundingClientRect().height && getComputedStyle(c).transform !== 'none') {
                var m = getComputedStyle(c).transform;
                if (m.indexOf('matrix') === 0 && Math.abs(parseFloat(m.split(',')[5])) > 2) c.style.transform = 'none';
            }
        });
        $$('.q-line > span').forEach(function (s) {
            var m = getComputedStyle(s).transform;
            if (m.indexOf('matrix') === 0 && Math.abs(parseFloat(m.split(',')[5])) > 2) s.style.transform = 'none';
        });
        /* hero entrance states must never be left applied */
        $$('.h-anim').forEach(function (el) {
            if (getComputedStyle(el).opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; }
        });
        $$('.h-clip').forEach(function (el) {
            if (getComputedStyle(el).clipPath.indexOf('100%') > -1) el.style.clipPath = 'none';
        });
        var pre = $('.pre');
        if (pre && pre.parentNode) pre.style.display = 'none';
        $$('.pre-curtain').forEach(function (c) { c.style.display = 'none'; });
        document.body.classList.add('ready');
    }, 4500);

    /* ── 2. header, dropdowns, mobile menu ──────────────────── */
    var hd = $('.hd');
    function onScrollHd() { hd.classList.toggle('solid', scrollY > 40); }
    addEventListener('scroll', onScrollHd, { passive: true });
    onScrollHd();

    $$('.hd-item').forEach(function (item) {
        var btn = $('.hd-link', item);
        if (fine) {
            item.addEventListener('mouseenter', function () { item.classList.add('open'); });
            item.addEventListener('mouseleave', function () { item.classList.remove('open'); });
        }
        if (btn) btn.addEventListener('click', function (e) {
            e.preventDefault();
            var was = item.classList.contains('open');
            $$('.hd-item').forEach(function (i) { i.classList.remove('open'); });
            if (!was) item.classList.add('open');
        });
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.hd-item')) $$('.hd-item').forEach(function (i) { i.classList.remove('open'); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            $$('.hd-item').forEach(function (i) { i.classList.remove('open'); });
            document.body.classList.remove('menu-open');
            var b = $('.hd-burger'); if (b) b.setAttribute('aria-expanded', 'false');
        }
    });

    var burger = $('.hd-burger');
    if (burger) {
        burger.addEventListener('click', function () {
            var open = document.body.classList.toggle('menu-open');
            burger.setAttribute('aria-expanded', String(open));
            if (lenis) { open ? lenis.stop() : lenis.start(); }
        });
        $$('.m-menu a').forEach(function (a) {
            a.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
                burger.setAttribute('aria-expanded', 'false');
                if (lenis) lenis.start();
            });
        });
    }

    /* ── 3. smooth scroll (Lenis) ───────────────────────────── */
    var lenis = null;
    if (!reduced && typeof window.Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
        if (hasGSAP) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else {
            var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }
    /* anchor links routed through Lenis */
    $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            var t = document.querySelector(id);
            if (!t) return;
            e.preventDefault();
            if (lenis) lenis.scrollTo(t, { offset: -70 });
            else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        });
    });

    /* ── 4. custom cursor ───────────────────────────────────── */
    if (fine && !reduced) {
        var cur = $('.cur'), dot = $('.cur-dot'), lbl = $('.cur-lbl');
        var mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
        addEventListener('mousemove', function (e) {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = 'translate(' + (mx - 2.5) + 'px,' + (my - 2.5) + 'px)';
            cur.style.opacity = '1'; dot.style.opacity = '1';
        }, { passive: true });
        (function loop() {
            cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
            cur.style.transform = 'translate(' + (cx - 21) + 'px,' + (cy - 21) + 'px) scale(' + (cur.dataset.s || 1) + ')';
            requestAnimationFrame(loop);
        })();
        $$('a, button, .hz-card, .voice-card, input, textarea').forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                cur.dataset.s = el.classList.contains('hz-card') ? '2.1' : '1.7';
                if (lbl) lbl.style.opacity = el.classList.contains('hz-card') ? '1' : '0';
            });
            el.addEventListener('mouseleave', function () {
                cur.dataset.s = '1';
                if (lbl) lbl.style.opacity = '0';
            });
        });
    }

    /* ── 5. magnetic buttons ────────────────────────────────── */
    if (fine && !reduced) {
        $$('.btn-main, .hd-cta, .follow-links a').forEach(function (btn) {
            var inner = $('.lbl', btn) || $('span', btn);
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width / 2) * 0.22;
                var dy = (e.clientY - r.top - r.height / 2) * 0.36;
                btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                if (inner) inner.style.transform = 'translate(' + dx * 0.35 + 'px,' + dy * 0.35 + 'px)';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = ''; if (inner) inner.style.transform = '';
            });
        });
    }

    /* ── 6. hero canvas — drifting contour field ────────────── */
    (function heroCanvas() {
        var cv = $('#hero-canvas');
        if (!cv || reduced) { if (cv) cv.style.display = 'none'; return; }
        var ctx = cv.getContext('2d', { alpha: true });
        var dpr = Math.min(devicePixelRatio || 1, 1.6);
        var w = 0, h = 0, t = 0, raf = null, visible = true;
        var LINES = isPhone ? 14 : 26;
        var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

        function size() {
            var r = cv.getBoundingClientRect();
            w = r.width; h = r.height;
            cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        size();
        addEventListener('resize', size);

        if (fine) addEventListener('mousemove', function (e) {
            pointer.tx = e.clientX / innerWidth; pointer.ty = e.clientY / innerHeight;
        }, { passive: true });

        function draw() {
            raf = requestAnimationFrame(draw);
            if (!visible) return;
            t += 0.0022;
            pointer.x += (pointer.tx - pointer.x) * 0.05;
            pointer.y += (pointer.ty - pointer.y) * 0.05;
            ctx.clearRect(0, 0, w, h);
            var step = h / LINES;
            for (var i = 0; i < LINES; i++) {
                var y0 = i * step + step * 0.5;
                var depth = i / LINES;
                ctx.beginPath();
                for (var x = 0; x <= w; x += 14) {
                    var nx = x / w;
                    var amp = 16 + depth * 40;
                    var wob = Math.sin(nx * 3.1 + t * 2 + i * 0.42) * amp
                            + Math.sin(nx * 7.4 - t * 1.3 + i * 0.2) * (amp * 0.32)
                            + (pointer.x - 0.5) * 26 * Math.sin(nx * Math.PI)
                            + (pointer.y - 0.5) * 18 * depth;
                    var y = y0 + wob;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                var a = 0.05 + depth * 0.06;
                ctx.strokeStyle = i % 5 === 0 ? 'rgba(183,92,51,' + (a * 0.85) + ')' : 'rgba(95,125,92,' + a + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        draw();

        /* stop painting when the hero is off-screen */
        var vo = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
        vo.observe(cv);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
            else if (!raf) draw();
        });
    })();

    /* ── 7. preloader → hero entrance ───────────────────────── */
    var heroChars = [];
    $$('.hero h1 .ln').forEach(function (ln) { heroChars = heroChars.concat(splitChars(ln)); });

    /* clear every CSS-declared hero state (used for reduced motion + failsafe) */
    function clearHero() {
        $$('.h-anim').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        $$('.h-clip').forEach(function (el) { el.style.clipPath = 'none'; });
        $$('.ch').forEach(function (c) { c.style.transform = 'none'; });
    }

    function heroIn() {
        if (!hasGSAP || reduced) { clearHero(); fallbackReveals(); return; }
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(heroChars, { yPercent: 0, duration: 1.05, stagger: 0.022 }, 0)
          .to('.hero-kicker', { y: 0, opacity: 1, duration: 0.7 }, 0.15)
          .to('.hero-fig', { clipPath: 'inset(0% 0 0 0)', duration: 1.25, ease: 'expo.out' }, 0.2)
          .from('.hero-fig img', { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.2)
          .to('.hero-sub', { y: 0, opacity: 1, duration: 0.8 }, 0.5)
          .to('.hero-actions > *', { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, 0.62)
          .to('.hero-badge', { y: 0, opacity: 1, duration: 0.7 }, 0.9)
          .to('.hero-foot > *', { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 0.85);
    }

    function runPreloader() {
        var pre = $('.pre');
        if (!pre || reduced || !hasGSAP) {
            if (pre) pre.style.display = 'none';
            $$('.pre-curtain').forEach(function (c) { c.style.display = 'none'; });
            document.body.classList.add('ready');
            heroIn();
            return;
        }
        var marks = splitChars($('.pre-mark'));
        var num = $('.pre-num');
        var counter = { v: 0 };
        var tl = gsap.timeline();
        tl.to(marks, { yPercent: 0, duration: 0.8, stagger: 0.03, ease: 'power3.out' })
          .to('.pre-bar i', { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, 0.2)
          .to(counter, {
              v: 100, duration: 1.15, ease: 'power2.inOut',
              onUpdate: function () { if (num) num.textContent = String(Math.round(counter.v)).padStart(3, '0'); }
          }, 0.2)
          .to('.pre-inner', { y: -18, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.15')
          .set('.pre', { display: 'none' })
          .to('.pre-curtain i', { scaleY: 0, transformOrigin: 'top', duration: 0.85, stagger: 0.06, ease: 'expo.inOut' }, '-=0.1')
          .set('.pre-curtain', { display: 'none' })
          .add(function () { document.body.classList.add('ready'); heroIn(); }, '-=0.55');
    }

    /* ── 8. scroll choreography ─────────────────────────────── */
    function buildScroll() {
        if (!hasGSAP) { fallbackReveals(); return; }
        /* reduced motion: no scroll choreography at all — just show everything */
        if (reduced) {
            clearHero();
            $$('.rv, .rv-fade, .rv-clip').forEach(function (el) {
                el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none';
            });
            $$('.q-line > span').forEach(function (s) { s.style.transform = 'none'; });
            return;
        }

        /* progress rail */
        gsap.to('.prog', {
            scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
        });

        /* generic reveals — batched so they stay cheap */
        ScrollTrigger.batch('.rv', {
            start: 'top 88%',
            onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }); }
        });
        ScrollTrigger.batch('.rv-fade', {
            start: 'top 90%',
            onEnter: function (b) { gsap.to(b, { opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power2.out', overwrite: true }); }
        });
        ScrollTrigger.batch('.rv-clip', {
            start: 'top 85%',
            onEnter: function (b) { gsap.to(b, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, stagger: 0.12, ease: 'expo.out', overwrite: true }); }
        });

        /* hero parting shot */
        gsap.to('.hero-copy', {
            y: -70, opacity: 0.25, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });
        gsap.to('.hero-fig img', {
            yPercent: 8, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });

        /* manifesto marquee — base drift + scroll velocity kick */
        var mani = $('.mani-track');
        if (mani) {
            var half = mani.scrollWidth / 2;
            var drift = gsap.to(mani, { x: -half, duration: 26, ease: 'none', repeat: -1 });
            ScrollTrigger.create({
                trigger: '.mani', start: 'top bottom', end: 'bottom top',
                onUpdate: function (self) {
                    var v = Math.min(Math.abs(self.getVelocity()) / 900, 5);
                    gsap.to(drift, { timeScale: 1 + v, duration: 0.4, overwrite: true });
                    gsap.to(drift, { timeScale: 1, duration: 1.2, delay: 0.35, overwrite: false });
                }
            });
        }

        /* newsletter marquee */
        var nt = $('.news-track');
        if (nt) gsap.to(nt, { x: -nt.scrollWidth / 2, duration: 34, ease: 'none', repeat: -1 });

        /* services — pinned horizontal gallery (desktop/tablet only) */
        var track = $('.hz-track');
        if (track && !isPhone) {
            var getScroll = function () { return track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 2; };
            gsap.to(track, {
                x: function () { return -getScroll(); },
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hz',
                    start: 'top top',
                    end: function () { return '+=' + getScroll(); },
                    scrub: 0.8,
                    pin: '.hz-pin',
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });
            gsap.to('.hz-rail i', {
                scaleX: 1, ease: 'none',
                scrollTrigger: {
                    trigger: '.hz', start: 'top top',
                    end: function () { return '+=' + getScroll(); }, scrub: 0.8, invalidateOnRefresh: true
                }
            });
        }
        /* .hz-card carries .rv, so the generic batch above reveals it —
           its hidden state lives in CSS and is failsafe-recoverable */

        /* who — layered parallax on the two plates */
        if (!isPhone) {
            gsap.to('.who-fig img', {
                yPercent: -9, ease: 'none',
                scrollTrigger: { trigger: '.who', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
            });
            gsap.to('.who-fig2', {
                y: -60, ease: 'none',
                scrollTrigger: { trigger: '.who', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
            });
        }

        /* counters */
        $$('.who-meta .k').forEach(function (el) {
            var raw = el.textContent.trim();
            var m = raw.match(/^(\d+)(\D*)$/);
            if (!m) return;
            var target = parseInt(m[1], 10), suffix = m[2], pad = m[1].length;
            var o = { v: 0 };
            ScrollTrigger.create({
                trigger: el, start: 'top 88%', once: true,
                onEnter: function () {
                    gsap.to(o, {
                        v: target, duration: 1.5, ease: 'power2.out',
                        onUpdate: function () { el.textContent = String(Math.round(o.v)).padStart(pad, '0') + suffix; }
                    });
                }
            });
        });

        /* stacked solution cards — scale back as the next one covers them */
        if (!isPhone) {
            $$('.stack-card').forEach(function (card, i, arr) {
                if (i === arr.length - 1) return;
                gsap.to(card, {
                    scale: 0.93, opacity: 0.55, ease: 'none',
                    scrollTrigger: { trigger: arr[i + 1], start: 'top bottom', end: 'top top', scrub: 0.6 }
                });
            });
        }

        /* quote — background drift + line reveal */
        gsap.to('.quote-bg', {
            yPercent: 12, ease: 'none',
            scrollTrigger: { trigger: '.quote', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
        });
        gsap.to('.q-line > span', {
            yPercent: 0, duration: 1.1, stagger: 0.13, ease: 'expo.out',
            scrollTrigger: { trigger: '.quote', start: 'top 65%' }
        });
        gsap.from('.quote-aura', {
            scale: 0.6, opacity: 0, duration: 1.6, ease: 'power2.out',
            scrollTrigger: { trigger: '.quote', start: 'top 75%' }
        });

        ScrollTrigger.refresh();
    }

    /* ── 9. card tilt (voices + stack) ──────────────────────── */
    if (fine && !reduced) {
        $$('.voice-card, .stack-card').forEach(function (card) {
            card.style.transformStyle = 'preserve-3d';
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var rx = ((e.clientY - r.top) / r.height - 0.5) * -3.4;
                var ry = ((e.clientX - r.left) / r.width - 0.5) * 3.4;
                card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
            });
            card.addEventListener('mouseleave', function () { card.style.transform = ''; });
        });
    }

    /* ── 10. audit form floating labels (form-handler.js posts) */
    $$('.audit-form .field').forEach(function (field) {
        var input = $('input, textarea', field);
        if (!input) return;
        function sync() { field.classList.toggle('filled', input.value.trim() !== ''); }
        input.addEventListener('input', sync);
        input.addEventListener('blur', sync);
        sync();
    });

    /* ── 11. boot (guarded — must run exactly once) ─────────── */
    var booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        runPreloader();
        buildScroll();
    }
    if (document.readyState === 'complete') boot();
    else addEventListener('load', boot);
    /* never let a stalled asset hold the page hostage */
    setTimeout(boot, 2600);
})();
