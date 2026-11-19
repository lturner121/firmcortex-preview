(() => {
  'use strict';

  const phone = matchMedia('(max-width:700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const walk = document.getElementById('investment-stages');
  const steps = [...walk.querySelectorAll('.walk-step')];
  const scenes = steps.map(step => step.querySelector('.walk-scene'));
  const nav = document.querySelector('#nav .walk-nav-stages');
  const platformLink = document.querySelector('#nav a[href="#platform"]');
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
  exhibits.push(remember(comparison, walk.querySelector('.walk-comparison')));

  const headline = document.getElementById('hero-title');
  const introduction = document.querySelector('#hero .copy > .sub');
  const desktopHeadline = headline.textContent;
  const desktopIntro = introduction.textContent;
  const renewalTitle = document.querySelector('#corvel-renewal .vc-renewal-card h3');
  const renewalText = renewalTitle.textContent;
  const keystone = document.querySelector('#sourcing img[data-mobile-src]');
  const desktopMark = keystone.getAttribute('src');
  const verification = document.getElementById('verification');
  const still = new URLSearchParams(location.search).get('still') === '1';
  let mobileLayout = false;
  let railFrame = 0;

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
    if (!location.hash) return;
    let target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    if (!mobileLayout) {
      if (!walk.contains(target) && target !== walk) return;
      const step = target.closest('.walk-step');
      target = step ? document.getElementById(step.dataset.detail) : comparison;
    } else {
      if (target === verification) verification.querySelector('.citation button').focus({preventScroll:true});
      for (let parent = target.parentElement; parent; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
      }
    }
    requestAnimationFrame(() => target.scrollIntoView({block:'start', behavior:'instant'}));
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
    walk.hidden = nav.hidden = !mobileLayout;
    platformLink.hash = mobileLayout ? 'investment-stages' : 'platform';
    keystone.setAttribute('src', mobileLayout ? keystone.dataset.mobileSrc : desktopMark);
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
  reducedMotion.addEventListener('change', syncMotion);
  layout();
})();
