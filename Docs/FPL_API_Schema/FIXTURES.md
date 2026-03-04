# Diccionario de Datos: Fixtures

El endpoint `/api/fixtures/` contiene todo el calendario y los resultados de la Liga 2024/25. Es clave para modelar la dificultad y las dobles jornadas.

## 1. Fixture (Partido)
Define un encuentro entre dos equipos de la PL.

| Campo | Descripción |
|---|---|
| `id` | ID único del partido (1-380). |
| `code` | Código interno de PL. |
| `event` | ID de la jornada (GW) a la que pertenece. |
| `finished` | Booleano que indica si el partido ya terminó. |
| `kickoff_time` | Fecha y hora de inicio (formato ISO). |
| `minutes` | Duración del juego (90 min + compensación). |
| `team_h`, `team_a` | IDs de los clubes involucrados. |
| `team_h_score`, `team_a_score` | Goles finales. |
| `team_h_difficulty`, `team_a_difficulty` | Calificación FDR (Fixture Difficulty Rating). |
| `stats` | Objeto complejo con todos los sucesos del partido. |

## 2. Stats (Estadísticas del Partido)
Contiene eventos que generan puntos para los jugadores.

- `identifier`: Qué tipo de estadística se registra (goles marcados, asistencias, bonus, bps, amarillas, rojas, penaltis salvados).
- `a`: Objeto con la lista de jugadores del equipo visitante involucrados en el evento.
- `h`: Objeto con la lista de jugadores del equipo local involucrados en el evento.

### Ejemplo de Estructura de Stats para Goles Marcardos:
```json
{
  "identifier": "goals_scored",
  "a": [{"value": 1, "element": 101}],
  "h": [{"value": 2, "element": 50}]
}
```
*Traducción: El jugador 50 (local) marcó 2 goles y el 101 (visitante) marcó 1 gol.*

## 3. Bonus Points System (BPS)
El campo `stats` con identifier `bps` es crucial para predecir quién recibirá los 3, 2 o 1 puntos de bonus oficiales al final del partido. Los tres jugadores con el BPS más alto son los que ganan los puntos extra.
