/* =====================================================================
   TIKAL MUEBLES · main.js · Dirección «Terrazas»
   Sin dependencias. Con ?ss (capturas) o movimiento reducido: todo
   visible y quieto. Sin JS, la página se lee entera.
   ===================================================================== */
(() => {
  const html = document.documentElement;
  const ss = html.classList.contains('ss');
  const quieto = ss || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hero = $('[data-hero]');

  /* ---------- 1 · Entrada: el hero se construye por cuerpos cuando la fuente y la foto están listas ---------- */
  if (html.classList.contains('pre')) {
    const foto = hero.querySelector('img[data-foto]');
    const listo = Promise.all([document.fonts.ready, foto.decode ? foto.decode().catch(() => {}) : null]);
    Promise.race([listo, new Promise(r => setTimeout(r, 1200))]).then(() => requestAnimationFrame(() => {
      if (!html.classList.contains('pre')) return;
      html.classList.remove('pre'); html.classList.add('entra');
    }));
  }

  /* ---------- 2 · Revelar al verse (una vez) y pausar bucles fuera de pantalla ---------- */
  const revelables = $$('.revelar, .montaje, .trabajos');
  if (ss || !('IntersectionObserver' in window)) revelables.forEach(el => el.classList.add('visto'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    revelables.forEach(el => io.observe(el));
  }
  const conBucle = $$('.filosofia, .trabajos, .sofas, .nosotros, .contacto');
  const ioFuera = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('fuera', !e.isIntersecting)));
  conBucle.forEach(el => ioFuera.observe(el));
  new IntersectionObserver(([e]) => html.classList.toggle('hero-fuera', !e.isIntersecting)).observe(hero);

  /* ---------- 3 · Fijos: aparecen cuando los botones del hero quedan atrás; el flotante se aparta en contacto ---------- */
  const acciones = hero.querySelector('.acciones');
  new IntersectionObserver(([e]) => html.classList.toggle('ver-fijos', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(acciones);
  new IntersectionObserver(([e]) => html.classList.toggle('en-contacto', e.isIntersecting), { threshold: .2 }).observe($('#contacto'));

  /* ---------- 4 · Profundidad por cuerpos en el hero; la vitrina se gira hacia el cursor ---------- */
  if (fino && !quieto) {
    const capas = $$('[data-prof]', hero).map(el => ({ el, p: parseFloat(el.dataset.prof) }));
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const mover = () => {
      x += (tx - x) * .09; y += (ty - y) * .09;
      for (const { el, p } of capas) {
        const giro = p === 1 ? ` rotateY(${(x * 4.5).toFixed(2)}deg) rotateX(${(-y * 3).toFixed(2)}deg)` : '';
        el.style.transform = `translate3d(${(x * 24 * p).toFixed(2)}px, ${(y * 12 * p).toFixed(2)}px, 0)${giro}`;
      }
      raf = (Math.abs(tx - x) > .0015 || Math.abs(ty - y) > .0015) ? requestAnimationFrame(mover) : 0;
    };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
      if (!raf) raf = requestAnimationFrame(mover);
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(mover); });

    const vitrina = $('.vitrina');
    const cara = $('.vitrina-cara');
    vitrina.addEventListener('pointermove', e => {
      const r = vitrina.getBoundingClientRect();
      cara.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - .5) * 12).toFixed(2)}deg`);
      cara.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - .5) * 9).toFixed(2)}deg`);
    });
    vitrina.addEventListener('pointerleave', () => { cara.style.setProperty('--ry', '0deg'); cara.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- 5 · Etiquetas de su foto ↔ puertas del zócalo (y un recorrido lento cuando nadie toca) ---------- */
  const pins = $$('.pin', hero), puertas = $$('.puerta', hero);
  const orden = ['librerias', 'muebles', 'sofas', 'mesas'];
  let manual = false, paso = -1, reloj = 0;
  const activar = cat => {
    pins.forEach(p => p.classList.toggle('activo', p.dataset.cat === cat));
    puertas.forEach(p => p.classList.toggle('activo', p.dataset.cat === cat));
  };
  [...pins, ...puertas].forEach(el => {
    el.addEventListener('pointerenter', () => { manual = true; activar(el.dataset.cat); });
    el.addEventListener('pointerleave', () => { manual = false; activar(null); });
    el.addEventListener('focus', () => { manual = true; activar(el.dataset.cat); });
    el.addEventListener('blur', () => { manual = false; activar(null); });
  });
  if (!quieto) {
    const recorrer = () => {
      if (!manual && !html.classList.contains('hero-fuera') && html.classList.contains('entra')) { paso = (paso + 1) % (orden.length + 1); activar(orden[paso] || null); }
      reloj = setTimeout(recorrer, paso === orden.length - 1 ? 4200 : 2600);
    };
    reloj = setTimeout(recorrer, 3400);
  }

  /* ---------- 6 · Su interruptor Claro / Oscuro ---------- */
  const temas = $$('.tema');
  const pintarTema = () => { const osc = html.dataset.theme === 'dark'; temas.forEach(b => b.setAttribute('aria-pressed', String(osc))); };
  temas.forEach(b => b.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tikal-tema', html.dataset.theme); } catch (e) {}
    pintarTema();
  }));
  pintarTema();

  /* ---------- 7 · Menú móvil y panel de sofás ---------- */
  const btnMenu = $('.cab-menu-btn');
  const menu = $('#menu-movil');
  const cerrarMenu = () => { html.classList.remove('menu-abierto'); btnMenu.setAttribute('aria-expanded', 'false'); btnMenu.querySelector('span').textContent = 'Menú'; };
  btnMenu.addEventListener('click', () => {
    const abrir = !html.classList.contains('menu-abierto');
    html.classList.toggle('menu-abierto', abrir);
    btnMenu.setAttribute('aria-expanded', String(abrir));
    btnMenu.querySelector('span').textContent = abrir ? 'Cerrar' : 'Menú';
    if (abrir) setTimeout(() => menu.querySelector('a').focus({ preventScroll: true }), 60);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) cerrarMenu(); });
  const sofasMenu = $('.m-sofas');
  const btnSofas = sofasMenu.querySelector('.m-abrir');
  btnSofas.addEventListener('click', () => {
    const abrir = !sofasMenu.classList.contains('abierto');
    sofasMenu.classList.toggle('abierto', abrir); btnSofas.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('click', e => { if (!sofasMenu.contains(e.target)) { sofasMenu.classList.remove('abierto'); btnSofas.setAttribute('aria-expanded', 'false'); } });

  /* ---------- 8 · Visor de fotos ---------- */
  const visor = $('#visor');
  const vFoto = $('.v-foto', visor), vTitulo = $('.v-titulo', visor), vCuenta = $('.v-cuenta', visor);
  const trabajos = $$('.est-pista > li:not([aria-hidden]) img', $('.trabajos')).map(im => ({ src: im.dataset.grande, t: im.alt + (im.dataset.extra ? '. ' + im.dataset.extra : '') }));
  const img = (n, w) => `assets/img/${n}-${w}.webp`;
  const LIBRERIAS = [
    { src: img('cat-librerias', 1530), t: 'Librería a medida' },
    ...[0, 4, 5, 6, 7, 9].map(i => trabajos[i]),
    { src: img('libreria-cabecero', 800), t: 'Librería como cabecero en laca de color blanco' },
    { src: img('libreria-lacada-cubreradiador', 1600), t: 'Librería lacada con zona de almacenamiento y cubreradiador' },
    { src: img('libreria-led-cubreradiador', 1200), t: 'Librería con luces led y cubreradiador' },
    { src: img('libreria-laca-roble', 1600), t: 'Librería a medida en laca y madera de roble' },
    { src: img('libreria-a-medida', 1600), t: 'Librería a medida' },
    { src: img('libreria-laca-roble-2', 1600), t: 'Librería fabricada a medida en laca y roble' },
    { src: img('libreria-roble-palilleria', 807), t: 'Librería en roble con almacenamiento y puertas de palillería' },
    { src: img('libreria-expositor', 1024), t: 'Librería en madera con expositor central y zonas de almacenaje en las partes superior e inferior' },
    { src: img('libreria-cubos', 1600), t: 'Librería de cubos en madera' },
    { src: img('expo-libreria-azul', 1287), t: 'Librería lacada en azul con estantes regulares con unas medidas de 260 × 40 × 220 y luces led' },
  ];
  const MUEBLES = [
    { src: img('cat-muebles-medida', 1600), t: 'Mueble lacado en blanco con puertas de cristal y base lacada para altavoces' },
    ...[1, 2, 3, 8].map(i => trabajos[i]),
    { src: img('armarios-laca-cristal', 1600), t: 'Armarios fabricados en laca y madera con puertas de cristal' },
    { src: img('mueble-tv-panel', 1024), t: 'Mueble para TV y panel para TV en madera' },
  ];
  const TELAS = $$('.muestrario .carta img').map(im => ({ src: im.dataset.grande, t: im.alt }));
  const vistas = new Set();
  const TODOS = [...trabajos, LIBRERIAS[0], ...LIBRERIAS.slice(7), MUEBLES[0], ...MUEBLES.slice(5)].filter(f => !vistas.has(f.src) && vistas.add(f.src));
  const SERIES = { trabajos, librerias: LIBRERIAS, muebles: MUEBLES, telas: TELAS, todos: TODOS };
  let lista = [], idx = 0, origen = null;
  const pintar = () => {
    const f = lista[idx];
    vFoto.src = f.src; vFoto.alt = f.t; vTitulo.textContent = f.t; vCuenta.textContent = `${idx + 1} / ${lista.length}`;
    vFoto.style.animation = 'none'; void vFoto.offsetWidth; vFoto.style.animation = '';
  };
  const abrirVisor = (serie, i = 0, desde = null) => {
    lista = SERIES[serie] || []; if (!lista.length) return;
    idx = i; origen = desde; pintar();
    if (typeof visor.showModal === 'function') visor.showModal(); else visor.setAttribute('open', '');
  };
  const mover = d => { idx = (idx + d + lista.length) % lista.length; pintar(); };
  $('.v-ant', visor).addEventListener('click', () => mover(-1));
  $('.v-sig', visor).addEventListener('click', () => mover(1));
  $('.v-cerrar', visor).addEventListener('click', () => visor.close());
  visor.addEventListener('close', () => origen && origen.focus({ preventScroll: true }));
  visor.addEventListener('click', e => { if (e.target === visor || e.target.classList.contains('v-escena')) visor.close(); });
  visor.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') mover(-1); if (e.key === 'ArrowRight') mover(1); });
  let x0 = null;
  visor.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1); x0 = null; });
  $$('[data-abrir-visor]').forEach(b => b.addEventListener('click', () => abrirVisor(b.dataset.abrirVisor, 0, b)));
  document.addEventListener('click', e => {
    const h = e.target.closest('.hueco'); if (h) { abrirVisor('trabajos', +h.dataset.i, h); return; }
    const c = e.target.closest('.carta'); if (c) abrirVisor('telas', +c.dataset.i, c);
  });

  /* ---------- 9 · La estantería se desliza sola, despacio; se para con el cursor ---------- */
  const est = $('.estanteria'), pista = $('.est-pista');
  const huecos = $$('li', pista);
  const ancho = () => huecos.reduce((s, li) => s + li.getBoundingClientRect().width, 0) + parseFloat(getComputedStyle(pista).columnGap || 0) * huecos.length;
  if (fino && !quieto) {
    html.classList.add('deriva');
    huecos.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('button').forEach(b => b.tabIndex = -1); pista.append(c); });
    let pos = 0, vel = 0, objetivo = 38, impulso = 0, ult = performance.now(), periodo = ancho();
    addEventListener('resize', () => { periodo = ancho(); });
    const sec = $('.trabajos');
    est.addEventListener('pointerenter', () => { objetivo = 0; });
    est.addEventListener('pointerleave', () => { objetivo = 38; });
    est.addEventListener('focusin', () => { objetivo = 0; });
    est.addEventListener('focusout', () => { objetivo = 38; });
    const bucle = t => {
      const dt = Math.min(64, t - ult) / 1000; ult = t;
      if (!sec.classList.contains('fuera')) {
        vel += (objetivo - vel) * Math.min(1, dt * 4);
        const empuje = impulso * Math.min(1, dt * 6); impulso -= empuje;
        pos = (pos + vel * dt + empuje) % periodo; if (pos < 0) pos += periodo;
        pista.style.transform = `translate3d(${-pos.toFixed(1)}px,0,0)`;
      }
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
    $$('[data-mover]').forEach(b => b.addEventListener('click', () => { impulso += +b.dataset.mover * huecos[0].getBoundingClientRect().width * 1.1; }));
  } else {
    $$('[data-mover]').forEach(b => b.addEventListener('click', () => est.scrollBy({ left: +b.dataset.mover * est.clientWidth * .7, behavior: quieto ? 'auto' : 'smooth' })));
  }

  /* ---------- 10 · Fotos del catálogo: su propia foto, difuminada, rellena el hueco (sin recortar) ---------- */
  $$('.cat-foto img, .ficha-foto img').forEach(im => {
    const poner = () => im.closest('.cat-foto, .ficha-foto').style.setProperty('--fondo-foto', `url("${im.currentSrc || im.src}")`);
    im.complete ? poner() : im.addEventListener('load', poner, { once: true });
  });

  /* ---------- 11 · Pestañas accesibles (sofás, telas, mesas) ---------- */
  function pestanas(lista, alCambiar) {
    const tabs = $$('[role="tab"]', lista);
    const elegir = (tab, foco) => {
      tabs.forEach(t => { const si = t === tab; t.setAttribute('aria-selected', String(si)); t.tabIndex = si ? 0 : -1; });
      alCambiar(tab);
      if (foco) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => elegir(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); elegir(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); elegir(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); elegir(tabs[tabs.length - 1], true); }
      });
    });
    return elegir;
  }
  const elegirSofa = pestanas($('.modelos'), tab => {
    $$('.ficha').forEach(f => { const si = f.id === tab.getAttribute('aria-controls'); f.classList.toggle('activa', si); if (!si) f.classList.remove('girada'); });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: quieto ? 'auto' : 'smooth' });
  });
  $$('.medidas').forEach(ul => $$('li', ul).forEach((li, i) => li.style.setProperty('--k', i)));
  $$('[data-girar]').forEach(b => b.addEventListener('click', () => {
    const f = b.closest('.ficha'); const girar = !f.classList.contains('girada');
    f.classList.toggle('girada', girar);
    setTimeout(() => (girar ? f.querySelector('.ficha-dorso [data-girar]') : f.querySelector('.ficha-cara [data-girar]')).focus({ preventScroll: true }), quieto ? 0 : 450);
  }));
  $$('.panel a[data-sofa]').forEach(a => a.addEventListener('click', () => elegirSofa($('#tab-' + a.dataset.sofa))));

  $$('.cartas').forEach(ul => $$('li', ul).forEach((li, i) => li.style.setProperty('--k', i)));
  pestanas($('.series'), tab => {
    $$('.cartas').forEach(ul => {
      const si = ul.id === tab.getAttribute('aria-controls');
      ul.classList.toggle('activa', si);
      if (si && !quieto) { ul.classList.remove('entra-serie'); void ul.offsetWidth; ul.classList.add('entra-serie'); }
    });
  });

  const mesas = $('#mesas'), conmutador = $('.conmutador');
  pestanas(conmutador, tab => {
    const ext = tab.id === 'm-ext';
    mesas.classList.toggle('ext', ext); conmutador.classList.toggle('ext', ext);
    $$('.tipo', mesas).forEach(p => p.classList.toggle('activa', p.id === tab.getAttribute('aria-controls')));
    $$('.mesa-foto', mesas).forEach(f => { const si = f.dataset.tipo === (ext ? 'extensibles' : 'fijas'); f.classList.toggle('activa', si); f.toggleAttribute('aria-hidden', !si); });
  });

  $$('.mesa-foto:not(.activa)', mesas).forEach(f => f.setAttribute('aria-hidden', 'true'));

  /* ---------- 12 · Formulario: «Me interesa» deja el modelo puesto; validación con sus textos ---------- */
  const form = $('#presupuesto');
  const etiqueta = $('[data-interes-etiqueta]', form);
  const ponerInteres = valor => {
    if (!valor) return;
    etiqueta.hidden = false; etiqueta.querySelector('span').textContent = valor;
    const tipo = /^Sofá/.test(valor) ? 'Sofá' : /^Mesa/.test(valor) ? 'Mesa' : null;
    if (tipo) { const r = form.querySelector(`input[name="tipo"][value="${tipo}"]`); if (r) r.checked = true; }
    if (!quieto) { form.classList.remove('marcado'); void form.offsetWidth; form.classList.add('marcado'); }
  };
  $$('[data-interes]').forEach(a => a.addEventListener('click', () => ponerInteres(a.dataset.interes)));
  etiqueta.querySelector('button').addEventListener('click', () => { etiqueta.hidden = true; etiqueta.querySelector('span').textContent = ''; });
  const TEXTOS = { vacio: 'Rellena este campo', correo: 'Por favor, introduce una dirección de correo electrónico válida.', acepto: 'Tienes que aprobar los términos para continuar' };
  const marcarError = (campo, texto) => {
    const caja = campo.closest('.campo, .acepto');
    let p = caja.querySelector('.error');
    if (!texto) { campo.removeAttribute('aria-invalid'); if (p) p.remove(); return; }
    campo.setAttribute('aria-invalid', 'true');
    if (!p) { p = document.createElement('p'); p.className = 'error'; p.id = campo.id ? campo.id + '-error' : 'acepto-error'; caja.append(p); }
    p.textContent = texto; campo.setAttribute('aria-describedby', p.id);
  };
  const validar = campo => {
    if (campo.type === 'checkbox') return marcarError(campo, campo.checked ? '' : TEXTOS.acepto), campo.checked;
    const v = campo.value.trim();
    if (campo.required && !v) return marcarError(campo, TEXTOS.vacio), false;
    if (campo.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return marcarError(campo, TEXTOS.correo), false;
    marcarError(campo, ''); return true;
  };
  const requeridos = $$('[required]', form);
  requeridos.forEach(c => c.addEventListener(c.type === 'checkbox' ? 'change' : 'blur', () => validar(c)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const malos = requeridos.filter(c => !validar(c));
    if (malos.length) { malos[0].focus(); return; }
    form.classList.add('enviado');
    const g = $('.gracias', form); g.hidden = false; g.tabIndex = -1; g.focus();
  });

  /* ---------- 13 · Abierto o cerrado, con la hora de Madrid (?ahora=2026-10-07T18:30 para revisar) ---------- */
  const DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const m = location.search.match(/[?&]ahora=([\dT:-]+)/);
  let dia, min;
  if (m) { const d = new Date(m[1]); dia = d.getDay(); min = d.getHours() * 60 + d.getMinutes(); }
  else {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    dia = DIAS[p.weekday]; min = (+p.hour) * 60 + (+p.minute);
  }
  const abre = 11 * 60, cierra = 21 * 60, laborable = d => d >= 1 && d <= 6;
  let txt, abierto = false;
  if (laborable(dia) && min >= abre && min < cierra) { txt = 'Abierto ahora, hasta las 21:00'; abierto = true; }
  else if (laborable(dia) && min < abre) txt = 'Cerrado. Abre hoy a las 11:00';
  else if (dia === 6) txt = 'Cerrado. Abre el lunes a las 11:00';
  else txt = 'Cerrado. Abre mañana a las 11:00';
  const estado = $('[data-estado]');
  estado.classList.toggle('abierto', abierto);
  estado.querySelector('.estado-txt').textContent = txt;
  const hoy = $(`.horario tr[data-dia="${dia}"]`); if (hoy) hoy.classList.add('hoy');

  /* ---------- 14 · Mapa a demanda: Google no carga nada hasta pulsar ---------- */
  const mapa = $('[data-mapa]');
  $('[data-cargar-mapa]', mapa).addEventListener('click', () => {
    mapa.classList.add('cargado');
    mapa.innerHTML = '<iframe title="Mapa: Tikal Muebles, C. Oxford 4B, Las Rozas de Madrid" src="https://www.google.com/maps?q=40.5004809,-3.8882131&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  });

  /* ---------- 15 · Escape cierra menú, panel y fichas ---------- */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (html.classList.contains('menu-abierto')) { cerrarMenu(); btnMenu.focus(); }
    if (sofasMenu.classList.contains('abierto')) { sofasMenu.classList.remove('abierto'); btnSofas.setAttribute('aria-expanded', 'false'); btnSofas.focus(); }
  });
})();
