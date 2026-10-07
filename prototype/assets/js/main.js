/* =====================================================================
   TIKAL MUEBLES · main.js · v2 «De la idea al mueble»
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
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const reiniciar = (el, clase) => { el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); };
  const hero = $('[data-hero]');
  const foto = $('.hero-foto', hero);
  const real = $('.hf-real', hero);

  /* ---------- 1 · Entrada: el boceto se convierte en el mueble cuando fuente y fotos están listas ---------- */
  let terminada = false;
  const terminarEntrada = () => {
    if (terminada) return; terminada = true;
    setTimeout(() => { html.classList.remove('entra'); html.classList.add('listo'); hero.dispatchEvent(new Event('listo')); }, 3500);
  };
  if (html.classList.contains('pre') || html.classList.contains('entra')) {
    const dec = im => (im && im.decode ? im.decode().catch(() => {}) : null);
    const listo = Promise.all([document.fonts.ready, dec(real), dec($('.hf-boceto img', hero))]);
    Promise.race([listo, new Promise(r => setTimeout(r, 1500))]).then(() => requestAnimationFrame(() => {
      if (html.classList.contains('pre')) { html.classList.remove('pre'); html.classList.add('entra'); }
      terminarEntrada();
    }));
  } else { html.classList.add('listo'); terminada = true; }

  /* ---------- 2 · Revelar al verse (una vez) y pausar bucles fuera de pantalla ---------- */
  const revelables = $$('.revelar, .trabajos, .indice, .escenario, .muestra, .orbita, .nos-visual');
  if (ss || !('IntersectionObserver' in window)) revelables.forEach(el => el.classList.add('visto'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visto'); e.target.dispatchEvent(new Event('visto')); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    revelables.forEach(el => io.observe(el));
  }
  const ioFuera = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('fuera', !e.isIntersecting)));
  $$('.filosofia, .trabajos, .sofas, .telas, .mesas, .nosotros, .contacto, .pie').forEach(el => ioFuera.observe(el));
  new IntersectionObserver(([e]) => html.classList.toggle('hero-fuera', !e.isIntersecting)).observe(hero);

  /* ---------- 3 · Fijos: aparecen cuando los botones del hero quedan atrás; el flotante se aparta en contacto ---------- */
  new IntersectionObserver(([e]) => html.classList.toggle('ver-fijos', !e.isIntersecting && e.boundingClientRect.top < 0)).observe($('.acciones', hero));
  new IntersectionObserver(([e]) => html.classList.toggle('en-contacto', e.isIntersecting), { threshold: .2 }).observe($('#contacto'));

  /* ---------- 4 · Hero: la lupa enseña la idea bajo el cursor; «Ver la idea» la devuelve entera ---------- */
  const lupa = $('.lupa', hero), lupaIn = $('.lupa-in', lupa), lupaImg = $('img', lupaIn);
  const bocetoSrc = lupaImg.getAttribute('src');
  let W = 0, H = 0, D = 0;
  const medirFoto = () => { const r = foto.getBoundingClientRect(); W = r.width; H = r.height; D = lupa.offsetWidth; lupaIn.style.width = W + 'px'; lupaIn.style.height = H + 'px'; };
  if ('ResizeObserver' in window) new ResizeObserver(medirFoto).observe(foto); else addEventListener('resize', medirFoto);
  medirFoto();
  let tx = 0, ty = 0, lx = 0, ly = 0, rafL = 0, dentro = false, demo = 0;
  const pintarLupa = () => {
    const k = quieto ? 1 : .24;
    lx += (tx - lx) * k; ly += (ty - ly) * k;
    lupa.style.transform = `translate3d(${(lx - D / 2).toFixed(1)}px, ${(ly - D / 2).toFixed(1)}px, 0)`;
    lupaIn.style.transform = `translate3d(${(D / 2 - lx).toFixed(1)}px, ${(D / 2 - ly).toFixed(1)}px, 0)`;
    rafL = (Math.abs(tx - lx) > .3 || Math.abs(ty - ly) > .3) ? requestAnimationFrame(pintarLupa) : 0;
  };
  const moverLupa = (x, y, salto) => { tx = x; ty = y; if (salto) { lx = x; ly = y; } if (!rafL) rafL = requestAnimationFrame(pintarLupa); };
  if (fino && !ss) {
    foto.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      if (demo) { cancelAnimationFrame(demo); demo = 0; }
      const r = foto.getBoundingClientRect();
      const sobreMando = e.target.closest('.pin, .ver-idea');
      lupa.classList.toggle('on', !sobreMando);
      moverLupa(e.clientX - r.left, e.clientY - r.top, !dentro);
      dentro = true;
    });
    foto.addEventListener('pointerleave', () => { dentro = false; lupa.classList.remove('on'); });
    /* una vez construido, la lupa hace un recorrido corto para enseñarse (si nadie ha movido el cursor) */
    if (!quieto) hero.addEventListener('listo', () => setTimeout(() => {
      if (dentro || html.classList.contains('hero-fuera')) return;
      const ruta = [[.2, .34], [.36, .42], [.54, .4], [.7, .3], [.82, .36]];
      const t0 = performance.now(), dur = 3600;
      const paso = t => {
        const u = limitar((t - t0) / dur, 0, 1), s = u * (ruta.length - 1), i = Math.min(ruta.length - 2, Math.floor(s)), f = s - i;
        const e = f * f * (3 - 2 * f);
        moverLupa(W * (ruta[i][0] + (ruta[i + 1][0] - ruta[i][0]) * e), H * (ruta[i][1] + (ruta[i + 1][1] - ruta[i][1]) * e), u === 0);
        if (u === 0) lupa.classList.add('on');
        if (u < 1 && !dentro) demo = requestAnimationFrame(paso); else { demo = 0; if (!dentro) lupa.classList.remove('on'); }
      };
      demo = requestAnimationFrame(paso);
    }, 500));
  }
  const verIdea = $('.ver-idea', hero);
  verIdea.addEventListener('click', () => {
    const idea = !hero.classList.contains('idea');
    hero.classList.add('vuelta'); hero.classList.toggle('idea', idea);
    verIdea.setAttribute('aria-pressed', String(idea));
    $('span', verIdea).textContent = idea ? 'Ver el mueble' : 'Ver la idea';
    lupaImg.src = idea ? (real.currentSrc || real.src) : bocetoSrc;
  });

  /* ---------- 5 · Sus etiquetas: un recorrido lento por cada mueble cuando nadie toca ---------- */
  const pins = $$('.pin', hero);
  let manual = false, paso = -1;
  const activar = cat => pins.forEach(p => p.classList.toggle('activo', p.dataset.cat === cat));
  pins.forEach(p => {
    p.addEventListener('pointerenter', () => { manual = true; activar(p.dataset.cat); });
    p.addEventListener('pointerleave', () => { manual = false; activar(null); });
    p.addEventListener('focus', () => { manual = true; activar(p.dataset.cat); });
    p.addEventListener('blur', () => { manual = false; activar(null); });
  });
  if (!quieto) {
    const recorrer = () => {
      if (!manual && !html.classList.contains('hero-fuera') && !demo) { paso = (paso + 1) % (pins.length + 1); activar(pins[paso] ? pins[paso].dataset.cat : null); }
      setTimeout(recorrer, paso === pins.length - 1 ? 4000 : 2400);
    };
    hero.addEventListener('listo', () => setTimeout(recorrer, 4600));
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

  /* ---------- 7 · Menú móvil ---------- */
  const btnMenu = $('.cab-menu-btn'), txtMenu = $('.cab-menu-txt', btnMenu);
  const menu = $('#menu-movil');
  const cerrarMenu = () => { html.classList.remove('menu-abierto'); btnMenu.setAttribute('aria-expanded', 'false'); txtMenu.textContent = 'Menú'; };
  btnMenu.addEventListener('click', () => {
    const abrir = !html.classList.contains('menu-abierto');
    html.classList.toggle('menu-abierto', abrir);
    btnMenu.setAttribute('aria-expanded', String(abrir));
    txtMenu.textContent = abrir ? 'Cerrar' : 'Menú';
    if (abrir) setTimeout(() => $('a', menu).focus({ preventScroll: true }), 60);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a[href^="#"], [data-cerrar-menu]')) cerrarMenu(); });

  /* ---------- 8 · Visor de fotos (y de planos) ---------- */
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
  const TELAS = $$('.miniaturas .carta img').map(im => ({ src: im.dataset.grande, t: im.alt }));
  const vistas = new Set();
  const TODOS = [...trabajos, LIBRERIAS[0], ...LIBRERIAS.slice(7), MUEBLES[0], ...MUEBLES.slice(5)].filter(f => !vistas.has(f.src) && vistas.add(f.src));
  const PLANOS = { 'dumas-soak': 1136, flexo: 814, moraira: 570, omega: 820, romeo: 1134 };
  const SERIES = { trabajos, librerias: LIBRERIAS, muebles: MUEBLES, telas: TELAS, todos: TODOS };
  let lista = [], idx = 0, origen = null;
  const pintarVisor = () => {
    const f = lista[idx];
    vFoto.src = f.src; vFoto.alt = f.t; vTitulo.textContent = f.t; vCuenta.textContent = lista.length > 1 ? `${idx + 1} / ${lista.length}` : '';
    vFoto.style.animation = 'none'; void vFoto.offsetWidth; vFoto.style.animation = '';
  };
  const abrirVisor = (serie, i = 0, desde = null) => {
    lista = Array.isArray(serie) ? serie : (SERIES[serie] || []); if (!lista.length) return;
    idx = i; origen = desde; visor.classList.toggle('uno', lista.length < 2); pintarVisor();
    if (typeof visor.showModal === 'function') visor.showModal(); else visor.setAttribute('open', '');
  };
  const moverVisor = d => { if (lista.length < 2) return; idx = (idx + d + lista.length) % lista.length; pintarVisor(); };
  $('.v-ant', visor).addEventListener('click', () => moverVisor(-1));
  $('.v-sig', visor).addEventListener('click', () => moverVisor(1));
  $('.v-cerrar', visor).addEventListener('click', () => visor.close());
  visor.addEventListener('close', () => origen && origen.focus({ preventScroll: true }));
  visor.addEventListener('click', e => { if (e.target === visor || e.target.classList.contains('v-escena')) visor.close(); });
  visor.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') moverVisor(-1); if (e.key === 'ArrowRight') moverVisor(1); });
  let x0 = null;
  visor.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) moverVisor(dx < 0 ? 1 : -1); x0 = null; });
  $$('[data-abrir-visor]').forEach(b => b.addEventListener('click', () => abrirVisor(b.dataset.abrirVisor, 0, b)));
  $$('[data-plano]').forEach(b => b.addEventListener('click', () => abrirVisor([{ src: img('plano-' + b.dataset.plano, PLANOS[b.dataset.plano]), t: `Sofá ${b.dataset.nombre}: ${b.dataset.medidas}` }], 0, b)));
  document.addEventListener('click', e => { const h = e.target.closest('.hueco'); if (h) abrirVisor('trabajos', +h.dataset.i, h); });

  /* ---------- 9 · Intro: sus palabras se encienden al leer ---------- */
  const intro = $('[data-encender]');
  if (intro && !quieto) {
    intro.innerHTML = intro.textContent.trim().split(/\s+/).map(p => `<span class="pal">${p}</span>`).join(' ');
    const pals = $$('.pal', intro);
    let rafI = 0;
    const encender = () => {
      rafI = 0;
      const r = intro.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const n = limitar((vh * .86 - r.top) / (r.height + vh * .3), 0, 1) * pals.length * 1.04;
      pals.forEach((s, i) => s.style.setProperty('--o', (.16 + .84 * limitar(n - i, 0, 1)).toFixed(3)));
    };
    addEventListener('scroll', () => { if (!rafI) rafI = requestAnimationFrame(encender); }, { passive: true });
    addEventListener('resize', encender);
    encender();
  }

  /* ---------- 10 · Filosofía: su lema corre en dos filas y acelera con el scroll ---------- */
  const filas = $$('.lema-fila');
  if (filas.length && !quieto) {
    const sec = $('.filosofia');
    let anchos = filas.map(f => f.firstElementChild.getBoundingClientRect().width);
    addEventListener('resize', () => { anchos = filas.map(f => f.firstElementChild.getBoundingClientRect().width); });
    document.fonts.ready.then(() => { anchos = filas.map(f => f.firstElementChild.getBoundingClientRect().width); });
    let pos = 0, extra = 0, ultY = scrollY, ult = performance.now();
    const bucle = t => {
      const dt = Math.min(64, t - ult) / 1000; ult = t;
      const dy = scrollY - ultY; ultY = scrollY;
      if (!sec.classList.contains('fuera') && dt > 0) {
        extra += (Math.min(Math.abs(dy) / dt, 2400) * .35 - extra) * Math.min(1, dt * 5);
        pos += (46 + extra) * dt;
        filas.forEach((f, i) => { const a = anchos[i] || 1, p = pos % a; f.style.transform = `translate3d(${(i % 2 ? p - a : -p).toFixed(1)}px,0,0)`; });
      }
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
  }

  /* ---------- 11 · Proyectos: la costura entre la idea y el sofá sigue al cursor (o al dedo) ---------- */
  const cmp = $('[data-comparador]');
  if (cmp) {
    const rango = $('.cmp-rango', cmp);
    let p = .5, objetivo = .5, rafC = 0, tocado = false, suave = .14;
    const animarC = () => { p += (objetivo - p) * (quieto ? 1 : suave); cmp.style.setProperty('--p', p.toFixed(4)); rafC = Math.abs(objetivo - p) > .0008 ? requestAnimationFrame(animarC) : 0; };
    const ir = (v, k = .14) => { objetivo = limitar(v, 0, 1); suave = k; if (!rafC) rafC = requestAnimationFrame(animarC); };
    rango.addEventListener('input', () => { tocado = true; ir(rango.value / 100); });
    if (fino) cmp.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tocado = true;
      const r = cmp.getBoundingClientRect(), v = (e.clientX - r.left) / r.width;
      rango.value = Math.round(v * 100); ir(v);
    });
    if (!quieto) cmp.addEventListener('visto', () => {
      [[.1, 600], [.9, 2100], [.5, 3600]].forEach(([v, t]) => setTimeout(() => { if (!tocado) { ir(v, .045); rango.value = Math.round(v * 100); } }, t));
    });
  }

  /* ---------- 12 · Cada centímetro cuenta: la estantería se desliza sola, despacio; se para con el cursor ---------- */
  const est = $('.estanteria'), pista = $('.est-pista');
  const huecos = $$('li', pista);
  const anchoPista = () => huecos.reduce((s, li) => s + li.getBoundingClientRect().width, 0) + parseFloat(getComputedStyle(pista).columnGap || 0) * huecos.length;
  if (fino && !quieto) {
    html.classList.add('deriva');
    huecos.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('button').forEach(b => { b.tabIndex = -1; }); pista.append(c); });
    let pos = 0, vel = 0, objetivo = 38, impulso = 0, ult = performance.now(), periodo = anchoPista();
    addEventListener('resize', () => { periodo = anchoPista(); });
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

  /* ---------- 13 · Catálogo: la foto de cada categoría aparece y sigue al cursor ---------- */
  const indice = $('.indice'), flot = $('.flotador'), flotIn = $('.flotador-in'), catSec = $('.catalogo');
  if (fino && !ss && indice) {
    flotIn.textContent = '';
    const cats = $$('.cat', indice);
    const fotos = cats.map(li => {
      const im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = li.dataset.fotoCat;
      const medir = () => { const base = Math.min(innerWidth * .25, 430), r = im.naturalWidth / im.naturalHeight || 1.33; im.style.setProperty('--w', (base * limitar(Math.sqrt(r / 1.33), .74, 1.22)).toFixed(0) + 'px'); };
      im.complete ? medir() : im.addEventListener('load', medir, { once: true });
      addEventListener('resize', medir);
      flotIn.append(im); return im;
    });
    let mx = 0, my = 0, fx = 0, fy = 0, rafF = 0, activo = -1;
    const moverF = () => {
      const nx = fx + (mx - fx) * (quieto ? 1 : .15), ny = fy + (my - fy) * (quieto ? 1 : .15);
      const giro = limitar((nx - fx) * .5, -9, 9);
      fx = nx; fy = ny;
      flot.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0) rotate(${giro.toFixed(2)}deg)`;
      rafF = (Math.abs(mx - fx) > .3 || Math.abs(my - fy) > .3 || Math.abs(giro) > .05) ? requestAnimationFrame(moverF) : 0;
    };
    const elegirCat = i => { if (i === activo) return; activo = i; fotos.forEach((im, k) => im.classList.toggle('activa', k === i)); };
    const apuntar = (x, y, salto) => {
      const im = fotos[activo]; const w = im ? im.getBoundingClientRect().width || 360 : 360;
      mx = Math.min(x + 40 + w / 2, innerWidth - w / 2 - 20); my = y;
      if (salto) { fx = mx; fy = my; }
      if (!rafF) rafF = requestAnimationFrame(moverF);
    };
    let dentroCat = false;
    indice.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const li = e.target.closest('.cat'); if (!li) return;
      elegirCat(cats.indexOf(li));
      apuntar(e.clientX, e.clientY, !dentroCat);
      dentroCat = true; catSec.classList.add('flota');
    });
    indice.addEventListener('pointerleave', () => { dentroCat = false; catSec.classList.remove('flota'); });
    addEventListener('scroll', () => {
      if (!dentroCat) return;
      const el = document.elementFromPoint(mx - 60, my); const li = el && el.closest('.cat');
      if (li) elegirCat(cats.indexOf(li)); else { dentroCat = false; catSec.classList.remove('flota'); }
    }, { passive: true });
  }

  /* ---------- 14 · Pestañas accesibles (sofás, series de telas, mesas) ---------- */
  function pestanas(cont, alCambiar) {
    const tabs = $$('[role="tab"]', cont);
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

  /* ---------- 15 · Sofás: el escenario cambia de modelo; pasan solos hasta que eliges ---------- */
  const escenario = $('[data-escenario]');
  const nombreGrande = $('.esc-nombre', escenario), modelosSofa = $('.modelos', escenario);
  $$('.ficha-foto img').forEach(im => {
    const poner = () => im.closest('.ficha-foto').style.setProperty('--fondo-foto', `url("${im.currentSrc || im.src}")`);
    im.complete && im.naturalWidth ? poner() : im.addEventListener('load', poner, { once: true });
  });
  let fichaActual = $('.ficha.activa', escenario);
  const elegirSofa = pestanas(modelosSofa, tab => {
    const nueva = $('#' + tab.getAttribute('aria-controls'));
    if (nueva === fichaActual) return;
    const vieja = fichaActual;
    vieja.classList.remove('activa'); vieja.classList.add('sale');
    setTimeout(() => { if (!vieja.classList.contains('activa')) vieja.classList.remove('sale'); }, 800);
    nueva.classList.remove('sale'); nueva.classList.add('activa'); fichaActual = nueva;
    $('span', nombreGrande).textContent = $('span', tab).textContent;
    if (!quieto) reiniciar(nombreGrande, 'cambia');
    const izq = tab.offsetLeft - (modelosSofa.clientWidth - tab.offsetWidth) / 2;
    modelosSofa.scrollTo({ left: Math.max(0, izq), behavior: quieto ? 'auto' : 'smooth' });
  });
  if (!quieto) {
    escenario.classList.add('auto');
    const parar = () => escenario.classList.remove('auto');
    escenario.addEventListener('click', parar);
    modelosSofa.addEventListener('keydown', parar);
    modelosSofa.addEventListener('animationend', e => {
      if (e.animationName !== 'progreso' || !escenario.classList.contains('auto')) return;
      const tabs = $$('[role="tab"]', modelosSofa), i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      elegirSofa(tabs[(i + 1) % tabs.length]);
    });
  }

  /* ---------- 16 · Telas: su libro de muestras; la carta pasa como una hoja y la lupa enseña la trama ---------- */
  const muestra = $('[data-lupa-tela]');
  const grande = $('.mg-img', muestra), pieTela = $('.mg-pie', muestra);
  const lupaT = $('.lupa-tela', muestra), lupaTIn = $('.lupa-tela-in', lupaT), lupaTImg = $('img', lupaTIn);
  const cartas = $$('.carta');
  let telaActual = 0, tocadoTela = false;
  $$('.cartas').forEach(ul => $$('li', ul).forEach((li, i) => li.style.setProperty('--k', i)));
  const mostrarTela = (i, anim = true) => {
    const c = cartas[i], im = $('img', c);
    telaActual = i;
    cartas.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    const nombre = $('span', c).textContent, serie = c.closest('.cartas').id.slice(-1).toUpperCase();
    const poner = () => {
      grande.src = im.dataset.grande; grande.alt = im.alt; lupaTImg.src = im.dataset.grande;
      pieTela.innerHTML = `<b>${nombre}</b> · Serie ${serie}`;
      const propias = $$('.carta', c.closest('.cartas')), k = propias.indexOf(c);
      [1, 2].forEach(n => { const sig = $('img', propias[(k + n) % propias.length]); muestra.style.setProperty('--sig' + n, `url("${new URL(sig.dataset.grande, location.href).href}")`); });
      if (anim && !quieto) reiniciar(grande, 'pasa');
    };
    const pre = new Image(); pre.src = im.dataset.grande;
    (pre.decode ? pre.decode() : Promise.resolve()).then(poner, poner);
  };
  cartas.forEach((c, i) => c.addEventListener('click', () => { tocadoTela = true; mostrarTela(i); }));
  const muestraSec = $('.muestra');
  if (muestraSec.classList.contains('visto')) mostrarTela(0, false); else muestraSec.addEventListener('visto', () => mostrarTela(telaActual, false), { once: true });
  pestanas($('.series'), tab => {
    $$('.cartas').forEach(ul => {
      const si = ul.id === tab.getAttribute('aria-controls');
      ul.classList.toggle('activa', si);
      if (si && !quieto) reiniciar(ul, 'entra-serie');
    });
    const primera = $(`#${tab.getAttribute('aria-controls')} .carta`);
    mostrarTela(cartas.indexOf(primera));
  });
  $('.series').addEventListener('click', () => { tocadoTela = true; });
  muestra.addEventListener('click', () => abrirVisor('telas', telaActual, muestra));
  muestra.setAttribute('tabindex', '0'); muestra.setAttribute('role', 'button'); muestra.setAttribute('aria-label', 'Ver la carta de tejido en grande');
  muestra.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor('telas', telaActual, muestra); } });
  if (fino && !ss) {
    const Z = 2.6;
    muestra.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tocadoTela = true;
      const r = grande.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { lupaT.classList.remove('on'); return; }
      const d = lupaT.offsetWidth;
      lupaTIn.style.width = (r.width * Z).toFixed(0) + 'px'; lupaTIn.style.height = (r.height * Z).toFixed(0) + 'px';
      lupaT.style.transform = `translate3d(${(x - d / 2).toFixed(1)}px, ${(y - d / 2).toFixed(1)}px, 0)`;
      lupaTIn.style.transform = `translate3d(${(d / 2 - x * Z).toFixed(1)}px, ${(d / 2 - y * Z).toFixed(1)}px, 0)`;
      lupaT.classList.add('on');
    });
    muestra.addEventListener('pointerleave', () => lupaT.classList.remove('on'));
  }
  if (!quieto) {
    const telasSec = $('.telas');
    setInterval(() => {
      if (tocadoTela || telasSec.classList.contains('fuera') || document.hidden) return;
      const ul = $('.cartas.activa'), propias = $$('.carta', ul), k = propias.indexOf(cartas[telaActual]);
      mostrarTela(cartas.indexOf(propias[(k + 1) % propias.length]));
    }, 4200);
  }

  /* ---------- 17 · Mesas: la foto en el centro; sus modelos giran alrededor y la cambian ---------- */
  const mesas = $('#mesas'), orbita = $('[data-orbita]'), conmutador = $('.conmutador');
  const fotoMesa = $('.orb-foto', orbita), imgsMesa = $$('.mesa-img', orbita);
  const pieMesa = $('.orb-nombre', mesas), ctaMesa = $('[data-mesa-cta]', mesas), ctaNombre = $('.mesa-cta-nombre', mesas);
  const botonesMesa = $$('.orb-modelo', orbita);
  const sinFoto = document.createElement('p'); sinFoto.className = 'mesa-sin-foto'; sinFoto.setAttribute('aria-hidden', 'true'); fotoMesa.append(sinFoto);
  const FIJA = { modelo: 'cruceta-fija', pie: 'Mesa fija Mod. Cruceta', nombre: 'Mod. Cruceta' };
  let elegida = FIJA;
  const verMesa = m => {
    const conFoto = !!m.modelo;
    imgsMesa.forEach(im => { const si = conFoto && im.dataset.modelo === m.modelo; im.classList.toggle('activa', si); if (si) im.removeAttribute('aria-hidden'); else im.setAttribute('aria-hidden', 'true'); });
    sinFoto.textContent = m.nombre; fotoMesa.classList.toggle('sin', !conFoto);
    if (pieMesa.textContent !== m.pie) { pieMesa.textContent = m.pie; if (!quieto) reiniciar(pieMesa, 'cambia'); }
  };
  const datosBoton = b => ({ modelo: b.dataset.modelo || null, nombre: b.dataset.nombre, pie: b.dataset.pie || 'Mesa ' + b.dataset.nombre });
  const elegirMesa = (m, boton) => {
    elegida = m;
    botonesMesa.forEach(x => x.classList.toggle('elegido', x === boton));
    ctaMesa.dataset.interes = 'Mesa ' + m.nombre; ctaNombre.textContent = m.nombre;
    verMesa(m);
  };
  const btnCruceta = botonesMesa.find(b => b.dataset.modelo === 'cruceta'), btnCubo = botonesMesa.find(b => b.dataset.modelo === 'cubo');
  btnCruceta.classList.add('elegido');
  botonesMesa.forEach(b => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => { elegirMesa(datosBoton(b), b); botonesMesa.forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    if (fino) {
      b.addEventListener('pointerenter', () => verMesa(datosBoton(b)));
      b.addEventListener('pointerleave', () => verMesa(elegida));
    }
  });
  pestanas(conmutador, tab => {
    const ext = tab.id === 'm-ext';
    mesas.classList.toggle('ext', ext); conmutador.classList.toggle('ext', ext);
    $$('.tipo', mesas).forEach(p => p.classList.toggle('activa', p.id === tab.getAttribute('aria-controls')));
    if (ext) elegirMesa(datosBoton(btnCubo), btnCubo); else elegirMesa(FIJA, btnCruceta);
  });

  /* ---------- 18 · Formulario: «Me interesa» deja el modelo puesto; validación con sus textos ---------- */
  const form = $('#presupuesto');
  const etiqueta = $('[data-interes-etiqueta]', form);
  const ponerInteres = valor => {
    if (!valor) return;
    etiqueta.hidden = false; $('span', etiqueta).textContent = valor;
    const tipo = /^Sofá/.test(valor) ? 'Sofá' : /^Mesa/.test(valor) ? 'Mesa' : null;
    if (tipo) { const r = form.querySelector(`input[name="tipo"][value="${tipo}"]`); if (r) r.checked = true; }
    if (!quieto) setTimeout(() => reiniciar(form, 'marcado'), 450);
  };
  document.addEventListener('click', e => { const a = e.target.closest('[data-interes]'); if (a) ponerInteres(a.dataset.interes); });
  $('button', etiqueta).addEventListener('click', () => { etiqueta.hidden = true; $('span', etiqueta).textContent = ''; });
  const TEXTOS = { vacio: 'Rellena este campo', correo: 'Por favor, introduce una dirección de correo electrónico válida.', acepto: 'Tienes que aprobar los términos para continuar' };
  const marcarError = (campo, texto) => {
    const caja = campo.closest('.campo, .acepto');
    let p = $('.error', caja);
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

  /* ---------- 19 · Abierto o cerrado, con la hora de Madrid (?ahora=2026-10-07T18:30 para revisar) ---------- */
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
  $('.estado-txt', estado).textContent = txt;
  const hoy = $(`.horario tr[data-dia="${dia}"]`); if (hoy) hoy.classList.add('hoy');

  /* ---------- 20 · Mapa a demanda: Google no carga nada hasta pulsar ---------- */
  const mapa = $('[data-mapa]');
  $('[data-cargar-mapa]', mapa).addEventListener('click', () => {
    mapa.classList.add('cargado');
    mapa.innerHTML = '<iframe title="Mapa: Tikal Muebles, C. Oxford 4B, Las Rozas de Madrid" src="https://www.google.com/maps?q=40.5004809,-3.8882131&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  });

  /* ---------- 21 · Escape cierra el menú ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && html.classList.contains('menu-abierto')) { cerrarMenu(); btnMenu.focus(); }
  });
})();
