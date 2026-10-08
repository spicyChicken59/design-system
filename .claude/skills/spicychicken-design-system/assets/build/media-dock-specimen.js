// Specimen-only frame selection. Consumers supply their own presentation state.
// No autoplay, network requests, persistence or published runtime dependency.
document.querySelectorAll('[data-sc-media-specimen]').forEach(function(host) {
  var frames=Array.from(host.querySelectorAll('[data-sc-specimen-frame]'));
  var buttons=Array.from(host.querySelectorAll('[data-sc-specimen-select]'));
  buttons.forEach(function(button) { button.addEventListener('click',function() {
    var chosen=button.getAttribute('data-sc-specimen-select');
    frames.forEach(function(frame) {
      var active=frame.getAttribute('data-sc-specimen-frame')===chosen;
      if(active) frame.removeAttribute('aria-hidden'); else frame.setAttribute('aria-hidden','true');
    });
    buttons.forEach(function(item) { item.setAttribute('aria-pressed',String(item===button)); });
  }); });
});
