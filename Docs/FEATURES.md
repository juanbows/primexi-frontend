# Características de la Interfaz PRIME XI

## 1. Hero Section — "GANA TU LIGA CON PRECISIÓN"
- **Video de Fondo:** Clip de YouTube en autoplay, silenciado, con overlay degradado para legibilidad.
- **Badge de Temporada:** Indicador animado "Temporada 24/25 Lista" con punto pulsante.
- **CTA Principal:** Botón "Empezar Gratis" con ícono de balón animado al hover.
- **Credibilidad Social:** Indicador de "10,000+ Mánagers confían en nosotros".
- **Dashboard Mockup:** Previsualización del pitch view con jugadores y puntos esperados (84 pts).

## 2. Módulo de Funciones Core ("Domina tu Liga")
### 🤖 Puntos Predictivos IA
- Proyecciones precisas por jugador basadas en forma, dificultad de fixture y datos avanzados de xG.

### 🔄 Transferencias Óptimas
- Sugerencias algorítmicas para maximizar presupuesto y potencial de puntos a **5 jornadas vista**.

### 🏅 Capitanes de Élite
- Selección de capitán y vice-capitán basada en datos para nunca perder los puntos dobles clave.

## 3. Metodología — "Precisión Matemática"
Flujo en 3 pasos implementado en la sección "Cómo Funciona":
1. **Conecta tu ID:** Importación automática de plantilla, presupuesto y chips desde FPL.
2. **Análisis por IA:** Motor que procesa dificultad de partidos, xG y noticias de lesiones para simular la estrategia óptima.
3. **Optimiza y Gana:** Transferencias y capitanes sugeridos para escalar en la clasificación global.

## 4. Visualización del Pitch
- **Representación Táctica Dinámica:** Renderizado del once inicial sobre campo verde con markings (área, círculo central, línea de medio).
- **Badges Interactivos:** Distintivo "C" (Capitán) en verde y "V" (Vice) en blanco sobre los jugadores.
- **Puntos Esperados por Jugador:** Label flotante con la puntuación proyectada por IA.
- **Hover Effects:** Escala suave `hover:scale-110` en cada jugador al pasar el cursor.

## 5. Sección de Resultados ("Vence al Algoritmo")
- **Gráfica SVG Animada:** Línea de rendimiento PRIME XI vs. Mánager Promedio FPL, con animación `stroke-dashoffset` al entrar en pantalla.
- **Gradiente de Área:** Relleno verde neón bajo la curva de PRIME XI para impacto visual.

## 6. Estadísticas Clave (Implementadas en la UI)
| Métrica | Valor |
|---|---|
| Simulaciones/Semana | 2.5M+ |
| Precisión del Modelo | 98% |
| Mánagers Activos | 10k+ |
| Costo Inicial | £0 |

## 7. UX & Interactividad (script.js)
- **Navbar Dinámica:** Cambia opacidad y color de borde al hacer scroll > 50px.
- **Smooth Scroll:** Navegación fluida a secciones desde el menú principal.
- **Scroll Animations:** Secciones entran con fade-in + translateY al llegar al viewport (IntersectionObserver).
- **YouTube API:** Control de velocidad de reproducción del video de fondo (1.5x).
