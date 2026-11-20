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
