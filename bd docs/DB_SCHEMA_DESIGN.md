# 🗄️ Esquema Completo de Base de Datos: Fantasy Premier League (FPL)

Para armar una base de datos de producción para Machine Learning, he diseñado este esquema basado en la estructura de la API oficial. Este diseño está optimizado para consultas de series temporales y entrenamiento de modelos.

---

## 1. Tabla: `Teams` (Equipos)
Datos estáticos de los 20 clubes de la Premier League.
*Fuente: `bootstrap-static` -> `teams`*

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` (PK) | INT | ID único del equipo (ej: 1 = Arsenal). |
| `code` | INT | Código de equipo para assets (imágenes). |
| `name` | VARCHAR | Nombre completo (Aston Villa). |
| `short_name` | VARCHAR | Siglas (AVL). |
| `strength` | INT | Fuerza general percibida por la FPL (1-5). |
| `strength_overall_home` | INT | Fuerza general como local. |
| `strength_overall_away` | INT | Fuerza general como visitante. |
| `strength_attack_home` | INT | Potencial ofensivo local. |
| `strength_attack_away` | INT | Potencial ofensivo visitante. |
| `strength_defence_home` | INT | Potencial defensivo local. |
| `strength_defence_away` | INT | Potencial defensivo visitante. |

---

## 2. Tabla: `Players` (Jugadores - Maestral)
Información base de cada jugador. 
*Fuente: `bootstrap-static` -> `elements`*

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` (PK) | INT | ID único del jugador. |
| `first_name` | VARCHAR | Nombre. |
| `second_name` | VARCHAR | Apellido. |
| `web_name` | VARCHAR | Nombre que aparece en la camiseta/web. |
| `team_id` (FK) | INT | Referencia a `Teams.id`. |
| `element_type` | INT | Posición (1=GKP, 2=DEF, 3=MID, 4=FWD). |
| `now_cost` | INT | Precio actual (ej: 125 = £12.5m). |
| `status` | CHAR | Disponibilidad (a=Disponible, d=Duda, i=Lesionado, s=Suspendido). |
| `chance_of_playing_next_round` | INT | Probabilidad de jugar (0-100). |
| `news` | TEXT | Razón de la lesión o baja. |

---

## 3. Tabla: `Player_History` (Histórico por Partido)
**CRÍTICA PARA ML:** Contiene el rendimiento en cada partido pasado.
*Fuente: `element-summary` -> `history`*

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `player_id` (PK, FK)| INT | ID del jugador. |
| `fixture_id` (PK, FK)| INT | ID del partido. |
| `gameweek` | INT | Jornada (1-38). |
| `total_points` | INT | Puntos obtenidos en ese partido. |
| `minutes` | INT | Minutos jugados. |
| `goals_scored` | INT | Goles. |
| `assists` | INT | Asistencias. |
| `clean_sheets` | INT | Portería a cero. |
| `goals_conceded` | INT | Goles encajados. |
| `expected_goals` | FLOAT | **xG** del partido. |
| `expected_assists` | FLOAT | **xA** del partido. |
| `ict_index` | FLOAT | Índice Influence-Creativity-Threat. |
| `value` | INT | Precio del jugador en ese momento exacto. |
| `was_home` | BOOLEAN | T/F si jugó de local. |
| `opponent_team` | INT | ID del equipo rival. |

---

## 4. Tabla: `Fixtures` (Calendario de Partidos)
Para predicciones futuras.
*Fuente: `fixtures`*

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` (PK) | INT | ID único del partido. |
| `event` | INT | Jornada (Gameweek). |
| `team_h` (FK) | INT | Equipo local. |
| `team_a` (FK) | INT | Equipo visitante. |
| `team_h_difficulty`| INT | Dificultad para el local (FDR). |
| `team_a_difficulty`| INT | Dificultad para el visitante (FDR). |
| `kickoff_time` | DATETIME | Fecha y hora del partido. |
| `finished` | BOOLEAN | Si el partido ya terminó. |

---

## 5. Tabla: `Gameweeks` (Estado de Jornadas)
*Fuente: `bootstrap-static` -> `events`*

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` (PK) | INT | Jornada (1-38). |
| `deadline_time` | DATETIME | Fecha límite para cambios. |
| `is_current` | BOOLEAN | ¿Es la jornada activa? |
| `is_next` | BOOLEAN | ¿Es la próxima jornada? |
| `average_entry_score`| INT | Puntuación media global (benchmark). |
| `highest_score` | INT | Puntuación máxima de esa semana. |

---

## ⚙️ Recomendaciones de Implementación

1.  **Motor de Base de Datos:** Recomiendo **PostgreSQL** por su manejo eficiente de tipos de datos JSON y agregaciones complejas necesarias para ML.
2.  **Índices:** Crea índices en `Player_History(player_id)` y `Player_History(gameweek)` para acelerar el cálculo de promedios móviles (rolling averages).
3.  **Mantenimiento:** 
    *   `Teams` y `Players` se actualizan 1 vez al día.
    *   `Player_History` se actualiza al finalizar cada jornada.
    *   `Fixtures` se actualiza cuando hay re-programación de partidos (DGW - Double Gameweeks).

¿Quieres que genere el código SQL (`CREATE TABLE...`) para inicializar esta base de datos de una vez?
