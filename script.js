// Noitre demo: the order count and the two forms.
// Neither form is connected to anything, and neither pretends to be.
(() => {
  // Enter in a field acts like the form's button (the buttons are type="button", so nothing submits without this script)
  const onEnter = (form, act) => {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); act(); }
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); act(); });
  };

  const order = document.querySelector('[data-form="order"]');
  if (order) {
    const inputs = [...order.querySelectorAll('.stepper__n')];
    const send = order.querySelector('[data-total]');
    const help = order.querySelector('[data-help]');
    const value = (i) => Math.min(12, Math.max(0, parseInt(i.value, 10) || 0));
    const count = () => inputs.reduce((n, i) => n + value(i), 0);
    let last = null;
    // fix: also rewrite the typed value into 0 to 12 (on change, not while typing)
    const sync = (fix) => {
      inputs.forEach((i) => {
        const v = value(i);
        if (fix && String(v) !== i.value) i.value = v;
        const [less, more] = i.parentElement.querySelectorAll('.stepper__btn');
        less.setAttribute('aria-disabled', String(v <= 0));
        more.setAttribute('aria-disabled', String(v >= 12));
      });
      const n = count();
      if (last !== null && n !== last) help.textContent = '';
      last = n;
      send.textContent = n === 0 ? 'Send the order' : n === 1 ? 'Order 1 pizza' : 'Order ' + n + ' pizzas';
    };
    const place = () => {
      sync(true);
      if (count() === 0) { help.textContent = 'Add at least one pizza first.'; inputs[0].focus(); return; }
      if (!order.dataset.endpoint) { help.textContent = 'Nothing was sent.'; return; }
    };
    order.addEventListener('click', (e) => {
      if (e.target.closest('[data-total]')) { place(); return; }
      const btn = e.target.closest('.stepper__btn');
      if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
      const input = btn.parentElement.querySelector('.stepper__n');
      input.value = value(input) + Number(btn.dataset.step);
      sync(true);
    });
    order.addEventListener('input', () => sync(false));
    order.addEventListener('change', () => sync(true));
    onEnter(order, place);
    sync(true);
  }

  const reserve = document.querySelector('[data-form="reserve"]');
  if (reserve) {
    const day = reserve.querySelector('#day');
    const help = reserve.querySelector('[data-help]');
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const now = new Date();
    day.min = iso(now);
    // a date always shows: the next evening the room is open (closed Mondays; last table at 9:30 PM)
    if (!day.value) {
      const d = new Date(now);
      if (d.getHours() * 60 + d.getMinutes() >= 21 * 60 + 30) d.setDate(d.getDate() + 1);
      while (d.getDay() === 1) d.setDate(d.getDate() + 1);
      day.value = iso(d);
    }
    const clear = () => {
      help.textContent = '';
      if (day.checkValidity()) { day.removeAttribute('aria-invalid'); day.removeAttribute('aria-describedby'); }
    };
    day.addEventListener('input', clear);
    day.addEventListener('change', clear);
    const book = () => {
      const ok = day.checkValidity();
      if (!ok) { day.setAttribute('aria-invalid', 'true'); day.setAttribute('aria-describedby', help.id); help.textContent = 'Choose a day first.'; day.focus(); return; }
      day.removeAttribute('aria-invalid'); day.removeAttribute('aria-describedby');
      if (!reserve.dataset.endpoint) { help.textContent = 'Nothing was sent.'; return; }
    };
    reserve.querySelector('[data-book]').addEventListener('click', book);
    onEnter(reserve, book);
  }
})();
