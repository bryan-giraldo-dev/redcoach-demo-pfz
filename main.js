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

document.addEventListener('DOMContentLoaded', () => {
  const { navigation, hero, frankenstein, steps, redCoachCase, aiAgents, comparison, footer } =
    LANDING_DATA;

  // Navigation
  setText('nav-brand', navigation.brand);
  setText('nav-byline', navigation.byline);
  setText('nav-cta', navigation.cta);

  // Hero
  setText('hero-title', hero.title);
  setText('hero-description', hero.description);
  setText('hero-primary-cta', hero.primaryCTA);
  setText('hero-secondary-cta', hero.secondaryCTA);

  const heroImg = document.getElementById('hero-image');
  if (heroImg && hero.image) {
    heroImg.src = hero.image.src;
    heroImg.alt = hero.image.alt;
  }

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
    frankenstein.bullets.forEach(text => {
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

  // Comparison table
  setText('comparison-eyebrow', comparison.eyebrow);
  setText('comparison-title', comparison.title);
  setText('comparison-subtitle', comparison.subtitle);

  const headerRow = document.getElementById('comparison-header-row');
  if (headerRow) {
    // First header cell for feature labels
    const thLabel = document.createElement('th');
    thLabel.className =
      'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400';
    thLabel.scope = 'col';
    thLabel.textContent = 'Feature';
    headerRow.appendChild(thLabel);

    const totalCols = comparison.columns.length;
    comparison.columns.forEach((col, index) => {
      const th = document.createElement('th');
      th.scope = 'col';
      const isHighlight = index === totalCols - 1;
      th.className = [
        'px-4 py-3 text-xs font-semibold md:text-sm',
        isHighlight
          ? 'text-slate-900 bg-sky-50'
          : 'text-slate-700 bg-white'
      ].join(' ');
      th.textContent = col;
      headerRow.appendChild(th);
    });
  }

  const body = document.getElementById('comparison-body');
  if (body) {
    comparison.rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'bg-white/60 hover:bg-white';

      const labelCell = document.createElement('td');
      labelCell.className =
        'whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-700 md:text-sm';
      labelCell.textContent = row.label;
      tr.appendChild(labelCell);

      const totalValues = row.values.length;
      row.values.forEach((value, index) => {
        const td = document.createElement('td');
        const isHighlight = index === totalValues - 1;
        td.className = [
          'whitespace-nowrap px-4 py-3 text-xs md:text-sm',
          isHighlight
            ? 'bg-sky-50 font-semibold text-slate-900'
            : 'text-slate-600'
        ].join(' ');
        td.textContent = value;
        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
  }

  // Footer section intentionally removed per design update.

  // Enhance icons from Lucide if available
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
});