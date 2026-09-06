// Design-preview controls only. No application data or third-party embeds.
(() => {
  const page = document.getElementById('preview-page');
  const width = document.getElementById('preview-width');
  const frame = document.getElementById('composition-preview');
  const open = document.getElementById('preview-open');
  const status = document.getElementById('preview-status');
  function update() {
    const target = `templates/${page.value}.html`;
    if (frame.getAttribute('src') !== target) frame.setAttribute('src', target);
    frame.style.width = `${width.value}px`;
    const name = page.options[page.selectedIndex].text;
    frame.title = `${name} composition at ${width.value} pixels`;
    open.href = target;
    status.textContent = `${name} · ${width.value}px preview`;
  }
  page.addEventListener('change', update);
  width.addEventListener('change', update);
})();
