# Diccionario de Datos: Bootstrap Static

El endpoint `/api/bootstrap-static/` proporciona el contexto global de la FPL. A continuación se desglosan los campos críticos por tabla (objeto).

## 1. Events (Jornadas)
Representa cada semana de juego (de la 1 a la 38).

- `id`: Identificador de la GW (1-38).
- `name`: Nombre legible (Gameweek 1).
- `deadline_time`: Fecha y hora límite para hacer cambios (formato ISO).
- `is_previous`, `is_current`, `is_next`: Booleano que indica el estado actual de la liga.
- `average_entry_score`: Puntos promedio de todos los mánagers en esa jornada.
- `highest_score`: Máximo de puntos alcanzado por algún mánager.

## 2. Teams (Equipo Pro)
Los 20 clubes de la liga.

- `id`: Identificador del equipo (1-20).
- `code`: Código interno de PL para assets (logos).
- `name`: Nombre completo (e.g., Arsenal).
- `short_name`: Iniciales (e.g., ARS).
- `strength`: Nivel de dificultad general (1-5).
- `strength_overall_home`, `strength_overall_away`: Calificación de juego local vs. visitante.
- `strength_attack_home`, `strength_defence_home`: Ratings específicos de ataque/defensa.

## 3. Elements (Jugadores)
El objeto más importante, contiene más de 50 campos.

| Campo | Descripción | Proporción |
|---|---|---|
| `id` | Identificador único del jugador. | Único |
| `web_name` | Nombre corto mostrado en la camiseta. | Texto |
| `element_type` | Posición (1: GKP, 2: DEF, 3: MID, 4: FWD). | ID Relación |
| `team` | ID del equipo al que pertenece. | ID Relación |
| `now_cost` | Precio actual (multiplicado por 10, e.g., 55 = £5.5m). | Entero |
| `total_points` | Puntos acumulados en la temporada. | Entero |
| `selected_by_percent` | % de mánagers que tienen al jugador. | Decimal |
| `status` | Disponibilidad (a: disponible, i: lesionado, d: duda). | Char |
| `expected_goals` | xG - Goles que debería haber marcado según datos. | Decimal |
| `expected_assists` | xA - Asistencias esperadas. | Decimal |
| `ict_index` | Índice de Influencia, Creatividad y Amenaza. | Decimal |

## 4. ElementTypes (Posiciones)
Reglas por posición.

- `singular_name`: Posición (Goalkeeper, Defender, etc.).
- `squad_min_select`, `squad_max_select`: Cuántos se deben elegir para el equipo (e.g., 2 Porteros).
- `squad_min_play`, `squad_max_play`: Límites para el 11 titular (e.g., min 3 defensas).
