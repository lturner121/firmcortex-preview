/* Progressive mobile layout: reuses the approved nodes and restores desktop exactly. */
(function () {
  'use strict';
  var mobile = window.matchMedia('(max-width:700px)');
  var contact = document.querySelector('#contact .wrap');
  var words = contact.querySelector('.words');
  var form = document.getElementById('form');
  var trust = words.querySelector('.trust');
  var retention = document.querySelector('.corvel-metric.attention');
  var percentile = null;
  var capabilities = Array.prototype.map.call(document.querySelectorAll('#sourcing .tile'), function (tile) {
    return {tile:tile, title:tile.querySelector('h3'), body:tile.querySelector('p'), details:null};
  });
  function apply() {
    if (mobile.matches) {
      words.insertBefore(form, trust);
      if (!percentile) {
        percentile = document.createElement('span');
        percentile.className = 'corvel-pixels corvel-mobile-percentile';
        percentile.style.cssText = '--crop-y:292;--crop-w:224;--crop-h:42';
        retention.append(percentile);
      }
      capabilities.forEach(function (item) {
        if (item.details) return;
        item.details = document.createElement('details');
        item.details.className = 'mobile-capability';
        var summary = document.createElement('summary');
        summary.append(item.title);
        item.details.append(summary, item.body);
        item.tile.append(item.details);
      });
    } else {
      if (percentile) { percentile.remove(); percentile = null; }
      if (form.parentElement !== contact) contact.append(form);
      capabilities.forEach(function (item) {
        if (!item.details) return;
        item.tile.append(item.title, item.body);
        item.details.remove();
        item.details = null;
      });
    }
  }
  apply();
  if (mobile.addEventListener) mobile.addEventListener('change', apply);
  else mobile.addListener(apply);
})();

(function () {
  'use strict';
  var mobile = window.matchMedia('(max-width:700px)');
  var reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  var still = /[?&]still=1/.test(location.search);
  var group = document.querySelector('#hero .few');
  var track = group.querySelector('ol');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.card'));
  var button = null, timer = 0, phase = -1, seen = false, paused = false, focused = false;
  var pauseIcon = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1h3v10H2zM7 1h3v10H7z"/></svg>';
  var playIcon = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1l8 5-8 5z"/></svg>';
  function eligible() { return mobile.matches && !reduced.matches && !still; }
  function canRun() { return eligible() && seen && !paused && !focused && !document.hidden; }
  function clear() { window.clearTimeout(timer); timer = 0; }
  function paint(index) {
    group.classList.add('mobile-running');
    cards.forEach(function (card, n) { card.classList.toggle('mobile-focus', n === index); });
    if (index < cards.length) {
      var point = cards[index].querySelector('.who i');
      var pointRect = point.getBoundingClientRect();
      var trackRect = track.getBoundingClientRect();
      var progress = (pointRect.top + pointRect.height / 2 - trackRect.top - 24) / (trackRect.height - 48);
      track.style.setProperty('--mobile-progress', Math.max(0, Math.min(1, progress)));
    } else track.style.setProperty('--mobile-progress', '1');
  }
  function step() {
    clear();
    if (!canRun()) return;
    phase = (phase + 1) % (cards.length + 1);
    paint(phase);
    timer = window.setTimeout(step, phase === cards.length ? 1800 : 2800);
  }
  function sync() {
    clear();
    if (!eligible()) {
      group.classList.remove('mobile-running');
      cards.forEach(function (card) { card.classList.remove('mobile-focus'); });
      track.style.removeProperty('--mobile-progress');
      phase = -1;
      if (button) { button.remove(); button = null; }
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-motion-control';
      button.setAttribute('aria-label', paused ? 'Play overview animation' : 'Pause overview animation');
      button.setAttribute('aria-pressed', String(paused));
      button.innerHTML = paused ? playIcon : pauseIcon;
      button.addEventListener('click', function () {
        paused = !paused;
        button.setAttribute('aria-label', paused ? 'Play overview animation' : 'Pause overview animation');
        button.setAttribute('aria-pressed', String(paused));
        button.innerHTML = paused ? playIcon : pauseIcon;
        sync();
      });
      group.append(button);
    }
    if (canRun()) timer = window.setTimeout(step, phase < 0 ? 450 : 1400);
  }
  track.addEventListener('focusin', function () { focused = true; clear(); });
  track.addEventListener('focusout', function (event) { if (track.contains(event.relatedTarget)) return; focused = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) { seen = entries[entries.length - 1].isIntersecting; sync(); }, {threshold:0.2}).observe(group);
  } else seen = true;
  [mobile, reduced].forEach(function (query) { if (query.addEventListener) query.addEventListener('change', sync); else query.addListener(sync); });
  sync();
})();

(function () {
  'use strict';
  const link = document.querySelector('[data-sourcing-link]');
  const queue = document.getElementById('sourcing-queue');
  const summary = document.getElementById('tarnwick-fit');
  const details = summary.closest('details');
  const narrow = window.matchMedia('(max-width: 860px)');

  function updateLink() {
    link.hash = narrow.matches ? summary.id : queue.id;
  }

  function followFragment() {
    if (location.hash !== '#' + summary.id && location.hash !== '#' + queue.id) return;
    if (narrow.matches) details.open = true;
    // A shared link may have been copied at the other viewport size.
    const target = narrow.matches ? summary : queue;
    if (location.hash !== '#' + target.id) {
      target.focus({ preventScroll: true });
      target.scrollIntoView();
    }
  }

  updateLink();
  narrow.addEventListener('change', updateLink);
  link.addEventListener('click', function () {
    // A repeated visit to the same fragment does not fire hashchange.
    if (narrow.matches) details.open = true;
  });
  window.addEventListener('hashchange', followFragment);
  if (document.readyState === 'complete') followFragment();
  else window.addEventListener('load', followFragment, { once: true });
})();
