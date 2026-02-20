# 3D Landing Page — PRIME XI

## Fase 1: Mouse Parallax 3D + Hero Tilt
- [/] Añadir IDs a elementos del hero (blobs, mockup, content, floating card)
- [/] Añadir clase `hero-section` al `<section>` del hero
- [/] Remover transforms estáticos de Tailwind del mockup
- [/] Actualizar `style.css` con `will-change` y estilos 3D base
- [/] Actualizar `script.js` con función `initHero3D()` (mouse tracking + lerp)
- [ ] Commit en `juan-dev`

## Fase 2: Campo de Partículas Canvas
- [ ] Clase `ParticleField` en script.js
- [ ] `<canvas id="hero-canvas">` en el hero
- [ ] Commit

## Fase 3: Feature Cards con 3D Flip
- [ ] Estructura `.card-front` / `.card-back` en las 3 cards
- [ ] CSS flip con `preserve-3d` + `backface-visibility`
- [ ] Commit

## Fase 4: Scroll 3D Reveal (GSAP)
- [ ] GSAP + ScrollTrigger CDN
- [ ] Animaciones de entrada por sección
- [ ] Commit
