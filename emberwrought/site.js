// Fills the page from data.js (generated from the game by gen.mjs) and runs the descent: the depth gauge and the darkening.
document.documentElement.classList.add('js');
const E = window.EMBER, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROLES = { tank: 'Tank', melee: 'Melee', ranged: 'Ranged', caster: 'Caster', summoner: 'Summoner', support: 'Support' };

// the logo forges in letter by letter, like the game's title screen
{ const h = $('.hero h1'); h.setAttribute('aria-label', h.textContent); h.innerHTML = [...h.textContent].map((c, i) => `<span aria-hidden="true" style="animation-delay:${0.2 + i * 0.06}s">${c}</span>`).join(''); }
$$('[data-n]').forEach(el => el.textContent = E[el.dataset.n].length);

// the reduced-motion visitor gets the poster, not the loop
const vid = $('.hero-video'); if (vid && still) { vid.removeAttribute('autoplay'); vid.pause(); }

// every dungeon boss, set as type
$('.bosses ul').innerHTML = [...E.dungeons, ...E.regions.flatMap(r => r.dungeons)].map(d => `<li><b>${esc(d.boss)}</b> <span>${esc(d.name)}</span></li>`).join('');

// hero roster: a name list and one big card
const names = $('.roster .names'), card = $('.hero-card');
names.innerHTML = E.classes.map((c, i) => `<button type="button" role="tab" data-i="${i}" style="--res:${esc(c.resCol)}">${esc(c.name)}</button>`).join('');
function show(i) {
  const c = E.classes[i];
  $$('.names button').forEach(b => b.setAttribute('aria-selected', b.dataset.i == i));
  card.style.setProperty('--res', c.resCol);
  card.innerHTML = `<p class="role">${esc(c.role.split(' ').map(r => ROLES[r] || r).join(' · '))}</p><h3>${esc(c.name)}</h3><p class="title">${esc(c.title)}</p>
    <p class="desc">${esc(c.desc)}</p>
    <dl><div><dt>Power</dt><dd class="res">${esc(c.res)}</dd></div><div><dt>Weapons</dt><dd>${c.weapons.map(esc).join(' · ')}</dd></div></dl>`;
}
names.addEventListener('click', e => { const i = e.target.dataset.i; if (i != null) { show(+i); e.target.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } });
names.addEventListener('keydown', e => { // arrow keys move along the tabs
  const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
  e.preventDefault(); const n = E.classes.length, i = (+(document.activeElement.dataset.i ?? 0) + d + n) % n;
  names.children[i].focus(); show(i);
});
show(0);

// the road: the Hollowmark (its zones and dungeons) then each region in order
const lift = ([r, g, b]) => { const k = Math.max(0, 150 - (r + g + b) / 3) / 255; return `rgb(${[r, g, b].map(v => Math.round(v + (255 - v) * k)).join(',')})`; };
const hm = { id: 'hollowmark', name: 'The Hollowmark', min: 1, max: E.zones.reduce((m, z) => Math.max(m, z.max), 1), col: 'var(--ember)',
  sub: E.zones.map(z => z.name).join(' · '), dungeons: E.dungeons, camp: 'Gravenhold' };
$('.road').innerHTML = [hm, ...E.regions.map(r => ({ ...r, col: lift(r.col), camp: r.camp }))].map(r => `
  <li class="stop" style="--c:${r.col}">
    <span class="lv">${r.min}<i>–</i>${r.max}</span>
    <div><img class="thumb" src="img/land_${r.id}.jpg" alt="${esc(r.name)}" loading="lazy" onerror="this.remove()"><h3>${esc(r.name)}</h3><p class="dim">${r.sub ? esc(r.sub) + ' · ' : ''}${r === hm ? 'town' : 'camp'}: ${esc(r.camp)}</p>
    <p class="bosses-inline">${r.dungeons.map(d => `<span><b>${esc(d.boss)}</b> in ${esc(d.name)}</span>`).join('')}</p></div>
  </li>`).join('');

// the descent: the gauge shows the level of the section in view, and the page sinks into its section's tint
const gauge = $('.gauge'), depths = $$('.depth');
depths.forEach((s, i) => s.style.setProperty('--next', depths[i + 1] ? `rgb(${depths[i + 1].style.getPropertyValue('--tint')})` : '#050405')); // each depth fades into the next
const sink = () => {
  const mid = innerHeight * 0.5; let cur = null;
  for (const s of depths) { const r = s.getBoundingClientRect(); if (r.top < mid) cur = s; }
  const doc = document.documentElement, k = Math.min(1, scrollY / Math.max(1, doc.scrollHeight - innerHeight));
  gauge.style.setProperty('--k', k.toFixed(3));
  gauge.classList.toggle('on', !!cur && scrollY > innerHeight * 0.6);
  if (cur) { gauge.querySelector('.gauge-lv').textContent = cur.dataset.lv; gauge.querySelector('.gauge-name').textContent = cur.dataset.name; }
  $('nav.top').classList.toggle('solid', scrollY > 40);
};
addEventListener('scroll', sink, { passive: true }); addEventListener('resize', sink); sink();

// "Sign up" links anywhere go back to the form and put the cursor in it
$$('[data-signup]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); setTimeout(() => $('[name=contact]').focus({ preventScroll: true }), still ? 0 : 500); }));
