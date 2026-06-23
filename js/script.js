// ===== Nav-toggle defensivo para móvil =====
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

document.addEventListener('DOMContentLoaded', () => {

  // ===== Navegación móvil =====
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

  // ===== Animación de contadores =====
  const counters = document.querySelectorAll('.stat-number');

  if (counters.length > 0) {
    const animateCounters = () => {
      let anyPending = false;
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const current = parseInt(counter.textContent);
        const increment = Math.ceil(target / 60);

        if (current < target) {
          counter.textContent = Math.min(current + increment, target);
          anyPending = true;
        } else {
          counter.textContent = target + '+';
        }
      });
      if (anyPending) requestAnimationFrame(animateCounters);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counters[0].closest('.stats'));
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

  // ===== Header scroll effect =====
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

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

  // ===== Formulario de contacto -> Formspree =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm && !contactForm.hasAttribute('data-hub-form')) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      btn.style.opacity = '0.7';

      // Honeypot anti-spam
      if (document.getElementById('honeypot') && document.getElementById('honeypot').value.trim() !== '') {
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }

      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email = document.getElementById('email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        mostrarError('Correo electrónico no válido.');
        btn.disabled = false;
        btn.textContent = origText;
        btn.style.opacity = '';
        return;
      }
      const servicio = document.getElementById('servicio').value;
      const destino = document.getElementById('destino').value;
      const direccion = document.getElementById('direccion').value.trim();
      const ciudad = document.getElementById('ciudad').value.trim();
      const mercancia = document.getElementById('mercancia').value.trim();
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

      // Guardar pedido en localStorage
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

  // ===== WhatsApp float oculto al ver CTA =====
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
    const options = select.querySelector('.custom-select-options');
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

  // ===== Toast de confirmación =====
  window.mostrarToast = function() {
    const toast = document.getElementById('toastConfirm');
    if (toast) toast.classList.add('show');
  };

  window.mostrarError = function(msg) {
    var el = document.getElementById('errorToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'errorToast';
      el.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#7F2925;color:#fff;padding:14px 22px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.3);z-index:9999;font-family:system-ui,sans-serif;font-size:0.9rem;max-width:360px;animation:fadeInUp 0.3s ease;';
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

  // ===== Rastreo: botón buscar =====
  document.addEventListener('click', function(e) {
    if (e.target.closest('#btnBuscar')) {
      if (typeof rastrear === 'function') rastrear();
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
});
