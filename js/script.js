(function() {
  function forceNavToggle() {
    var btn = document.getElementById('navToggle');
    if (btn && window.innerWidth <= 768) {
      btn.style.display = 'block';
    }
  }
  forceNavToggle();
  window.addEventListener('resize', forceNavToggle);
})();

// ===== Security utilities =====
function sanitize(str) {
  var el = document.createElement('div');
  el.textContent = str;
  return el.textContent;
}

var _formTimestamps = {};
function _checkRateLimit(formId, ms) {
  ms = ms || 5000;
  var now = Date.now();
  if (_formTimestamps[formId] && now - _formTimestamps[formId] < ms) {
    return false;
  }
  _formTimestamps[formId] = now;
  return true;
}

function _getMaxLength(id, fallback) {
  var el = document.getElementById(id);
  if (el && el.maxLength) return el.maxLength;
  return fallback;
}

document.addEventListener('DOMContentLoaded', () => {

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      navToggle.innerHTML = nav.classList.contains('open')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // ===== Scroll animations =====
  const animElements = document.querySelectorAll('.animate, .animate-left, .animate-right, .animate-scale');
  if (animElements.length > 0) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animElements.forEach(el => animObserver.observe(el));
  }

  // ===== Image reveal effect =====
  document.querySelectorAll('.about-image img, .service-detail-image img').forEach(img => {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealObserver.observe(img);
  });

  // ===== Header hide/show on scroll =====
  const header = document.querySelector('.header');
  if (header) {
    let lastScroll = 0;
    const headerHeight = header.offsetHeight;

    header.classList.toggle('scrolled', window.scrollY > 50);

    window.addEventListener('scroll', function() {
      const currentScroll = window.scrollY;

      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (currentScroll > headerHeight * 2) {
        header.classList.toggle('hidden', currentScroll > lastScroll);
      } else {
        header.classList.remove('hidden');
      }

      lastScroll = currentScroll;
    });
  }

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

  // ===== Animated stat counters =====
  document.querySelectorAll('.stat-number[data-target]').forEach(stat => {
    const target = parseInt(stat.dataset.target);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(function() {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            stat.textContent = current;
          }, 30);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(stat);
  });

  // ===== Poblar selects de provincias =====
  const provincias = ['Pinar del Río','Artemisa','La Habana','Mayabeque','Matanzas','Cienfuegos','Villa Clara','Sancti Spíritus','Ciego de Ávila','Camagüey','Las Tunas','Holguín','Granma','Santiago de Cuba','Guantánamo'];
  ['destino'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      const customOpts = sel.closest('.custom-select')?.querySelector('.custom-select-options');
      provincias.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p;
        sel.appendChild(opt);
        if (customOpts) {
          const div = document.createElement('div');
          div.className = 'custom-select-option';
          div.dataset.value = p;
          div.textContent = p;
          customOpts.appendChild(div);
        }
      });
    }
  });

  // ===== Formulario -> Formspree =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm && !contactForm.hasAttribute('data-hub-form')) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      btn.style.opacity = '0.7';

      if (document.getElementById('honeypot') && document.getElementById('honeypot').value.trim() !== '') {
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }

      if (!_checkRateLimit('contactForm')) {
        mostrarError('Espera unos segundos antes de enviar otro mensaje.');
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }

      const nombre = sanitize(document.getElementById('nombre').value.trim()).slice(0, _getMaxLength('nombre', 100));
      const telefono = sanitize(document.getElementById('telefono').value.trim()).slice(0, _getMaxLength('telefono', 20));
      const email = sanitize(document.getElementById('email').value.trim()).slice(0, _getMaxLength('email', 100));
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        mostrarError('Correo electrónico no válido.');
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }
      const telefonoRegex = /^[+\d\s()-]{6,20}$/;
      if (telefono && !telefonoRegex.test(telefono)) {
        mostrarError('Teléfono no válido. Solo números, +, (), espacios y guiones.');
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }
      const servicio = document.getElementById('servicio').value;
      const destino = document.getElementById('destino').value;
      const direccion = sanitize(document.getElementById('direccion').value.trim()).slice(0, _getMaxLength('direccion', 200));
      const ciudad = sanitize(document.getElementById('ciudad').value.trim()).slice(0, _getMaxLength('ciudad', 100));
      const mercancia = sanitize(document.getElementById('mercancia').value.trim()).slice(0, _getMaxLength('mercancia', 500));
      const tracking = generarTracking();

      const formData = new FormData();
      formData.append('_subject', 'Cotización Tropicales JW');
      formData.append('Nombre', nombre);
      formData.append('Teléfono', telefono);
      formData.append('_replyto', email);
      formData.append('Email', email || '(no especificado)');
      formData.append('Servicio', servicio || '(sin especificar)');
      formData.append('Origen', 'La Habana');
      formData.append('Destino', destino);
      formData.append('Dirección', direccion);
      formData.append('Ciudad', ciudad);
      formData.append('Mercancía', mercancia);
      formData.append('Tracking', tracking);

      fetch('https://formspree.io/f/xdarnoqp', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          mostrarToast();
          contactForm.reset();
        } else {
          mostrarError('Error al enviar. Intenta de nuevo.');
        }
      }).catch(() => {
        mostrarError('Error de conexión. Intenta de nuevo.');
      }).finally(() => {
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
      });

      const pedido = {
        id: Date.now(),
        tracking,
        nombre,
        telefono,
        email: email || '',
        servicio: servicio || '(sin especificar)',
        origen: 'La Habana',
        destino,
        direccion,
        ciudad,
        mercancia,
        fecha: 'Cargando...',
        estado: 'Pendiente'
      };
      document.getElementById('tracking').value = tracking;
      const pedidos = JSON.parse(localStorage.getItem('scorp_pedidos') || '[]');
      pedidos.push(pedido);
      localStorage.setItem('scorp_pedidos', JSON.stringify(pedidos));

      fetch('https://worldtimeapi.org/api/timezone/America/Havana')
        .then(r => r.json())
        .then(d => {
          pedido.fecha = d.datetime;
          const saved = JSON.parse(localStorage.getItem('scorp_pedidos') || '[]');
          const idx = saved.findIndex(p => p.id === pedido.id);
          if (idx !== -1) saved[idx].fecha = d.datetime;
          localStorage.setItem('scorp_pedidos', JSON.stringify(saved));
        })
        .catch(() => {
          pedido.fecha = new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' }) + ' (local)';
          const saved = JSON.parse(localStorage.getItem('scorp_pedidos') || '[]');
          const idx = saved.findIndex(p => p.id === pedido.id);
          if (idx !== -1) saved[idx].fecha = pedido.fecha;
          localStorage.setItem('scorp_pedidos', JSON.stringify(saved));
        });
    });
  }

  // ===== Hub contact form =====
  const hubForm = document.getElementById('contactForm');
  if (hubForm && hubForm.hasAttribute('data-hub-form')) {
    hubForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = hubForm.querySelector('.btn');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      if (document.getElementById('honeypot')?.value.trim() !== '') {
        btn.disabled = false;
        btn.textContent = origText;
        return;
      }

      if (!_checkRateLimit('hubContactForm')) {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Espera unos segundos antes de enviar otro mensaje.');
        return;
      }

      const formData = new FormData(hubForm);
      formData.append('_subject', 'Contacto Tropicales JW');
      formData.append('_replyto', document.getElementById('email').value || 'no-reply@tropicalesjw.com');

      fetch('https://formspree.io/f/xdarnoqp', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok) {
          hubForm.innerHTML = '<p style="text-align:center;color:#0FAF4B;font-weight:600;font-size:1.1rem;">Mensaje enviado. Te contactaremos pronto.</p>';
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

  // ===== WhatsApp float =====
  const ctaSection = document.querySelector('.cta');
  const whatsappFloat = document.querySelector('.whatsapp-float');
  if (ctaSection && whatsappFloat) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        whatsappFloat.classList.toggle('hidden', entry.isIntersecting);
      });
    }, { threshold: 0.3 });
    ctaObserver.observe(ctaSection);
  }

  // ===== Custom Select =====
  document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.custom-select-trigger');
    const nativeSelect = select.querySelector('select');
    const textSpan = select.querySelector('.custom-select-text');
    const optionItems = select.querySelectorAll('.custom-select-option');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      select.classList.toggle('open');
    });

    optionItems.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        nativeSelect.value = value;
        textSpan.textContent = option.textContent;
        textSpan.classList.add('selected');
        optionItems.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        select.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      select.classList.remove('open');
    });
  });

  // ===== Toast =====
  window.mostrarToast = function() {
    const toast = document.getElementById('toastConfirm');
    if (toast) toast.classList.add('show');
  };

  window.mostrarError = function(msg) {
    var el = document.getElementById('errorToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'errorToast';
      el.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#DC2626;color:#fff;padding:14px 22px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.5);z-index:9999;font-family:system-ui,sans-serif;font-size:0.9rem;max-width:360px;animation:fadeInUp 0.3s ease;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 5000);
  };

  document.addEventListener('click', function(e) {
    if (e.target.closest('#toastClose')) {
      const toast = document.getElementById('toastConfirm');
      if (toast) toast.classList.remove('show');
    }
  });

  // ===== Rastreo =====
  document.addEventListener('click', function(e) {
    if (e.target.closest('#btnBuscar')) {
      if (typeof rastrear === 'function') rastrear();
    }
  });

  // ===== Ripple effect =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn');
    if (btn && !btn.classList.contains('btn-secondary')) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    }
  });

  // ===== Back to Top =====
  const backBtn = document.createElement('button');
  backBtn.className = 'back-to-top';
  backBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  backBtn.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(backBtn);

  window.addEventListener('scroll', function() {
    backBtn.classList.toggle('show', window.scrollY > 400);
  });

  backBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== Scroll Progress Bar =====
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  });

  // ===== Tilt 3D on cards =====
  document.querySelectorAll('.service-card, .fleet-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;
      this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ===== Magnetic buttons =====
  document.querySelectorAll('.btn, .whatsapp-float').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ===== Parallax on images =====
  document.querySelectorAll('.about-image, .service-detail-image').forEach(img => {
    window.addEventListener('scroll', function() {
      const rect = img.getBoundingClientRect();
      const speed = 0.05;
      const yPos = (rect.top - window.innerHeight / 2) * speed;
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        img.querySelector('img').style.transform = 'translateY(' + yPos + 'px) scale(1.03)';
      }
    });
  });
});
