# 📚 Documentación Completa: API Oficial Fantasy Premier League (FPL)

Esta es la guía definitiva de los endpoints de la API de la FPL para la temporada 2024/25. La API es tipo REST y devuelve datos en formato **JSON**.

**Base URL:** `https://fantasy.premierleague.com/api/`

---

## 1. Endpoints Públicos (Datos Generales)

No requieren autenticación y son la base para cualquier modelo de Machine Learning.

| Endpoint | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `bootstrap-static/` | **El "Main Hub":** Datos de todos los jugadores, equipos, jornadas y configuración del juego. | [/bootstrap-static/](https://fantasy.premierleague.com/api/bootstrap-static/) |
| `fixtures/` | Lista completa de los 380 partidos de la temporada. | [/fixtures/](https://fantasy.premierleague.com/api/fixtures/) |
| `fixtures/?event={GW}` | Partidos específicos de una jornada (Gameweek). | [/fixtures/?event=28](https://fantasy.premierleague.com/api/fixtures/?event=28) |
| `event-status/` | Estado actual de la jornada (si los puntos de bonus ya se sumaron o si el cálculo terminó). | [/event-status/](https://fantasy.premierleague.com/api/event-status/) |
| `set-piece-notes/` | Notas sobre lanzadores de penaltis, faltas y córners por equipo. | [/set-piece-notes/](https://fantasy.premierleague.com/api/set-piece-notes/) |

---

## 2. Datos Específicos de Jugadores

| Endpoint | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `element-summary/{PID}/` | **Historial del Jugador:** Datos detallados partido a partido del jugador con ID `{PID}`. | [/element-summary/381/](https://fantasy.premierleague.com/api/element-summary/381/) |
| `event/{GW}/live/` | **Live Stats:** Estadísticas en tiempo real de todos los jugadores durante la jornada `{GW}`. | [/event/28/live/](https://fantasy.premierleague.com/api/event/28/live/) |
| `dream-team/{GW}/` | El "Equipo Ideal" de una jornada específica. | [/dream-team/27/](https://fantasy.premierleague.com/api/dream-team/27/) |

---

## 3. Datos de Usuarios (Públicos)

Cualquier usuario puede consultar los datos de otro si conoce su `Entry ID`.

| Endpoint | Descripción |
| :--- | :--- |
| `entry/{EID}/` | Perfil del manager, ligas a las que pertenece y chips usados. |
| `entry/{EID}/history/` | Resumen de puntos por jornada y resumen de temporadas pasadas. |
| `entry/{EID}/event/{GW}/picks/` | Alineación, capitán y suplentes de un usuario en una jornada específica. |
| `entry/{EID}/transfers/` | Historial completo de fichajes realizados por el usuario. |

---

## 4. Ligas y Clasificaciones

| Endpoint | Descripción |
| :--- | :--- |
| `leagues-classic/{LID}/standings/` | Tabla de posiciones de una liga clásica (ID `{LID}`). |
| `leagues-h2h/{LID}/standings/` | Tabla de posiciones de una liga Head-to-Head. |
| `leagues-h2h-matches/league/{LID}/` | Calendario y resultados de enfrentamientos H2H en una liga. |

---

## 5. Endpoints Privados (Requieren Autenticación)

Para usarlos, debes enviar las cookies de sesión (`pl_user_token`). Son necesarios para automatizar tu propio equipo.

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `me/` | GET | Información básica de la sesión actual (tu ID de usuario). |
| `my-team/{EID}/` | GET | Tu alineación actual, valor de equipo y presupuesto libre. |
| `my-team/{EID}/` | POST | **Realizar Transferencias:** Se envía un JSON con los IDs de entrada y salida. |
| `leagues-entered/` | GET | Lista de todas las ligas privadas y públicas donde participas. |

---

## 💡 Notas Técnicas para tu Modelo de IA

1.  **IDs de Jugadores:** Los IDs en `bootstrap-static` pueden cambiar de temporada a temporada, pero son constantes durante toda la 24/25.
2.  **Frecuencia de Actualización:** `bootstrap-static` se actualiza casi instantáneamente después de cambios de precio o lesiones.
3.  **Límites de Rate (Rate Limiting):** La FPL es generosa, pero evita hacer más de 1 petición por segundo para evitar baneos temporales de IP.
4.  **xG / xA:** Estos datos "avanzados" se encuentran dentro del array `explain` en el endpoint `event/{GW}/live/` o en el historial de `element-summary`.
