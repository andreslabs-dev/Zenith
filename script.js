/* ============================================================
   ZENITH — script.js
   JavaScript vanilla — sin dependencias externas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     0. TEMA CLARO / OSCURO
     ---------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeToggleMobileLabel = themeToggleMobile ? themeToggleMobile.querySelector('span') : null;
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_KEY = 'zenith-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    const isLight = theme === 'light';

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
    }
    if (themeToggleMobileLabel) {
      themeToggleMobileLabel.textContent = isLight ? 'Tema oscuro' : 'Tema claro';
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isLight ? '#F4F4F4' : '#0A0A0A');
    }
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* localStorage no disponible: el tema simplemente no persiste entre visitas */
    }
  }

  // ZENITH nace en tema oscuro (identidad de marca); el claro es opcional y se recuerda si el usuario lo elige.
  const initialTheme = getStoredTheme() === 'light' ? 'light' : 'dark';
  applyTheme(initialTheme);

  function toggleTheme() {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    storeTheme(next);
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  /* ----------------------------------------------------------
     1. NAVBAR DINÁMICA AL HACER SCROLL
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  /* ----------------------------------------------------------
     2. MENÚ MÓVIL ANIMADO
     ---------------------------------------------------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function toggleMenu(forceClose) {
    const shouldOpen = forceClose === true ? false : !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', shouldOpen);
    burgerBtn.classList.toggle('is-open', shouldOpen);
    burgerBtn.setAttribute('aria-expanded', String(shouldOpen));
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  burgerBtn.addEventListener('click', () => toggleMenu());

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  /* ----------------------------------------------------------
     3. SMOOTH SCROLLING (con offset de navbar fija)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     4 + 5. INTERSECTION OBSERVER — ANIMACIONES AL ENTRAR EN VIEWPORT
     ---------------------------------------------------------- */
  const revealItems = document.querySelectorAll('.reveal, .diferencial__word');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealItems.forEach(item => revealObserver.observe(item));

  /* Palabras del bloque "Diferencial" una por una */
  const diferencialWords = document.querySelectorAll('.diferencial__word');
  diferencialWords.forEach((word, i) => {
    word.style.transitionDelay = prefersReducedMotion ? '0s' : `${i * 0.18}s`;
  });

  /* ----------------------------------------------------------
     HERO — SECUENCIA DE ENTRADA (logo → título → subtítulo → botones)
     ---------------------------------------------------------- */
  const heroLogo = document.querySelector('[data-anim="logo"]');
  const heroSubtitle = document.querySelector('[data-anim="subtitle"]');
  const heroButtons = document.querySelector('[data-anim="buttons"]');

  function runHeroIntro() {
    const step = prefersReducedMotion ? 0 : 260;

    setTimeout(() => heroLogo && heroLogo.classList.add('is-visible'), 0);
    setTimeout(() => heroSubtitle && heroSubtitle.classList.add('is-visible'), step * 2);
    setTimeout(() => heroButtons && heroButtons.classList.add('is-visible'), step * 3.4);
  }
  runHeroIntro();

  /* ----------------------------------------------------------
     6. CURSOR INTERACTIVO EN LAS CARDS DE SERVICIOS
     ---------------------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  const serviciosSection = document.querySelector('.servicios');

  if (cursorGlow && serviciosSection && !prefersReducedMotion && matchMedia('(hover: hover)').matches) {
    let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
    let rafId = null;

    function animateGlow() {
      glowX += (targetX - glowX) * 0.15;
      glowY += (targetY - glowY) * 0.15;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animateGlow);
    }

    serviciosSection.addEventListener('mouseenter', () => {
      cursorGlow.classList.add('is-active');
      if (!rafId) rafId = requestAnimationFrame(animateGlow);
    });

    serviciosSection.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    serviciosSection.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('is-active');
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
  }

  /* ----------------------------------------------------------
     7. EFECTO PARALLAX SUTIL EN EL HERO
     ---------------------------------------------------------- */
  const heroLines = document.querySelector('.hero__lines');
  const heroGrid = document.querySelector('.hero__grid');
  const heroSection = document.querySelector('.hero');

  if (heroLines && heroGrid && !prefersReducedMotion) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = window.scrollY * 0.12;
          heroLines.style.transform = `translateY(${offset}px)`;
          heroGrid.style.transform = `translateY(${offset * 0.4}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     8. ANIMACIÓN DE LA LÍNEA DEL PROCESO SEGÚN SCROLL
     ---------------------------------------------------------- */
  const proceso = document.querySelector('.proceso');
  const processLineFill = document.getElementById('processLineFill');

  if (proceso && processLineFill) {
    function updateProcessLine() {
      const rect = proceso.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Progreso desde que la sección entra por abajo hasta que sale por arriba
      const total = rect.height + viewportH;
      const traveled = viewportH - rect.top;
      let progress = traveled / total;
      progress = Math.min(Math.max(progress, 0), 1);

      processLineFill.style.width = `${progress * 100}%`;
    }

    updateProcessLine();
    window.addEventListener('scroll', updateProcessLine, { passive: true });
    window.addEventListener('resize', updateProcessLine);
  }

  /* ----------------------------------------------------------
     9. MICROEFECTO — FLOATING LABELS DEL FORMULARIO
     ---------------------------------------------------------- */
  document.querySelectorAll('.form-field input, .form-field textarea').forEach(field => {
    // Necesario para que :not(:placeholder-shown) funcione sin placeholder visible
    if (!field.hasAttribute('placeholder')) field.setAttribute('placeholder', ' ');

    field.addEventListener('input', () => {
      field.classList.toggle('has-value', field.value.trim() !== '');
    });
  });

  /* ----------------------------------------------------------
     ENVÍO DEL FORMULARIO DE CONTACTO — Web3Forms
     Envía el mensaje real por correo a zenithcontactsupport@gmail.com
     sin necesidad de backend propio. Requiere reemplazar el
     "access_key" en el HTML (ver comentario junto al formulario).
     ---------------------------------------------------------- */
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const submitBtnLabel = submitBtn ? submitBtn.querySelector('.btn__label') : null;
  const fechaHoraField = document.getElementById('fechaHora');

  let isSubmitting = false; // evita envíos duplicados por doble clic

  function setFormStatus(message, state) {
    if (!formStatus) return;
    formStatus.textContent = message;
    if (state) {
      formStatus.setAttribute('data-state', state);
    } else {
      formStatus.removeAttribute('data-state');
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return; // ya hay un envío en curso

      const nombreField = document.getElementById('nombre');
      const correoField = document.getElementById('correo');
      const necesidadField = document.getElementById('necesidad');
      const mensajeField = document.getElementById('mensaje');
      const honeypot = contactForm.querySelector('.hp-field');

      const nombre = nombreField.value.trim();
      const correo = correoField.value.trim();
      const necesidad = necesidadField.value.trim();
      const mensaje = mensajeField.value.trim();

      // Protección anti-spam silenciosa: si el honeypot viene marcado, es un bot.
      // Se simula un envío exitoso sin contactar la API, para no delatar el filtro.
      if (honeypot && honeypot.checked) {
        setFormStatus('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.', 'success');
        contactForm.reset();
        return;
      }

      // Validación de campos obligatorios
      if (!nombre || !correo || !necesidad || !mensaje) {
        setFormStatus('Por favor completa nombre, correo, asunto y mensaje.', 'error');
        return;
      }
      if (!isValidEmail(correo)) {
        setFormStatus('Por favor ingresa un correo electrónico válido.', 'error');
        correoField.focus();
        return;
      }

      // Sello de fecha/hora legible para el correo recibido
      if (fechaHoraField) {
        fechaHoraField.value = new Date().toLocaleString('es-CO', {
          dateStyle: 'long',
          timeStyle: 'short'
        });
      }

      isSubmitting = true;
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnLabel) submitBtnLabel.textContent = 'Enviando...';
      setFormStatus('Enviando tu mensaje...', null);

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setFormStatus('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.', 'success');
          contactForm.reset();
          document.querySelectorAll('.form-field input, .form-field textarea').forEach(f => f.classList.remove('has-value'));
        } else {
          setFormStatus('No pudimos enviar tu mensaje. Inténtalo nuevamente.', 'error');
        }
      } catch (err) {
        setFormStatus('No pudimos enviar tu mensaje. Inténtalo nuevamente.', 'error');
      } finally {
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnLabel) submitBtnLabel.textContent = 'Enviar proyecto';
      }
    });
  }

  /* ----------------------------------------------------------
     10. BOTÓN VOLVER ARRIBA
     ---------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    backToTop.classList.toggle('is-visible', window.scrollY > 700);
  }
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ----------------------------------------------------------
     11. BOTÓN FLOTANTE DE CONTACTO (WhatsApp / Correo)
     ---------------------------------------------------------- */
  const contactFab = document.getElementById('contactFab');
  const contactFabTrigger = document.getElementById('contactFabTrigger');
  const contactFabMenu = document.getElementById('contactFabMenu');

  if (contactFab && contactFabTrigger && contactFabMenu) {
    function openFabMenu() {
      contactFab.classList.add('is-open');
      contactFabTrigger.setAttribute('aria-expanded', 'true');
      contactFabTrigger.setAttribute('aria-label', 'Cerrar opciones de contacto');
    }

    function closeFabMenu() {
      contactFab.classList.remove('is-open');
      contactFabTrigger.setAttribute('aria-expanded', 'false');
      contactFabTrigger.setAttribute('aria-label', 'Abrir opciones de contacto');
    }

    function isFabOpen() {
      return contactFab.classList.contains('is-open');
    }

    contactFabTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isFabOpen()) {
        closeFabMenu();
      } else {
        openFabMenu();
      }
    });

    // Cerrar al hacer clic fuera del botón/menú
    document.addEventListener('click', (e) => {
      if (isFabOpen() && !contactFab.contains(e.target)) {
        closeFabMenu();
      }
    });

    // Cerrar con la tecla Escape (y devolver el foco al botón)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isFabOpen()) {
        closeFabMenu();
        contactFabTrigger.focus();
      }
    });

    // Cerrar al elegir una opción (WhatsApp o Correo)
    contactFabMenu.querySelectorAll('.contact-fab__item').forEach(item => {
      item.addEventListener('click', () => closeFabMenu());
    });
  }

  /* ----------------------------------------------------------
     Cerrar menú móvil al redimensionar a desktop
     ---------------------------------------------------------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && mobileMenu.classList.contains('is-open')) {
      toggleMenu(true);
    }
  });

});
