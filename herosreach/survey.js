// The alpha survey: one row into alpha_survey (insert-only for the public: supabase/2026-11-11-alpha-survey.sql).
// The game's Menu links here as survey.html?build=<version>&wave=<n>.
import { BACKEND, ident } from './alpha.js';

const form = document.querySelector('.sv-form'), msg = document.querySelector('.su-msg');
const qs = new URLSearchParams(location.search);
const build = /^[A-Za-z0-9._+-]{1,40}$/.test(qs.get('build') || '') ? qs.get('build') : null;
const wave = /^[0-9]$/.test(qs.get('wave') || '') ? +qs.get('wave') : null;

// the classes, from the game's own data (data.js)
form.cls.innerHTML = '<option value="">Choose…</option>' + window.EMBER.classes.map(c => `<option>${c.name.replace(/[<&]/g, '')}</option>`).join('') + '<option>Not sure</option>';

// the website's machine check, if they ran it in this browser; otherwise what the browser reports
function machine() {
  try { const m = JSON.parse(localStorage.getItem('ember.machine')); if (m && typeof m === 'object') return m; } catch (_) { /* none */ }
  return ident();
}

export function clean(f) { // the form's values → a row the table accepts, or an error message
  if (!f.cls) return { error: 'Which class did you play?' };
  if (!f.played) return { error: 'Roughly how long did you play?' };
  if (!f.fights) return { error: 'How did the fights feel? Pick 1 to 5.' };
  if (!f.ran) return { error: 'Did it run well?' };
  if (!f.again) return { error: 'Would you play again tomorrow?' };
  if (!f.consent) return { error: 'Please tick the box to agree, so we may keep your answers.' };
  const t = (s, n) => s.trim().slice(0, n) || null;
  return { row: { build: f.build, wave: f.wave, cls: f.cls.slice(0, 40), played: f.played, stopped: t(f.stopped, 1000), liked: t(f.liked, 1000),
    fights: +f.fights, fights_note: t(f.fights_note, 300), ran: f.ran, again: f.again, change: t(f.change, 1000), contact: t(f.contact, 254), consent: true } };
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (form.website.value) return; // the hidden field only bots fill in
  const v = n => (form.querySelector(`[name=${n}]:checked`) || {}).value || '';
  const r = clean({ build, wave, cls: form.cls.value, played: form.played.value, stopped: form.stopped.value, liked: form.liked.value, fights: v('fights'),
    fights_note: form.fights_note.value, ran: v('ran'), again: v('again'), change: form.change.value, contact: form.contact.value, consent: form.consent.checked });
  if (r.error) { msg.className = 'su-msg err'; msg.textContent = r.error; return; }
  r.row.machine = machine();
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true; msg.className = 'su-msg'; msg.textContent = 'Sending…';
  let res;
  try { res = await fetch(BACKEND.url + '/rest/v1/alpha_survey', { method: 'POST', headers: { apikey: BACKEND.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(r.row) }); }
  catch (_) { res = null; }
  btn.disabled = false;
  if (res && res.ok) { form.hidden = true; document.querySelector('.su-done').hidden = false; scrollTo(0, 0); return; }
  const text = res ? await res.text().catch(() => '') : '';
  msg.className = 'su-msg err';
  msg.textContent = /rate limited/.test(text) ? 'Too many answers from your connection today. Try again tomorrow.' : "Something went wrong and your answers weren't saved. Please try again in a minute.";
});
