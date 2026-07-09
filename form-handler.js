/* Shared CTA contact form handler → Formspree */
(function () {
    const ctaForm = document.getElementById('cta-audit-form');
    if (!ctaForm) return;

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
})();
