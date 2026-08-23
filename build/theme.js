(function () {
  var KEY = 'sc-theme', root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  function sync() {
    var cur = root.getAttribute('data-theme') || 'auto';
    var btns = document.querySelectorAll('.sc-theme-toggle button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-theme') === cur ? 'true' : 'false');
  }
  function set(v) {
    if (v === 'auto') { root.removeAttribute('data-theme'); try { localStorage.removeItem(KEY); } catch (e) {} }
    else { root.setAttribute('data-theme', v); try { localStorage.setItem(KEY, v); } catch (e) {} }
    sync();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.sc-theme-toggle button');
    if (b) set(b.getAttribute('data-theme'));
  });
  document.addEventListener('DOMContentLoaded', sync);
  if (window.MutationObserver) new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
