function _hubSanitize(str) {
  if (typeof sanitize === 'function') return sanitize(str);
  var el = document.createElement('div');
  el.textContent = str;
  return el.textContent;
}

function _hubCheckRateLimit(formId, ms) {
  if (typeof _checkRateLimit === 'function') return _checkRateLimit(formId, ms);
  ms = ms || 5000;
  var now = Date.now();
  if (!window._hubFormTs) window._hubFormTs = {};
  if (window._hubFormTs[formId] && now - window._hubFormTs[formId] < ms) return false;
  window._hubFormTs[formId] = now;
  return true;
}

document.addEventListener('DOMContentLoaded', () => {

  // ===== Smooth scroll for nav anchor links =====
  document.querySelectorAll('.nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== Active nav link on scroll =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ===== Store notification form =====
  const storeForm = document.getElementById('storeForm');
  if (storeForm) {
    storeForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!_hubCheckRateLimit('storeForm')) {
        alert('Espera unos segundos antes de enviar otro mensaje.');
        return;
      }

      const email = _hubSanitize(document.getElementById('storeEmail').value.trim()).slice(0, 100);
      if (!email) return;
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Correo electrónico no válido.');
        return;
      }

      const btn = storeForm.querySelector('.btn');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      fetch('https://formspree.io/f/xdarnoqp', {
        method: 'POST',
        body: new FormData(storeForm),
        headers: { 'Accept': 'application/json' }
      }).then(() => {
        storeForm.innerHTML = '<p class="store-thanks" style="display:block;color:#2ECC71;font-weight:600;">Gracias, te avisaremos cuando la tienda esté lista.</p>';
      }).catch(() => {
        btn.disabled = false;
        btn.textContent = orig;
        alert('Error al enviar. Intenta de nuevo.');
      });
    });
  }

  // ===== Contact form =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!_hubCheckRateLimit('hubForm')) {
        alert('Espera unos segundos antes de enviar otro mensaje.');
        return;
      }

      const btn = contactForm.querySelector('.btn');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      if (document.getElementById('honeypot')?.value.trim() !== '') {
        btn.disabled = false;
        btn.textContent = origText;
        return;
      }

      const formData = new FormData(contactForm);
      formData.append('_subject', 'Contacto Tropicales JW');
      formData.append('_replyto', document.getElementById('email').value || 'no-reply@tropicalesjw.com');

      fetch('https://formspree.io/f/xdarnoqp', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          contactForm.innerHTML = '<p style="text-align:center;color:#2ECC71;font-weight:600;font-size:1.1rem;">Mensaje enviado. Te contactaremos pronto.</p>';
        } else {
          throw new Error();
        }
      }).catch(() => {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Error de conexión. Intenta de nuevo.');
      });
    });
  }

  // ===== Custom Select for servicios =====
  document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.custom-select-trigger');
    const options = select.querySelector('.custom-select-options');
    const nativeSelect = select.querySelector('select');
    const textSpan = select.querySelector('.custom-select-text');
    const optionItems = select.querySelectorAll('.custom-select-option');

    if (!optionItems.length && nativeSelect) {
      Array.from(nativeSelect.options).forEach(opt => {
        if (opt.value) {
          const div = document.createElement('div');
          div.className = 'custom-select-option';
          div.dataset.value = opt.value;
          div.textContent = opt.textContent;
          options.appendChild(div);
        }
      });
    }

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      select.classList.toggle('open');
    });

    select.querySelectorAll('.custom-select-option').forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        nativeSelect.value = value;
        textSpan.textContent = option.textContent;
        textSpan.classList.add('selected');
        select.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        select.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      select.classList.remove('open');
    });
  });

});