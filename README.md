# Tikal Muebles — Propuesta de nueva homepage

Prototipo de homepage para **Tikal Muebles**, tienda y taller de muebles y sofás a medida en Las Rozas de Madrid (C. Oxford 4B, Európolis). Sustituye a la home de [tikalmuebles.com](https://tikalmuebles.com/) (WordPress con el tema Impreza).

**Prototipo:** https://jjurado2026.github.io/tikal-muebles/

**Qué es:** su home —sus bloques, en su orden, con sus textos y sus fotos— rehecha con sus colores medidos (#0f131f, #727f9f, #35415b, #e3e7f0). Los bloques nuevos (trabajos reales, catálogo, sofás con planos y telas, mesas, nosotros, visita y presupuesto) se construyen solo con textos de sus propias páginas.

**Dirección estética (v2): «De la idea al mueble».** Su lema, «Fabricamos tus ideas», hecho visible: la foto del hero llega como el boceto de una idea y una costura de luz cálida (la de sus leds) la convierte en el mueble. Con el cursor, una lupa enseña la idea debajo, sin mover la foto. Además:

- Sus etiquetas sobre la foto (librería, mueble de TV, sofá, mesa) llevan a cada bloque.
- La intro se enciende palabra a palabra al leer; su lema corre en dos filas gigantes.
- Un comparador idea ↔ sofá terminado sigue al cursor.
- Sus trabajos reales pasan por una estantería que se desliza sola.
- El catálogo es un índice cuya foto flota junto al cursor.
- Los sofás pasan solos en un escenario, con su nombre gigante y su plano con medidas.
- Las telas son un libro de muestras con lupa para ver la trama.
- Las mesas: la foto en el centro, redonda, y sus 9 modelos girando alrededor.
- Nosotros: un sello de «Más de 25 años» que gira sobre su exposición.

Tipografía: **Gloock** y **Manrope**. Cabecera fija, con enlaces a sus páginas reales.

**Lo útil:**

- Presupuesto, «Llamar» y «Cómo llegar» desde la primera pantalla, con el teléfono bien escrito (+34).
- Estado abierto/cerrado en vivo.
- «Me interesa» deja el modelo puesto en el formulario.
- Mapa que solo carga al pedirlo.
- Botón flotante en escritorio y barra fija en móvil.

## Comprobado, no asumido
- **El hero cabe entero, sin scroll, en 17 tamaños**, de 320×568 a 2560×1440, incluidos el móvil en horizontal y las tabletas. La foto se ve siempre entera.
- Sin desbordamiento horizontal, cero errores de JavaScript, un solo `<h1>`, imágenes con `alt`, dianas táctiles ≥ 44 px.
- Con movimiento reducido no hay bucles, y sin JavaScript se lee todo.
- Interacciones probadas con ratón y teclado reales (32 pruebas): `_interno/herramientas/verificar.mjs` e `interacciones.mjs`.

Parámetros para revisar:

- `?ss`: sin animaciones, para capturas.
- `?ahora=2026-10-07T18:30`: fija la hora para el estado abierto/cerrado.
- `?caducada`: muestra el aviso.

## Caducidad
La propuesta se ve hasta el **16 de octubre de 2026** (hora de Madrid). Desde el 17, `index.html` lleva a `caducada.html`: el aviso, el correo de contacto y la home entera en miniatura. La fecha está en el primer `<script>` de `index.html`. En local no caduca.

## Stack
HTML, CSS y JavaScript puro. Cero dependencias, cero build. Fuentes autoalojadas e imágenes del cliente en WebP/AVIF con `srcset`.

## Estructura
```
prototype/          Prototipo navegable (se publica en gh-pages con git subtree)
  index.html
  caducada.html     Lo que se ve cuando la propuesta caduca
  assets/css/       global.css · home.css
  assets/js/        main.js
  assets/fonts/     gloock · manrope (woff2, latino)
  assets/img/       fotos del cliente en WebP/AVIF
_interno/           Auditoría, competencia, negocio, brief, copy, direcciones, imágenes, herramientas y propuesta (no se publica)
```

## Ver en local
```bash
cd prototype && python -m http.server 8000
```

## Publicar
```bash
git subtree push --prefix=prototype origin gh-pages
```

---
Diseño y desarrollo: **Juan Jurado** · [jjuradogarciadelrio.com](https://jjuradogarciadelrio.com)
