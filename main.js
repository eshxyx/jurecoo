/* ==========================================================================
   JURECO — main.js
   Hero canvas animation + shared site utilities
   Canvas target: <canvas id="hero-canvas"> inside .hero-wrapper
   Logo source:   photos/logo.png  (loaded via Image, falls back to drawn mark)
   ========================================================================== */

(function () {
    'use strict';

    /* ── 1. HERO CANVAS ANIMATION ─────────────────────────────────────────── */
    const cv = document.getElementById('hero-canvas');
    if (!cv) return;

    const cx = cv.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    let W, H;

    function resize() {
        const r = cv.getBoundingClientRect();
        cv.width  = r.width  * DPR;
        cv.height = r.height * DPR;
        cx.scale(DPR, DPR);
        W = r.width;
        H = r.height;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initDocs(); });

    /* ── Colour tokens (light / dark) ─────────────────────────────────────── */
    const dk    = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const C = {
        bg:     dk ? '#1c2018' : '#eee9e0',
        paper:  dk ? '#2e3529' : '#f7f5f1',
        paper2: dk ? '#283024' : '#f2ede5',
        border: dk ? '#4a6a48' : '#c8d9bc',
        sage:   dk ? '#8faf8c' : '#4a7a5c',
        sage2:  dk ? '#4a6a48' : '#a8c8a4',
        ink:    dk ? '#c8dbba' : '#2a2a25',
        ink2:   dk ? '#5a7a58' : '#8a8880',
        stamp:  dk ? '#6a9a68' : '#4a7a5c',
        logoFg: dk ? '#8faf8c' : '#4a7a5c',
        logoSq: dk ? '#2a3226' : '#f0ede6',
    };

    /* ── Document definitions (14 definitions) ───────────────────── */
    const DEFS = [
        { short: 'EIA', title: 'Environmental Impact Assessment', stamp: 'APPROVED',  w: 118, h: 152, lines: [5,4,5,3,4,3,5] },
        { short: 'IEP', title: 'Integrated Environmental Permit', stamp: 'SUBMITTED', w: 104, h: 138, lines: [4,5,3,5,4,3]   },
        { short: 'AAP', title: 'Atmospheric Air Protection',      stamp: 'ISSUED',    w:  96, h: 126, lines: [3,4,4,3,5]     },
        { short: 'WDP', title: 'Waste Disposal Program',          stamp: 'APPROVED',  w: 110, h: 144, lines: [5,3,4,5,3,4]   },
        { short: 'SWU', title: 'Special Water Use License',       stamp: 'ACTIVE',    w: 100, h: 132, lines: [4,4,3,4,5,3]   },
        { short: 'LAB', title: 'Laboratory Analysis Report',      stamp: 'CERTIFIED', w:  92, h: 122, lines: [5,5,4,3,4]     },
        { short: 'LPA', title: 'Labor Protection Audit',          stamp: 'COMPLIANT', w:  88, h: 116, lines: [4,3,5,4]       },
        { short: 'ESG', title: 'Sustainability Framework',        stamp: 'ALIGNED',   w: 112, h: 146, lines: [4,4,5,3,5]     },
        { short: 'ISO', title: '14001 Compliance Audit',          stamp: 'PASSED',    w: 102, h: 134, lines: [5,3,4,4,3]     },
        { short: 'GHG', title: 'Greenhouse Gas Inventory',        stamp: 'VERIFIED',  w:  94, h: 128, lines: [3,5,4,3,4]     },
        { short: 'EHS', title: 'Safety Systems Protocol',         stamp: 'CERTIFIED', w: 108, h: 140, lines: [4,5,3,4,5]     },
        { short: 'BRE', title: 'EU BREF Assessment Guide',        stamp: 'COMPLIANT', w: 115, h: 150, lines: [5,4,4,5,3,3]   },
        { short: 'WAC', title: 'Water Acceptance Criteria',       stamp: 'ACCEPTED',  w:  90, h: 120, lines: [4,3,5,3]       },
        { short: 'HAZ', title: 'Hazardous Logistics Pass',        stamp: 'ISSUED',    w:  98, h: 130, lines: [5,4,3,5]       }
    ];

    /* Organic anchor coordinates. Index 8 (ISO) pushed up/left away from logo */
    const ANCHORS = [
        { fx: 0.16, fy: 0.14, rot: -0.14, z: 0.72 },
        { fx: 0.42, fy: 0.16, rot:  0.09, z: 0.95 },
        { fx: 0.76, fy: 0.11, rot: -0.06, z: 0.80 },
        { fx: 0.24, fy: 0.76, rot:  0.11, z: 0.85 },
        { fx: 0.62, fy: 0.82, rot: -0.08, z: 0.95 },
        { fx: 0.94, fy: 0.58, rot:  0.13, z: 0.75 },
        { fx: 0.46, fy: 0.88, rot: -0.10, z: 0.70 },
        { fx: 0.88, fy: 0.28, rot:  0.18, z: 0.88 },
        { fx: 0.60, fy: 0.22, rot: -0.18, z: 1.00 }, /* ISO Document repositioned */
        { fx: 0.32, fy: 0.45, rot:  0.05, z: 0.65 },
        { fx: 0.52, fy: 0.58, rot: -0.15, z: 0.90 },
        { fx: 0.82, fy: 0.78, rot:  0.07, z: 0.82 },
        { fx: 0.92, fy: 0.88, rot: -0.04, z: 0.68 },
        { fx: 0.12, fy: 0.92, rot:  0.20, z: 0.60 }
    ];

    /* ── Mouse tracking ───────────────────────────────────────────────────── */
    const mouse = { x: -9999, y: -9999 };

    cv.addEventListener('mousemove', e => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    cv.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    cv.addEventListener('touchmove', e => {
        e.preventDefault();
        const r = cv.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - r.left;
        mouse.y = e.touches[0].clientY - r.top;
    }, { passive: false });

    /* ── Logo properties & asset binding ──────────────────────────────────── */
    const logoImg = new Image();
    let logoLoaded = false;
    logoImg.onload  = () => { logoLoaded = true; };
    logoImg.onerror = () => { logoLoaded = false; };
    logoImg.src = 'photos/logo.png';

    const logo = {
        x: 0, y: 0,
        phase: 0,
        hover: false,
    };

    function drawLogo() {
        const lx = logo.x, ly = logo.y;
        const hov = logo.hover;
        const s = hov ? 1.05 : 1.0;

        cx.save();
        cx.translate(lx, ly);
        cx.scale(s, s);

        /* Upscaled deep ambient breathing circle */
        const pr = 130 + Math.sin(logo.phase) * 8;
        cx.beginPath();
        cx.arc(0, 0, pr, 0, Math.PI * 2);
        cx.fillStyle = C.sage;
        cx.globalAlpha = dk ? 0.05 : 0.06;
        cx.fill();
        cx.globalAlpha = 1;

        /* Proportional hover ring */
        if (hov) {
            cx.beginPath();
            cx.arc(0, 0, 160, 0, Math.PI * 2);
            cx.strokeStyle = C.sage;
            cx.lineWidth = 0.8;
            cx.globalAlpha = 0.15 + Math.sin(logo.phase * 2) * 0.05;
            cx.stroke();
            cx.globalAlpha = 1;
        }

        /* Upscaled primary structural square frame */
        const sq = 120, rr = 22;

        if (logoLoaded) {
            /* Real logo image dynamic rendering */
            cx.beginPath();
            cx.roundRect(-sq / 2, -sq / 2, sq, sq, rr);
            cx.fillStyle = C.logoSq;
            cx.globalAlpha = hov ? 1 : 0.92;
            cx.fill();
            cx.strokeStyle = hov ? C.sage : C.border;
            cx.lineWidth   = hov ? 1.8 : 1.2;
            cx.globalAlpha = 1;
            cx.stroke();

            const imgPad = 22;
            const imgSize = sq - imgPad * 2;
            cx.drawImage(logoImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

        } else {
            /* Canvas fallback vector leaf illustration */
            cx.beginPath();
            cx.roundRect(-sq / 2, -sq / 2, sq, sq, rr);
            cx.fillStyle   = C.logoSq;
            cx.globalAlpha = hov ? 1 : 0.92;
            cx.fill();
            cx.strokeStyle = hov ? C.sage : C.border;
            cx.lineWidth   = hov ? 1.8 : 1.2;
            cx.globalAlpha = 1;
            cx.stroke();

            cx.save();
            cx.translate(0, -2);
            cx.scale(2.1, 2.1);
            cx.beginPath();
            cx.moveTo(0, -17);
            cx.bezierCurveTo( 13, -13,  17,  2,  0, 17);
            cx.bezierCurveTo(-17,   2, -13,-13,  0,-17);
            cx.fillStyle   = C.logoFg;
            cx.globalAlpha = hov ? 0.95 : 0.85;
            cx.fill();

            cx.beginPath();
            cx.moveTo(0, -10);
            cx.bezierCurveTo( 8,  -7,  9,  2,  0, 11);
            cx.bezierCurveTo(-9,   2, -8, -7,  0,-10);
            cx.fillStyle   = C.logoSq;
            cx.globalAlpha = 0.55;
            cx.fill();
            cx.globalAlpha = 1;
            cx.restore();
        }

        /* Typography sizing adjusted for larger footprint */
        cx.font         = '600 20px "IBM Plex Mono", monospace';
        cx.fillStyle    = C.sage;
        cx.textAlign    = 'center';
        cx.textBaseline = 'top';
        cx.globalAlpha  = hov ? 1 : 0.85;
        cx.fillText('JURECO', 0, sq / 2 + 16);

        cx.font        = '400 11px "IBM Plex Mono", monospace';
        cx.fillStyle   = C.ink2;
        cx.globalAlpha = hov ? 0.80 : 0.50;
        cx.fillText('CONSULTING', 0, sq / 2 + 42);

        cx.globalAlpha = 1;
        cx.restore();
    }

    /* ── Document class ───────────────────────────────────────────────────── */
    class Doc {
        constructor(i) {
            this.i      = i;
            this.def    = DEFS[i];
            this.anc    = ANCHORS[i];
            this.w      = this.def.w * this.anc.z;
            this.h      = this.def.h * this.anc.z;
            this.x      = this.anc.fx * (W || 600);
            this.y      = this.anc.fy * (H || 520);
            this.vx     = 0;
            this.vy     = 0;
            this.rot    = this.anc.rot;
            this.trot   = this.anc.rot;
            this.phase  = Math.random() * Math.PI * 2;
            this.spd    = 0.005 + Math.random() * 0.004;
            this.stampP = Math.random() * 0.4;
            this.hover  = false;
        }

        update() {
            this.phase += this.spd;

            const ox = Math.sin(this.phase * 0.6 + this.i) * 4;
            const oy = Math.cos(this.phase * 0.4 + this.i * 1.2) * 5;
            const tx = this.anc.fx * W + ox;
            const ty = this.anc.fy * H + oy;

            this.vx += (tx - this.x) * 0.04;
            this.vy += (ty - this.y) * 0.04;

            const mdx = this.x - mouse.x;
            const mdy = this.y - mouse.y;
            const md  = Math.sqrt(mdx * mdx + mdy * mdy);
            this.hover = md < Math.max(this.w, this.h) * 0.6;

            if (md < 110 && md > 0.1) {
                const f = (110 - md) / 110 * 1.2;
                this.vx -= (mdx / md) * f;
                this.vy -= (mdy / md) * f;
            }

            this.vx *= 0.82;
            this.vy *= 0.82;
            this.x  += this.vx;
            this.y  += this.vy;

            const tgtRot = this.hover
                ? this.trot + (mouse.x - this.x) * 0.0006
                : this.trot + Math.sin(this.phase * 0.25) * 0.02;
            this.rot += (tgtRot - this.rot) * 0.06;

            if (this.stampP < 1) this.stampP = Math.min(1, this.stampP + 0.005);
        }

        draw() {
            const hw    = this.w / 2;
            const hh    = this.h / 2;
            const liftY = this.hover ? -5 : 0;

            cx.save();
            cx.translate(this.x, this.y + liftY);
            cx.rotate(this.rot);

            const sd = this.hover ? 6 : 2.5;
            cx.save();
            cx.translate(sd * 0.6, sd);
            cx.beginPath();
            cx.rect(-hw, -hh, this.w, this.h);
            cx.fillStyle   = dk ? 'rgba(0,0,0,0.35)' : 'rgba(42,42,37,0.08)';
            cx.globalAlpha = this.hover ? 0.45 : 0.22;
            cx.fill();
            cx.restore();

            cx.save();
            cx.translate(2, 2.5);
            cx.rotate(0.02);
            cx.beginPath();
            cx.rect(-hw, -hh, this.w, this.h);
            cx.fillStyle   = C.paper2;
            cx.globalAlpha = 0.65;
            cx.fill();
            cx.strokeStyle = C.border;
            cx.lineWidth   = 0.5;
            cx.stroke();
            cx.restore();

            cx.beginPath();
            cx.rect(-hw, -hh, this.w, this.h);
            cx.fillStyle   = C.paper;
            cx.globalAlpha = 1;
            cx.fill();
            cx.strokeStyle = this.hover ? C.sage : C.border;
            cx.lineWidth   = this.hover ? 1.1 : 0.6;
            cx.stroke();

            cx.fillStyle   = C.sage;
            cx.globalAlpha = this.hover ? 0.14 : 0.06;
            cx.fillRect(-hw, -hh, this.w, 18);
            cx.globalAlpha = 1;

            cx.font         = '600 7px "IBM Plex Mono", monospace';
            cx.fillStyle    = C.sage;
            cx.textAlign    = 'left';
            cx.textBaseline = 'middle';
            cx.fillText(this.def.short, -hw + 5, -hh + 9);

            cx.font      = '500 6px "IBM Plex Mono", monospace';
            cx.fillStyle = C.ink2;
            cx.textAlign = 'right';
            cx.fillText('JURECO', hw - 5, -hh + 9);

            cx.beginPath();
            cx.moveTo(-hw + 4, -hh + 18);
            cx.lineTo(hw - 4,  -hh + 18);
            cx.strokeStyle = C.border;
            cx.lineWidth   = 0.5;
            cx.stroke();

            let ly = -hh + 26;
            this.def.lines.forEach((len, gi) => {
                const lw = (len / 5) * (this.w - 16);
                cx.beginPath();
                cx.rect(-hw + 8, ly, lw, gi === 0 ? 2.2 : 1.6);
                cx.fillStyle   = gi === 0 ? C.ink : C.ink2;
                cx.globalAlpha = gi === 0 ? 0.45 : 0.15;
                cx.fill();
                cx.globalAlpha = 1;
                ly += gi === 0 ? 9 : 6.5;
            });

            const sigY = hh - 24;
            cx.globalAlpha = 0.15;
            cx.strokeStyle = C.ink2;
            cx.lineWidth   = 0.5;
            cx.beginPath();
            cx.moveTo(-hw + 8,  sigY);
            cx.lineTo(hw * 0.25, sigY);
            cx.stroke();
            cx.beginPath();
            cx.moveTo(hw * 0.35, sigY);
            cx.lineTo(hw - 8,   sigY);
            cx.stroke();
            cx.font         = '400 5px "IBM Plex Mono", monospace';
            cx.fillStyle    = C.ink2;
            cx.globalAlpha  = 0.30;
            cx.textBaseline = 'top';
            cx.textAlign    = 'left';
            cx.fillText('Signature', -hw + 8, sigY + 2);
            cx.textAlign = 'right';
            cx.fillText('Date', hw - 8, sigY + 2);
            cx.globalAlpha = 1;

            if (this.stampP > 0) {
                const sx = hw - 18;
                const sy = hh - 18;
                const sr = 14 * this.anc.z;
                cx.save();
                cx.globalAlpha = this.stampP * (this.hover ? 0.95 : 0.65);
                cx.strokeStyle = C.stamp;

                cx.beginPath();
                cx.arc(sx, sy, sr, 0, Math.PI * 2 * this.stampP);
                cx.lineWidth = 1.2;
                cx.setLineDash([2, 1.5]);
                cx.stroke();
                cx.setLineDash([]);

                cx.beginPath();
                cx.arc(sx, sy, sr - 3.5, 0, Math.PI * 2 * this.stampP);
                cx.lineWidth = 0.5;
                cx.stroke();

                if (this.stampP >= 1) {
                    cx.font         = '600 5px "IBM Plex Mono", monospace';
                    cx.fillStyle    = C.stamp;
                    cx.textAlign    = 'center';
                    cx.textBaseline = 'middle';
                    cx.fillText(this.def.stamp, sx, sy);
                }
                cx.restore();
            }

            cx.restore();
        }
    }

    /* ── Docs initialization ──────────────────────────────────────────────── */
    /* On narrow screens show a sparser, corner-anchored subset so docs don't clutter the text */
    const MOBILE_DOC_INDICES = [0, 2, 5, 6, 11, 13];
    let docs = [];
    function initDocs() {
        const indices = window.innerWidth <= 700
            ? MOBILE_DOC_INDICES
            : ANCHORS.map((_, i) => i);
        docs = indices.map(i => new Doc(i));
    }
    initDocs();

    /* ── Connecting threads ───────────────────────────────────────────────── */
    function drawThreads() {
        for (let i = 0; i < docs.length; i++) {
            for (let j = i + 1; j < docs.length; j++) {
                const a = docs[i], b = docs[j];
                const dx = b.x - a.x, dy = b.y - a.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d > 180) continue;
                const alpha = (1 - d / 180) * 0.09;
                cx.beginPath();
                cx.moveTo(a.x, a.y);
                const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.06;
                const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.06;
                cx.quadraticCurveTo(mx, my, b.x, b.y);
                cx.strokeStyle = C.sage;
                cx.lineWidth   = 0.4;
                cx.globalAlpha = alpha;
                cx.stroke();
                cx.globalAlpha = 1;
            }

            const a   = docs[i];
            const ldx = logo.x - a.x, ldy = logo.y - a.y;
            const ld  = Math.sqrt(ldx * ldx + ldy * ldy);
            if (ld < 320) {
                cx.beginPath();
                cx.moveTo(a.x, a.y);
                cx.lineTo(logo.x, logo.y);
                cx.strokeStyle = C.sage;
                cx.lineWidth   = 0.4;
                cx.globalAlpha = (1 - ld / 320) * 0.08;
                cx.stroke();
                cx.globalAlpha = 1;
            }
        }
    }

    /* ── Blueprint background grid ────────────────────────────────────────── */
    function drawGrid() {
        cx.save();
        cx.globalAlpha = dk ? 0.035 : 0.04;
        cx.strokeStyle = C.sage;
        cx.lineWidth   = 0.5;
        const gs = 40;
        for (let x = 0; x <= W; x += gs) {
            cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke();
        }
        for (let y = 0; y <= H; y += gs) {
            cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
        }

        [[10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10]].forEach(([rx, ry]) => {
            cx.beginPath();
            cx.moveTo(rx - 7, ry); cx.lineTo(rx + 7, ry);
            cx.moveTo(rx, ry - 7); cx.lineTo(rx, ry + 7);
            cx.stroke();
        });
        cx.restore();
    }

    /* ── Render loop ──────────────────────────────────────────────────────── */
    function loop() {
        requestAnimationFrame(loop);
        cx.clearRect(0, 0, W, H);
        cx.fillStyle = C.bg;
        cx.fillRect(0, 0, W, H);

        drawGrid();

        /* Central Layout Coordinates (Centered Right field layout) */
        if (W <= 700) {
            /* Mobile: keep the mark near the top, clear of the stacked text below */
            logo.x = W * 0.5;
            logo.y = 60;
        } else {
            logo.x = W * 0.72;
            logo.y = H * 0.48;
        }
        logo.phase += 0.016;

        const lmdx = logo.x - mouse.x;
        const lmdy = logo.y - mouse.y;
        logo.hover = Math.sqrt(lmdx * lmdx + lmdy * lmdy) < 130; /* Proportional clear field checks */

        drawThreads();

        const back  = docs.filter(d => d.anc.z <= 0.82).sort((a, b) => a.anc.z - b.anc.z);
        const front = docs.filter(d => d.anc.z  > 0.82).sort((a, b) => a.anc.z - b.anc.z);

        back.forEach(d  => { d.update(); d.draw(); });
        if (W > 700) drawLogo();
        front.forEach(d => { d.update(); d.draw(); });
    }
    loop();

    /* ── 2. SCROLL REVEAL ─────────────────────────────────────────────────── */
    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                e.target.classList.add('reveal-active');
                e.target.classList.add('on');
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

    /* ── 3. ACCORDION ─────────────────────────────────────────────────────── */
    function bindAccordion(btnSel, itemSel) {
        document.querySelectorAll(btnSel).forEach(btn => {
            btn.addEventListener('click', () => {
                const item   = btn.parentElement;
                const isOpen = item.classList.contains('open');
                document.querySelectorAll(itemSel).forEach(i => i.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        });
    }
    bindAccordion('.acc-btn',      '.acc-item');
    bindAccordion('.accordion-btn','.accordion-item');

    /* ── 4. NAV KEYBOARD ACCESSIBILITY ───────────────────────────────────── */
    document.querySelectorAll('.nav-item-btn, .nav-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.nav-item-btn, .nav-btn')
                .forEach(b => b.setAttribute('aria-expanded', 'false'));
            this.setAttribute('aria-expanded', String(!expanded));
        });
    });

    /* ── 5. MOBILE NAV ─────────────────────────────────────────────────────── */
    const mHeader = document.querySelector('.site-header');
    const mBtn    = document.querySelector('.mobile-menu-btn');
    if (mBtn && mHeader) {
        mBtn.addEventListener('click', () => {
            const open = mHeader.classList.toggle('nav-open');
            mBtn.setAttribute('aria-expanded', String(open));
        });
        mHeader.querySelectorAll('.site-nav > ul > li > .nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const li = btn.parentElement;
                const wasOpen = li.classList.contains('sub-open');
                mHeader.querySelectorAll('.site-nav > ul > li').forEach(x => x.classList.remove('sub-open'));
                if (!wasOpen) li.classList.add('sub-open');
            });
        });
        mHeader.querySelectorAll('.site-nav a').forEach(a => {
            a.addEventListener('click', () => {
                mHeader.classList.remove('nav-open');
                mBtn.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', (e) => {
            if (mHeader.classList.contains('nav-open') && !mHeader.contains(e.target)) {
                mHeader.classList.remove('nav-open');
                mBtn.setAttribute('aria-expanded', 'false');
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1000) {
                mHeader.classList.remove('nav-open');
                mBtn.setAttribute('aria-expanded', 'false');
                mHeader.querySelectorAll('.site-nav > ul > li').forEach(x => x.classList.remove('sub-open'));
            }
        });
    }

    /* ── 6. CTA CONTACT FORM (index.html only) ───────────────────────────── */
    const ctaForm = document.getElementById('cta-audit-form');
    if (ctaForm) {
        const statusEl  = ctaForm.querySelector('.form-status');
        const submitBtn = ctaForm.querySelector('.btn-submit');
        const idleLabel = submitBtn.textContent;

        ctaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Надсилання...';
            statusEl.textContent = '';
            statusEl.className = 'form-status';

            try {
                const res = await fetch(ctaForm.action, {
                    method: 'POST',
                    body: new FormData(ctaForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    ctaForm.reset();
                    statusEl.textContent = 'Дякуємо! Заявку надіслано, ми зв\'яжемося з вами найближчим часом.';
                    statusEl.classList.add('success');
                } else {
                    throw new Error('Submit failed');
                }
            } catch (err) {
                statusEl.textContent = 'Сталася помилка. Спробуйте ще раз або напишіть нам напряму.';
                statusEl.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = idleLabel;
            }
        });
    }

})();