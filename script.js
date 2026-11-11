// Noitre demo: the order count and the two forms.
// Neither form is connected to anything, and neither pretends to be.
(() => {
  const order = document.querySelector('[data-form="order"]');
  if (order) {
    const inputs = [...order.querySelectorAll('.stepper__n')];
    const send = order.querySelector('[data-total]');
    const help = order.querySelector('[data-help]');
    const count = () => inputs.reduce((n, i) => n + (parseInt(i.value, 10) || 0), 0);
    const sync = () => {
      inputs.forEach((i) => {
        const v = Math.min(12, Math.max(0, parseInt(i.value, 10) || 0));
        if (String(v) !== i.value) i.value = v;
        const [less, more] = i.parentElement.querySelectorAll('.stepper__btn');
        less.disabled = v <= 0;
        more.disabled = v >= 12;
      });
      const n = count();
      send.textContent = n === 0 ? 'Send the order' : n === 1 ? 'Order 1 pizza' : 'Order ' + n + ' pizzas';
    };
    order.addEventListener('click', (e) => {
      const btn = e.target.closest('.stepper__btn');
      if (!btn) return;
      const input = btn.parentElement.querySelector('.stepper__n');
      input.value = (parseInt(input.value, 10) || 0) + Number(btn.dataset.step);
      help.textContent = '';
      sync();
    });
    order.addEventListener('change', sync);
    order.addEventListener('submit', (e) => {
      e.preventDefault();
      sync();
      if (count() === 0) { help.textContent = 'Add at least one pizza first.'; inputs[0].focus(); return; }
      if (!order.dataset.endpoint) { help.textContent = 'Nothing was sent.'; return; }
    });
    sync();
  }

  const reserve = document.querySelector('[data-form="reserve"]');
  if (reserve) {
    const day = reserve.querySelector('#day');
    const help = reserve.querySelector('[data-help]');
    const now = new Date();
    day.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    day.addEventListener('input', () => { day.removeAttribute('aria-invalid'); help.textContent = ''; });
    reserve.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = day.checkValidity();
      day.toggleAttribute('aria-invalid', !ok);
      if (!ok) { day.setAttribute('aria-describedby', help.id); help.textContent = 'Choose a day first.'; day.focus(); return; }
      if (!reserve.dataset.endpoint) { help.textContent = 'Nothing was sent.'; return; }
    });
  }
})();
