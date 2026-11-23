// The original text console, kept for power users and hidden until ~ (or `) is pressed.
// Name completion, history and output all live here; the app only supplies state and a way to run a command.

export class Console {
  // ctx: { $, $$, esc, quote, num, run(text) -> Promise, snap(), idx(), places() }
  constructor(ctx) {
    this.ctx = ctx; this.history = []; this.at = 0;
    const { $ } = ctx;
    this.dock = $('#dock'); this.input = $('#command'); this.list = $('#console-pick');
    this.input.addEventListener('input', () => this.suggest());
    this.input.addEventListener('blur', () => setTimeout(() => { this.list.hidden = true; }, 150));
    this.input.addEventListener('keydown', e => this.keys(e));
    document.addEventListener('mousedown', e => { const it = e.target.closest('[data-cpick]'); if (it) { e.preventDefault(); this.accept(it.dataset.cpick); } });
    $('#command-form').onsubmit = e => { e.preventDefault(); this.list.hidden = true; this.submit(); };
    $('#dock-close').onclick = () => { $('#dock-out').hidden = true; };
    document.addEventListener('keydown', e => {
      if ((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey && !e.altKey && (e.target === this.input || !e.target.closest('input,textarea,select'))) { e.preventDefault(); this.toggle(); }
    });
  }

  get open() { return !this.dock.hidden; }
  toggle(open = !this.open) {
    this.dock.hidden = !open; document.body.classList.toggle('console-open', open);
    if (open) this.input.focus(); else this.input.blur();
  }

  async submit() {
    const text = this.input.value.trim(); if (!text) return;
    this.history.push(text); this.at = this.history.length;
    if (await this.ctx.run(text)) this.input.value = '';
  }
  show(cmd, out) {
    const { $ } = this.ctx;
    $('#console-output').textContent = out; $('#dock-cmd').textContent = '› ' + cmd; $('#dock-out').hidden = false;
  }

  // ---- name completion
  context() {
    const text = this.input.value.slice(0, this.input.selectionStart ?? this.input.value.length);
    const open = (text.match(/(^|[^\\])"/g) || []).length % 2 === 1, start = open ? text.lastIndexOf('"') : text.lastIndexOf(' ') + 1;
    return { text, start, partial: text.slice(open ? start + 1 : start), rest: this.input.value.slice(text.length) };
  }
  matches() {
    const { snap, idx, places, num } = this.ctx, s = snap(), { partial } = this.context(), q = partial.trim().toLowerCase();
    if (!s || q.length < 2 || partial.includes('=')) return [];
    const verb = this.input.value.trim().split(/\s+/)[0]?.toLowerCase(), out = [];
    const add = (type, name, meta) => { if (name.toLowerCase().includes(q)) out.push({ type, name, meta, starts: name.toLowerCase().startsWith(q) }); };
    s.countries.forEach(c => add('country', c.name, `${num(c.population)} residents`));
    places().forEach(p => add('settlement', p.name, p.countryName));
    s.diseases.forEach(d => add('disease', d.name, d.course));
    if (['grant', 'revoke', 'catalog', 'inspire'].includes(verb)) (s.discoveryNames || []).forEach(n => add('discovery', n, ''));
    if (out.length < 10) for (const p of idx().living) { add('person', p.name, p.settlementName); if (out.length >= 40) break; }
    return out.sort((a, b) => b.starts - a.starts).slice(0, 10);
  }
  suggest() {
    const { esc } = this.ctx, items = this.matches();
    delete this.list.dataset.nav;
    this.list.hidden = !items.length;
    this.list.innerHTML = items.map((it, i) => `<button type="button" class="pick-item ${i === 0 ? 'active' : ''}" data-cpick="${esc(it.name)}"><span class="ptype" data-t="${it.type}">${it.type}</span><b>${esc(it.name)}</b><small>${esc(it.meta)}</small></button>`).join('');
  }
  accept(name) {
    const { text, start, rest } = this.context(), before = text.slice(0, start), ins = this.ctx.quote(name) + ' ';
    this.input.value = before + ins + rest.trimStart(); const pos = (before + ins).length;
    this.input.setSelectionRange(pos, pos); this.input.focus(); this.list.hidden = true;
  }

  keys(e) {
    const items = [...this.list.querySelectorAll('.pick-item')], shown = !this.list.hidden && items.length;
    if (shown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault(); this.list.dataset.nav = '1';
      let i = items.findIndex(x => x.classList.contains('active')); items[i]?.classList.remove('active');
      i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[i].classList.add('active'); return;
    }
    // Tab accepts the highlighted name; Enter accepts it only after arrow-key navigation, otherwise it runs the command.
    if (shown && (e.key === 'Tab' || (e.key === 'Enter' && this.list.dataset.nav))) { e.preventDefault(); this.accept((items.find(x => x.classList.contains('active')) || items[0]).dataset.cpick); return; }
    if (e.key === 'Escape') { e.stopPropagation(); if (shown) this.list.hidden = true; else this.toggle(false); return; }
    if (e.key === 'ArrowUp' && this.history.length) { e.preventDefault(); this.at = Math.max(0, this.at - 1); this.input.value = this.history[this.at]; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.at = Math.min(this.history.length, this.at + 1); this.input.value = this.history[this.at] || ''; }
  }
}
