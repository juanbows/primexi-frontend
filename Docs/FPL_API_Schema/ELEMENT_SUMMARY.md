# Diccionario de Datos: Element Summary

Este endpoint proporciona el detalle profundo de un jugador específico a través de su `{id}`.

## 1. Fixtures (Próximos Partidos)
Contiene los próximos 5-10 partidos que el jugador debe disputar.

- `id`: ID del partido.
- `team_h`, `team_a`: Equipos local y visitante.
- `event`: Jornada del partido.
- `is_home`: Booleano indicando si el jugador juega en casa.
- `difficulty`: Nivel de dificultad proyectado para ese jugador (1-5).

## 2. History (Historial de la Temporada)
Puntos y estadísticas reales jornada a jornada.

| Campo | Descripción |
|---|---|
| `element` | ID del jugador. |
| `fixture` | ID del partido disputado. |
| `opponent_team` | ID del club rival. |
| `total_points` | Puntos ganados en esa jornada. |
| `was_home` | True si jugó de local. |
| `minutes` | Minutos jugados (min 60 para bono de 2 pts). |
| `goals_scored` | Goles marcados por el jugador. |
| `assists` | Asistencias dadas. |
| `clean_sheets` | Portería a cero (si jugó +60 min). |
| `yellow_cards`, `red_cards` | Sanciones recibidas. |
| `bonus` | Puntos extra obtenidos (1-3). |
| `bps` | Puntuación total en el sistema de bonos. |
| `value` | Precio del jugador en esa jornada específica. |
| `selected` | Cuántos mánagers lo tenían en esa jornada. |

## 3. History Past (Temporadas Anteriores)
Resumen de puntos totales y valor final de temporadas pasadas.

- `season_name`: Nombre de la temporada (e.g., 2023/24).
- `start_cost`, `end_cost`: Precio inicial y final.
- `total_points`: Puntos acumulados en ese año.
- `minutes`: Minutos totales jugados en ese año.
