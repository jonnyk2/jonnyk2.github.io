// Alpha sign-up: the "can your machine run it?" check and the form. Sign-ups go to the game's Supabase project
// (table alpha_signups, insert-only for the public: supabase/2026-11-11-alpha-signups.sql).
// Same project and publishable key as the game (js/config.js); the site is published on its own, so it can't import it.
export const BACKEND = { url: 'https://sorhxiqttktcctnevurx.supabase.co', key: 'sb_publishable_zvhE4ggPOH_809w1eWxsfQ_1Dm1KvBh' };
const BABYLON = 'https://cdn.jsdelivr.net/npm/babylonjs@9.35.0/babylon.js'; // the build the game vendors
const RUN_S = 10, WARM_S = 1;
const OPENS = Date.parse('2026-11-18T00:00:00Z'); // sign-ups open with the alpha announcement; the table goes live then
const CLOSES = Date.parse('2026-12-11T23:59:59Z'); // the page says "23:59 UTC"; the owner also revokes the insert grant then
const box = document.querySelector('#alpha'), q = s => box.querySelector(s);
let machine = null; // the check's result, sent with the sign-up

// ---------- what the browser says about itself (also sent when the check isn't run) ----------
export function ident() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other';
  const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? (navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS') : /CrOS/.test(ua) ? 'ChromeOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : 'other';
  const gl = document.createElement('canvas').getContext('webgl2'), dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
  return {
    webgl2: !!gl, renderer: gl ? String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)).slice(0, 160) : null,
    vendor: gl ? String(gl.getParameter(dbg ? dbg.UNMASKED_VENDOR_WEBGL : gl.VENDOR)).slice(0, 80) : null,
    browser, os, ua: ua.slice(0, 300), screen: `${screen.width}x${screen.height}@${devicePixelRatio}`,
    cores: navigator.hardwareConcurrency || null, memGB: navigator.deviceMemory || null,
  };
}
// thresholds: the game targets 30 fps in a crowded fight on a weak laptop
export function verdict(m) {
  if (!m.webgl2) return 'wont';
  if (m.fpsAvg == null) return null;
  if (m.fpsAvg >= 45 && m.fpsLow >= 28) return 'well';
  if (m.fpsAvg >= 20) return 'struggle';
  return 'wont';
}
const SAY = {
  well: ['Runs well', 'Your machine handled the test scene comfortably. You should be in good shape for the alpha.'],
  struggle: ['May struggle', 'The test scene ran, but not smoothly. The game may stutter in big fights. Sign up anyway: we need to know which machines are too slow.'],
  wont: ["Won't run yet", "Your browser couldn't run the test scene smoothly (or has no WebGL 2). Sign up anyway: we're working to make the game run on more machines, and your result helps."],
};

// ---------- the 10-second scene: stylized 3D figures on the move, like the game's ----------
function loadBabylon() {
  return window.BABYLON ? Promise.resolve() : new Promise((ok, fail) => { const s = document.createElement('script'); s.src = BABYLON; s.onload = ok; s.onerror = () => fail(new Error('could not load the 3D library')); document.head.append(s); });
}
async function runCheck() {
  const out = q('.mc-out'), cv = q('.mc-canvas');
  q('.mc').hidden = false; q('.mc-verdict').hidden = true; out.textContent = 'Loading the test scene…';
  const m = ident();
  if (m.webgl2) {
    try {
      await loadBabylon();
      cv.hidden = false;
      Object.assign(m, await scene(cv, t => { out.textContent = `Running… ${Math.ceil(t)} s`; }));
    } catch (e) { m.error = String(e.message || e).slice(0, 200); }
    cv.hidden = true;
  }
  m.verdict = verdict(m) || 'wont';
  machine = m; show(m);
  try { localStorage.setItem('ember.machine', JSON.stringify(m)); } catch (_) { /* private mode: the survey just won't have it */ }
  return m;
}
function scene(cv, tick) {
  const B = window.BABYLON, engine = new B.Engine(cv, true, { antialias: true, powerPreference: 'high-performance' }), sc = new B.Scene(engine);
  sc.clearColor = new B.Color4(0.04, 0.03, 0.03, 1);
  const cam = new B.ArcRotateCamera('c', -Math.PI / 4, 0.95, 34, B.Vector3.Zero(), sc);
  new B.HemisphericLight('h', new B.Vector3(0, 1, 0), sc).intensity = 0.35;
  const sun = new B.DirectionalLight('s', new B.Vector3(-1, -2, -1), sc); sun.position = new B.Vector3(20, 40, 20); sun.intensity = 1.1;
  const shadows = new B.ShadowGenerator(1024, sun); shadows.usePercentageCloserFiltering = true;
  const ground = B.MeshBuilder.CreateGround('g', { width: 60, height: 60 }, sc); ground.receiveShadows = true;
  const gm = new B.StandardMaterial('gm', sc); gm.diffuseColor = new B.Color3(0.22, 0.2, 0.17); gm.specularColor = B.Color3.Black(); ground.material = gm;
  // flat, unshiny colours and a dark outline on every part: close to the game's stylized look, and the outlines double the draw work
  const toon = col => { const mt = new B.StandardMaterial('t', sc); mt.diffuseColor = col; mt.specularColor = B.Color3.Black(); mt.emissiveColor = col.scale(0.15); return mt; };
  const cols = [new B.Color3(0.8, 0.3, 0.2), new B.Color3(0.3, 0.45, 0.8), new B.Color3(0.85, 0.7, 0.35), new B.Color3(0.4, 0.7, 0.4), new B.Color3(0.6, 0.4, 0.75)].map(toon);
  const figs = [];
  for (let i = 0; i < 48; i++) {
    const root = new B.TransformNode('f' + i, sc), mt = cols[i % cols.length];
    const body = B.MeshBuilder.CreateCapsule('b', { height: 1.8, radius: 0.42, tessellation: 16 }, sc); body.position.y = 0.9;
    const head = B.MeshBuilder.CreateSphere('h', { diameter: 0.7, segments: 12 }, sc); head.position.y = 2.05;
    const arm = B.MeshBuilder.CreateBox('a', { width: 0.18, height: 0.18, depth: 1.4 }, sc); arm.position.set(0.5, 1.2, 0.5);
    for (const p of [body, head, arm]) { p.parent = root; p.material = mt; p.renderOutline = true; p.outlineWidth = 0.04; p.outlineColor = B.Color3.Black(); shadows.addShadowCaster(p); }
    figs.push({ root, arm, r: 4 + (i % 8) * 2.4, a: i * 2.4, v: (0.5 + (i % 5) * 0.15) * (i % 2 ? 1 : -1) });
  }
  return new Promise(done => {
    const frames = []; let t0 = performance.now(), last = t0;
    engine.runRenderLoop(() => {
      const now = performance.now(), dt = (now - last) / 1000, t = (now - t0) / 1000; last = now;
      for (const f of figs) { f.a += f.v * dt * 0.4; f.root.position.set(Math.cos(f.a) * f.r, Math.abs(Math.sin(t * 9 + f.r)) * 0.25, Math.sin(f.a) * f.r); f.root.rotation.y = -f.a + (f.v > 0 ? 0 : Math.PI); f.arm.rotation.x = Math.sin(t * 12 + f.r) * 1.2; }
      cam.alpha += dt * 0.15;
      sc.render();
      if (t > WARM_S) frames.push(dt);
      tick(RUN_S + WARM_S - t);
      if (t >= RUN_S + WARM_S) {
        engine.stopRenderLoop(); const info = engine.getGlInfo(); engine.dispose();
        const sorted = frames.slice().sort((a, b) => b - a), worst = sorted.slice(0, Math.max(1, Math.round(frames.length * 0.05)));
        const avg = frames.length / frames.reduce((s, x) => s + x, 0), low = worst.length / worst.reduce((s, x) => s + x, 0);
        done({ fpsAvg: Math.round(avg * 10) / 10, fpsLow: Math.round(low * 10) / 10, frames: frames.length, glVersion: String(info.version).slice(0, 80) });
      }
    });
  });
}
function show(m) {
  const [title, text] = SAY[m.verdict];
  q('.mc-out').innerHTML = '';
  const v = q('.mc-verdict'); v.hidden = false; v.className = 'mc-verdict ' + m.verdict;
  v.querySelector('b').textContent = title; v.querySelector('p').textContent = text;
  v.querySelector('small').textContent = [m.renderer, m.fpsAvg != null ? `${m.fpsAvg} fps average, ${m.fpsLow} at its slowest` : null, `${m.browser} on ${m.os}`].filter(Boolean).join(' · ');
}

// ---------- the form: one contact field, consent, and the machine test run on the way ----------
export function clean(f) { // the form's values → a row the table accepts, or an error message
  const c = f.contact.trim(), isMail = c.includes('@') && !c.startsWith('@');
  const email = isMail ? c : null, discord = isMail ? null : c.replace(/^@/, '').toLowerCase() || null;
  if (!email && !discord) return { error: 'Give us an email or a Discord name, so we can send your invite.' };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "That email doesn't look right." };
  if (discord && !/^[a-z0-9_.]{2,32}(#[0-9]{4})?$/.test(discord)) return { error: "That doesn't look like an email or a Discord name (2 to 32 letters, numbers, dots or underscores)." };
  if (!f.consent) return { error: 'Please tick the box to agree, so we may keep your details for the alpha.' };
  return { row: { email, discord, plays: f.plays, about: f.about.trim().slice(0, 300) || null, consent: true, notify_launch: !!f.notify } };
}
let skipTest = false;
async function submit(e) {
  e.preventDefault();
  const form = e.target, msg = q('.su-msg'), btn = form.querySelector('button[type=submit]');
  if (form.website.value) return; // the hidden field only bots fill in
  const r = clean({ contact: form.contact.value, about: form.about.value, consent: form.consent.checked, notify: form.notify.checked, plays: [...form.querySelectorAll('[name=plays]:checked')].map(x => x.value) });
  if (r.error) { msg.className = 'su-msg err'; msg.textContent = r.error; skipTest = false; return; }
  btn.disabled = true; msg.className = 'su-msg';
  if (!machine && !skipTest) { msg.textContent = 'First, 10 seconds to see how your machine handles the game…'; await runCheck(); }
  r.row.machine = machine || ident();
  msg.textContent = 'Sending…';
  let res;
  try { res = await fetch(BACKEND.url + '/rest/v1/alpha_signups', { method: 'POST', headers: { apikey: BACKEND.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(r.row) }); }
  catch (_) { res = null; }
  btn.disabled = false; skipTest = false;
  if (res && (res.ok || res.status === 409)) { // 409: that email or name is already signed up
    form.hidden = true; q('.su-done').hidden = false;
    q('.su-done p').textContent = res.ok ? "You're on the list. We'll be in touch by 16 December, whether you're in the first wave or a later one." : "You're already on the list. We'll be in touch by 16 December.";
    return;
  }
  const text = res ? await res.text().catch(() => '') : '';
  msg.className = 'su-msg err';
  msg.textContent = /rate limited/.test(text) ? 'Too many sign-ups from your connection today. Try again tomorrow, or join the Discord.' : "Something went wrong and your sign-up wasn't saved. Please try again in a minute.";
}

if (box) {
  const form = q('.su-form'), b = form.querySelector('button[type=submit]'), now = Date.now();
  form.addEventListener('submit', submit);
  q('.mc-skip').addEventListener('click', () => { skipTest = true; form.requestSubmit(); });
  q('.mc-only').addEventListener('click', e => { e.target.disabled = true; runCheck().finally(() => { e.target.disabled = false; e.target.textContent = 'Test again'; }); });
  if (now < OPENS || now > CLOSES) { // outside the sign-up window the form shows but can't be sent; the test still runs
    b.disabled = true; q('.mc-skip').hidden = true;
    b.textContent = now < OPENS ? 'Sign-ups open 18 November' : "Sign-ups closed: you'll hear from us on Discord";
    if (now < OPENS) q('.su-msg').textContent = 'Come back on 18 November to sign up. You can test your machine now.';
  }
}
