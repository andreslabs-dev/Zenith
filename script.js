/* ============================================================
   ZENITH — script.js
   JavaScript vanilla — sin dependencias externas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* Envío del formulario (sin backend — feedback local elegante) */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const correo = document.getElementById('correo').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      if (!nombre || !correo || !mensaje) {
        formStatus.textContent = 'Por favor completa nombre, correo y mensaje.';
        return;
      }

      formStatus.textContent = `Gracias, ${nombre}. Recibimos tu proyecto y te contactaremos pronto.`;
      contactForm.reset();
      document.querySelectorAll('.form-field input, .form-field textarea').forEach(f => f.classList.remove('has-value'));
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
     Cerrar menú móvil al redimensionar a desktop
     ---------------------------------------------------------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && mobileMenu.classList.contains('is-open')) {
      toggleMenu(true);
    }
  });

});
