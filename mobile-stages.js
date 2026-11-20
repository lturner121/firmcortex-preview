(() => {
  'use strict';

  const phone = matchMedia('(max-width:700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const walk = document.getElementById('investment-stages');
  const steps = [...walk.querySelectorAll('.walk-step')];
  const scenes = steps.map(step => step.querySelector('.walk-scene'));
  const nav = document.getElementById('platform-stages');
  const platformLink = document.getElementById('platform-link');
  const platformToggle = document.getElementById('platform-toggle');
  const compactNav = matchMedia('(max-width:760px)');
  const compactQueue = matchMedia('(max-width:860px)');
  const queue = document.querySelector('.sourcing-prospects');
  const rowMarker = document.getElementById('tarnwick-row');
  const comparison = document.getElementById('platform');
  const desktopTitle = comparison.querySelector('h2');
  const mobileTitle = document.createElement('h3');
  mobileTitle.id = desktopTitle.id;
  mobileTitle.textContent = desktopTitle.textContent;

  // Move the actual exhibits, including their existing controls and listeners.
  function remember(section, slot) {
    const marker = document.createComment(section.id);
    section.before(marker);
    return {section, slot, marker};
  }
  const exhibits = steps.map(step =>
    remember(document.getElementById(step.dataset.detail), step.querySelector('.walk-evidence'))
  );
  exhibits.push(remember(comparison, walk.querySelector('.holdings-slot')));
  exhibits.push(remember(queue, walk.querySelector('.wr-queue')));
  exhibits.push(remember(document.getElementById('halden-basis'), walk.querySelector('.mobile-basis')));
  const plan = document.querySelector('.vc-plan');
  const otherActions = document.createElement('details');
  otherActions.className = 'other-actions';
  const actionSummary = document.createElement('summary');
  actionSummary.textContent = 'Other ranked actions';
  const otherList = document.createElement('ol');
  otherList.setAttribute('aria-label','Other ranked actions');
  otherActions.append(actionSummary, otherList);
  plan.after(otherActions);
  otherActions.hidden = true;
  for (const [index, action] of [...plan.children].entries()) {
    action.value = index + 1;
    action.setAttribute('aria-label', 'Rank ' + action.value + ' of 3');
    if (action.classList.contains('vc-simple')) exhibits.push(remember(action, otherList));
  }

  const headline = document.getElementById('hero-title');
  const introduction = document.querySelector('#hero .copy > .sub');
  const desktopHeadline = headline.textContent;
  const desktopIntro = introduction.textContent;
  const renewalTitle = document.querySelector('#corvel-renewal .vc-renewal-card h3');
  const renewalText = renewalTitle.textContent;
  const verification = document.getElementById('verification');
  const revenueText = document.getElementById('halden-revenue-text');
  const revenueSource = document.getElementById('halden-revenue-source');
  const workbook = document.getElementById('halden-excerpt');
  const still = new URLSearchParams(location.search).get('still') === '1';
  let mobileLayout = false;
  let railFrame = 0;
  let workbookResized = false;

  function setMenu(open) {
    platformToggle.setAttribute('aria-expanded', String(open));
    nav.hidden = !compactNav.matches && !open;
  }
  function syncNav() {
    platformLink.hidden = !compactNav.matches;
    platformToggle.hidden = compactNav.matches;
    platformLink.hash = phone.matches ? 'investment-stages' : 'platform';
    for (const link of nav.querySelectorAll('a')) {
      const step = steps.find(item => item.dataset.detail === link.dataset.section);
      link.hash = phone.matches ? step.querySelector('.walk-title').id : link.dataset.section;
    }
    setMenu(false);
  }
  const navGroup = platformToggle.parentElement;
  platformToggle.addEventListener('click', () => setMenu(nav.hidden));
  document.addEventListener('click', event => {
    if (!compactNav.matches && (!navGroup.contains(event.target) || event.target.closest('a'))) setMenu(false);
  });
  navGroup.addEventListener('focusout', event => {
    if (event.relatedTarget && !navGroup.contains(event.relatedTarget)) setMenu(false);
  });
  navGroup.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !compactNav.matches && !nav.hidden) {
      setMenu(false);
      platformToggle.focus();
    }
  });
  for (const step of steps) {
    document.getElementById(step.dataset.detail).setAttribute('tabindex','-1');
  }
  compactNav.addEventListener('change',syncNav);
  syncNav();

  function updateRail() {
    railFrame = 0;
    if (!mobileLayout) return;
    const line = Math.min(innerHeight * .37, 300);
    const tops = steps.map(step => step.getBoundingClientRect().top + 14);
    const current = Math.max(0, tops.filter(y => y <= line).length - 1);
    steps.forEach((step, i) => {
      step.toggleAttribute('data-current', i === current);
      const length = (tops[i + 1] ?? (tops[i] + 1)) - tops[i];
      const fraction = Math.min(1, Math.max(0, (line - tops[i]) / length));
      step.style.setProperty('--read', (fraction * 100).toFixed(1) + '%');
    });
  }
  function scheduleRail() {
    if (mobileLayout && !railFrame) railFrame = requestAnimationFrame(updateRail);
  }
  function revealFragment() {
    const id = location.hash.slice(1);
    const tarnwick = ['tarnwick-fit','tarnwick-row','sourcing-queue'].includes(id);
    rowMarker.hidden = !tarnwick || compactQueue.matches;
    let target = document.getElementById(id);
    if (!target) return;
    const sourceLink = verification.contains(target);
    if (tarnwick) {
      target = compactQueue.matches ? document.getElementById('tarnwick-fit') : rowMarker;
    } else if (!mobileLayout && walk.contains(target)) {
      const step = target.closest('.walk-step');
      target = step ? document.getElementById(step.dataset.detail) : comparison;
    }
    if (mobileLayout && sourceLink) target = revenueSource;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    if (target.hasAttribute('tabindex') || tarnwick || (mobileLayout && sourceLink)) {
      target.focus({preventScroll:true});
    }
    const block = (tarnwick && !compactQueue.matches) || (mobileLayout && sourceLink) ? 'center' : 'start';
    requestAnimationFrame(() => target.scrollIntoView({block, behavior:'instant'}));
  }

  const observer = window.IntersectionObserver && new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting || !mobileLayout || reducedMotion.matches || still) continue;
      target.dataset.playing = 'true';
      observer.unobserve(target);
    }
  }, {threshold:.44});
  function syncMotion() {
    observer?.disconnect();
    for (const scene of scenes) {
      delete scene.dataset.playing;
      if (mobileLayout && !reducedMotion.matches && !still) observer?.observe(scene);
    }
  }
  function layout() {
    if (phone.matches === mobileLayout) return;
    mobileLayout = phone.matches;
    document.documentElement.classList.toggle('mobile-stages-ready', mobileLayout);
    walk.hidden = !mobileLayout;
    otherActions.hidden = !mobileLayout;
    queue.querySelector('.featured-fit').hidden = !mobileLayout;
    verification.hidden = revenueText.hidden = mobileLayout;
    revenueSource.hidden = !mobileLayout;
    if (workbook.open) workbookResized = true;
    syncNav();
    exhibits.forEach(({section, slot, marker}) => {
      if (mobileLayout) slot.append(section);
      else marker.after(section);
    });
    if (mobileLayout) {
      desktopTitle.replaceWith(mobileTitle);
      headline.textContent = 'One system for the full investment life cycle.';
      introduction.textContent = 'See which prospects, deals and portfolio companies need your attention this week.';
      const [before, after] = renewalText.split('two-person');
      if (after !== undefined) {
        const compound = document.createElement('span');
        compound.className = 'editorial-keep';
        compound.textContent = 'two-person';
        renewalTitle.replaceChildren(before, compound, after);
      }
    } else {
      mobileTitle.replaceWith(desktopTitle);
      headline.textContent = desktopHeadline;
      introduction.textContent = desktopIntro;
      renewalTitle.textContent = renewalText;
    }
    syncMotion();
    revealFragment();
    scheduleRail();
  }
  steps.forEach((step, i) => {
    step.querySelector('.walk-replay').addEventListener('click', () => {
      if (reducedMotion.matches || still) return;
      delete scenes[i].dataset.playing;
      void scenes[i].offsetWidth;
      scenes[i].dataset.playing = 'true';
    });
    step.querySelector('.walk-extra').addEventListener('toggle', scheduleRail);
  });
  window.addEventListener('scroll', scheduleRail, {passive:true});
  window.addEventListener('resize', scheduleRail);
  window.addEventListener('hashchange', revealFragment);
  window.addEventListener('pageshow', () => { if (location.hash) requestAnimationFrame(revealFragment); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link?.hash && link.hash === location.hash) revealFragment();
  });
  phone.addEventListener('change', layout);
  compactQueue.addEventListener('change', revealFragment);
  reducedMotion.addEventListener('change', syncMotion);
  workbook.addEventListener('close', () => {
    if (!workbookResized) return;
    workbookResized = false;
    if (mobileLayout) revenueSource.closest('.walk-extra').open = true;
    const trigger = mobileLayout ? revenueSource : verification.querySelector('.citation button');
    trigger.focus();
  });
  layout();
})();
