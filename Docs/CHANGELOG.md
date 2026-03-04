# CHANGELOG - PRIME XI Landing Page

Historial de cambios y evolución técnica del proyecto.

---

## [d1a2f3b] - 2026-03-04
### 🔗 Integración de Datos y Backend
- **Conectividad API FPL:** Verificación de acceso y conexión exitosa a los endpoints oficiales de la Fantasy Premier League.
- **Documentación de Esquema API:** Creación de una suite completa de documentación técnica en `/Docs/FPL_API_Schema/` detallando diccionarios de datos, entidades (`elements`, `teams`, `events`, `fixtures`) y sus relaciones.
- **Arquitectura de Base de Datos:**
    - Inicialización de **Supabase** para el proyecto "PRIME XI".
    - Ejecución de migraciones SQL para crear el esquema dinámico (6 tablas principales con relaciones e índices optimizados).
    - Generación de tipos TypeScript iniciales para la base de datos.
- **Organización de Documentos:** Estructuración de la documentación técnica para facilitar la implementación del algoritmo de optimización.
- **Refactorización de Documentos Maestros:** Rediseño completo de `README.md` y `ANTIGRAVITY.md` para alinearlos con el stack tecnológico actual (Next.js + Supabase) y establecer el Roadmap del proyecto Q1 2026.


## [a130d52] - 2026-02-20
### ✨ Suite de Animaciones 3D Avanzadas
- **Atmósfera:** Implementación de `initAtmosphereParticles` (Canvas) para fondo de constelación de datos interactivo.
- **Cursor:** Sistema de cursor personalizado con trail suavizado (halo neón) usando interpolación `lerp`.
- **Efectos de Texto:** Añadido `glitch-wrapper` en el título principal para estética cyber/tech.
- **Cards:** Implementación de brillo holográfico (`shimmer`) y tilt 3D dinámico en las feature cards.
- **Interacción Magnética:** Los botones principales ahora tienen atracción magnética hacia el cursor.
- **Scroll & Feedback:**
    - Contadores animados (stats) que se activan al scroll.
    - Animación de trazado de gráfica (SVG) sincronizada con la visibilidad.
    - Feedback de Confetti al interactuar con el CTA principal.
    - Línea de conexión dinámica (SVG Path) entre los pasos de la metodología.

## [8e3b285] - 2026-02-20
### 🏎️ Fase 1: Mouse Parallax & Hero Tilt
- Implementación de `initHero3D` con seguimiento de mouse de alta precisión.
- Efecto de profundidad en capas del Hero: Dashboard Mockup (tilt), Floating Card (bobbing), y Blobs de fondo (drift).
- Optimización de performance con `will-change: transform`.
- Detección de dispositivos touch para desactivar efectos de hover.

## [0bb9094] - 2026-02-20
### 📂 Reorganización y Documentación
- Movimiento de logos de `LandingPage/` a `Docs/`.
- Reestructuración de archivos: HTML, CSS y JS movidos a subcarpetas dedicadas.
- Actualización exhaustiva de `BRANDING.md`, `FEATURES.md`, `ABOUT_US.md` y `BUSINESS_MODEL.md`.
- Sincronización del `README.md` principal con la nueva estructura.

## [3b8fb0f] - 2026-02-19
### 🔱 Refinamiento Estético Hero
- Integración del logo Kraken SVG detallado.
- Configuración de video de fondo de YouTube optimizado.
- Estilos iniciales de Glassmorphism y Glow.

## [84c6b10] - 2026-02-18
### 🏗️ Inicialización Frontend
- Creación de la estructura base del proyecto.
- Configuración inicial de Tailwind CSS y tipografía (Space Grotesk & Inter).
- Definición de la paleta de colores oficial de PRIME XI (Purple, Pink, Neon Green).
