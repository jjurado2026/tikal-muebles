# Tikal Muebles — Propuesta de nueva homepage

Prototipo de homepage para **Tikal Muebles**, tienda y taller de muebles y sofás a medida en Las Rozas de Madrid (C. Oxford 4B, zona Europolis). Sustituye a la home de su web actual, [tikalmuebles.com](https://tikalmuebles.com/) (WordPress con el tema Impreza).

En marcha: análisis del sector, auditoría de su web, copy y prototipo.

## Stack
HTML, CSS y JavaScript puro. Cero dependencias, cero build.

## Estructura
```
prototype/          Prototipo navegable (se publica en gh-pages con git subtree)
_interno/           Auditoría, competencia, brief, copy, imágenes y propuesta (no se publica)
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
