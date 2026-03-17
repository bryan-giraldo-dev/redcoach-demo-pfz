import LANDING_DATA from './content.js';

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
};

const createElement = (tag, className = '', children = []) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  children.forEach(child => el.appendChild(child));
  return el;
};

// Scroll reveal helper
function registerFadeUp(el, observer) {
  if (!el) return;
  el.classList.add('fade-up-initial');

  if (!('IntersectionObserver' in window)) {
    el.classList.add('fade-up-visible');
    return;
  }

  if (observer) {
    observer.observe(el);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let fadeObserver = null;

  if ('IntersectionObserver' in window) {
    fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });
  }

  const { navigation, hero, frankenstein, steps, redCoachCase, aiAgents, comparison, footer } =
    LANDING_DATA;

  // Navigation / hero copy
  setText('nav-brand', navigation.brand);
  setText('nav-byline', navigation.byline);
  setText('hero-title', hero.title);
  setText('hero-description', hero.description);
  setText('hero-primary-cta', hero.primaryCTA);
  setText('hero-secondary-cta', hero.secondaryCTA);

  const navPrimaryCta = document.getElementById('nav-primary-cta');
  const navSecondaryCta = document.getElementById('nav-secondary-cta');
  const heroCtaGroup = document.getElementById('hero-cta-group');
  const heroPrimaryCta = document.getElementById('hero-primary-cta');
  const heroSecondaryCta = document.getElementById('hero-secondary-cta');
  const redcoachTitle = document.getElementById('redcoach-title');
  const legalModal = document.getElementById('legal-modal');
  const legalModalContent = document.getElementById('legal-modal-content');
  const privacyModalContent = document.getElementById('privacy-modal-content');
  const footerLegalLink = document.getElementById('footer-legal-link');
  const footerPrivacyLink = document.getElementById('footer-privacy-link');

  if (navPrimaryCta) {
    // Estado inicial: botón único "Talk to the team"
    navPrimaryCta.textContent = navigation.cta;
  }

  if (navSecondaryCta) {
    // Texto por defecto para el secundario (se mostrará solo al hacer scroll)
    navSecondaryCta.textContent = navigation.cta;
  }

  // Hero secondary CTA: scroll to RedCoach case study
  if (heroSecondaryCta && redcoachTitle) {
    heroSecondaryCta.addEventListener('click', () => {
      redcoachTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // "Book a demo" CTAs (hero primary + nav primary) scroll to footer form
  const demoFooter = document.getElementById('demo-footer');
  if (demoFooter) {
    const scrollToDemoForm = () => {
      demoFooter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (heroPrimaryCta) {
      heroPrimaryCta.addEventListener('click', scrollToDemoForm);
    }

    if (navPrimaryCta) {
      navPrimaryCta.addEventListener('click', scrollToDemoForm);
    }
  }

  // Legal notice / Privacy Policy modal
  if (legalModal && legalModalContent && privacyModalContent) {
    const openLegalModal = type => {
      if (type === 'legal') {
        legalModalContent.classList.remove('hidden');
        privacyModalContent.classList.add('hidden');
      } else if (type === 'privacy') {
        privacyModalContent.classList.remove('hidden');
        legalModalContent.classList.add('hidden');
      }
      legalModal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    };

    const closeLegalModal = () => {
      legalModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    };

    if (footerLegalLink) {
      footerLegalLink.addEventListener('click', () => openLegalModal('legal'));
    }

    if (footerPrivacyLink) {
      footerPrivacyLink.addEventListener('click', () => openLegalModal('privacy'));
    }

    legalModal.addEventListener('click', event => {
      if (event.target === legalModal) {
        closeLegalModal();
      }
    });

    document
      .querySelectorAll('[data-close-legal-modal]')
      .forEach(btn => btn.addEventListener('click', closeLegalModal));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !legalModal.classList.contains('hidden')) {
        closeLegalModal();
      }
    });
  }

  // Cuando se superan los CTAs del hero, el nav pasa a:
  // Primary: "Book a demo" (hero.primaryCTA)
  // Secondary: "Talk to the team" (navigation.cta)
  if (navPrimaryCta && navSecondaryCta && heroCtaGroup) {
    const updateNavCtasOnScroll = () => {
      const rect = heroCtaGroup.getBoundingClientRect();
      const pastHeroCtas = rect.bottom <= 0;

      if (pastHeroCtas) {
        navPrimaryCta.textContent = hero.primaryCTA;
        navSecondaryCta.textContent = navigation.cta;
        navSecondaryCta.classList.remove('hidden', 'nav-cta--hidden');
        navSecondaryCta.classList.add('nav-cta', 'nav-cta--visible');
      } else {
        navPrimaryCta.textContent = navigation.cta;
        navSecondaryCta.classList.remove('nav-cta--visible');
        navSecondaryCta.classList.add('nav-cta--hidden', 'hidden');
      }
    };

    // Ejecutar una vez al cargar y luego en scroll
    updateNavCtasOnScroll();
    window.addEventListener('scroll', updateNavCtasOnScroll, { passive: true });
  }

  const heroImg = document.getElementById('hero-image');
  if (heroImg && hero.image) {
    heroImg.src = hero.image.src;
    heroImg.alt = hero.image.alt;
  }

  // Register static fade-up elements
  document
    .querySelectorAll('[data-animate="fade-up"]')
    .forEach(el => registerFadeUp(el, fadeObserver));

  // Frankenstein / problem section
  setText('frankenstein-eyebrow', frankenstein.eyebrow);
  setText('frankenstein-title', frankenstein.title);
  const frankensteinBadge = document.getElementById('frankenstein-badge');
  if (frankensteinBadge && frankenstein.badge) {
    frankensteinBadge.textContent = frankenstein.badge;
  }
  setText('frankenstein-stat-value', frankenstein.statValue);
  setText('frankenstein-stat-label', frankenstein.statLabel);
  setText('frankenstein-description', frankenstein.description);

  const bulletsContainer = document.getElementById('frankenstein-bullets');
  if (bulletsContainer) {
    frankenstein.bullets.forEach((text, index) => {
      const li = document.createElement('li');
      li.className =
        'rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm shadow-slate-100 md:px-5';
      li.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-alert/10 text-alert text-xs">
            ✕
          </span>
          <span>${text}</span>
        </div>
      `;
      // Domino / staggered reveal for Frankenstein bullets
      li.style.transitionDelay = `${index * 220}ms`;
      registerFadeUp(li, fadeObserver);
      bulletsContainer.appendChild(li);
    });
  }

  const frankImg = document.getElementById('frankenstein-image');
  if (frankImg && frankenstein.image) {
    frankImg.src = frankenstein.image.src;
    frankImg.alt = frankenstein.image.alt;
  }

  // Three steps
  setText('steps-eyebrow', steps.eyebrow);
  setText('steps-title', steps.title);
  setText('steps-subtitle', steps.subtitle);
  const stepsList = document.getElementById('steps-list');
  if (stepsList) {
    // Icons themed to match the RedCoach case study (money, time, performance)
    const stepIcons = ['badge-dollar-sign', 'clock-3', 'trending-up'];
    steps.items.forEach((item, index) => {
      const iconName = stepIcons[index] || 'circle';
      const card = document.createElement('article');
      card.className =
        'relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-8 pb-8 pt-12 text-center shadow-lg shadow-slate-200/80';

      const iconMarkup =
        index === 0
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plug-icon lucide-plug h-6 w-6 text-slate-300"><path d="M12 22v-5"/><path d="M15 8V2"/><path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z"/><path d="M9 8V2"/></svg>`
          : index === 1
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles-icon lucide-wand-sparkles h-6 w-6 text-slate-300"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>`
          : index === 2
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap-icon lucide-zap h-6 w-6 text-slate-300"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`
          : `<i data-lucide="${iconName}" class="h-6 w-6 text-slate-300"></i>`;

      card.innerHTML = `
        <div class="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-white bg-brand-blue text-sm font-semibold text-white shadow-md">
          ${item.step}
        </div>
        <div class="mx-auto mb-3 mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
          ${iconMarkup}
        </div>
        <h3 class="font-accent text-base font-bold md:text-lg">${item.title}</h3>
        <p class="text-xs text-slate-600 md:text-sm">${item.description}</p>
      `;
      // Domino / staggered reveal on scroll (slower so it's noticeable)
      card.style.transitionDelay = `${index * 220}ms`;
      registerFadeUp(card, fadeObserver);
      stepsList.appendChild(card);
    });
  }

  // RedCoach case
  setText('redcoach-label', redCoachCase.label);
  setText('redcoach-title', redCoachCase.title);
  setText('redcoach-subtitle', redCoachCase.subtitle);

  const redMetrics = document.getElementById('redcoach-metrics');
  if (redMetrics) {
    redCoachCase.metrics.forEach(metric => {
      const metricCard = document.createElement('div');
      metricCard.className =
        'flex flex-col justify-center rounded-2xl bg-emerald-50 px-6 py-5 text-sm shadow-sm shadow-emerald-50/80';
      metricCard.innerHTML = `
        <p class="text-2xl font-semibold text-emerald-900 md:text-[1.8rem]">${metric.value}</p>
        <p class="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-800/80 md:text-[11px]">${metric.label}</p>
      `;
      registerFadeUp(metricCard, fadeObserver);
      redMetrics.appendChild(metricCard);
    });
  }
  setText('redcoach-quote', redCoachCase.quote);
  setText('redcoach-author', redCoachCase.author);
  setText('redcoach-role', redCoachCase.role);

  const redcoachAvatar = document.getElementById('redcoach-avatar');
  if (redcoachAvatar && redCoachCase.image) {
    redcoachAvatar.src = redCoachCase.image.src;
    redcoachAvatar.alt = redCoachCase.image.alt;
  }

  const redBottomMetrics = document.getElementById('redcoach-bottom-metrics');
  if (redBottomMetrics && redCoachCase.bottomMetrics) {
    redBottomMetrics.innerHTML = redCoachCase.bottomMetrics
      .map(
        metric => `
        <div class="flex flex-col items-center text-center">
          <span class="text-sm font-semibold text-brand-blue md:text-base">${metric.value}</span>
          <span class="text-[10px] text-slate-500 md:text-[11px]">${metric.label}</span>
        </div>
      `
      )
      .join('');
  }

  setText('redcoach-challenge-title', redCoachCase.challengeTitle);
  setText('redcoach-challenge-body', redCoachCase.challengeBody);

  const pdfLink = document.getElementById('redcoach-pdf-link');
  if (pdfLink && redCoachCase.pdf) {
    pdfLink.href = redCoachCase.pdf.href;
    // Keep existing HTML (icon + text) instead of replacing it
  }

  // AI agents - domino reveal for cards
  const aiAgentsGrid = document.getElementById('ai-agents-grid');
  if (aiAgentsGrid) {
    const cards = Array.from(aiAgentsGrid.querySelectorAll('article[data-animate="fade-up"]'));
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 220}ms`;
    });
  }

  // Enhance icons from Lucide if available
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
});