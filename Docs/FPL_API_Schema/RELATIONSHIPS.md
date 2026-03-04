# Relaciones de las Entidades FPL

Este diagrama de relaciones describe cómo se conectan los datos entre los distintos endpoints de la Fantasy Premier League.

## 1. Diagrama de Conexiones
El centro de la API es el **Element** (Jugador). Todas las demás entidades sirven para explicar su rendimiento o contexto.

### Relaciones Clave:
- **Element (Jugador) -> Team (Club):** `element.team` -> `team.id` (1 a muchos).
- **Element (Jugador) -> ElementType (Posición):** `element.element_type` -> `element_type.id` (1 a muchos).
- **Fixture (Partido) -> Team (Club):** `fixture.team_h` / `fixture.team_a` -> `team.id` (2 a 1).
- **Fixture (Partido) -> Event (Jornada):** `fixture.event` -> `event.id` (Muchos a 1).
- **ElementSummary (Detalle) -> Element (Jugador):** `/api/element-summary/{id}/` -> `element.id` (Extensión de datos).
- **LiveStats (Vivir) -> Element (Jugador):** `/api/event/{gw}/live/` -> `element.id` (Puntos en vivo).

## 2. Mapa de Datos (Data Mapping)
Para construir el sistema del **Once Ideal**, el algoritmo debe cruzar estos campos:

| Proceso | Secciones Clave | Relación Crítica |
|---|---|---|
| **Formación de 11** | `bootstrap-static.elements` + `element_types` | `element_type` (Reglas de alineación). |
| **Dificultad de Próximos Partidos** | `element-summary.fixtures` + `teams` | `team_h_difficulty` / `team_a_difficulty`. |
| **Cálculo de xP (Puntos Esperados)** | `bootstrap-static.elements` + `fixtures` | `expected_goals`, `expected_assists`, `ict_index`. |
| **Monitoreo de Mercado** | `bootstrap-static.elements` | `now_cost`, `cost_change_event_fall`. |

## 3. Flujo de Información Recomendado para PRIME XI
1. **Paso 1:** Obtener maestros (`bootstrap-static`) para tener nombres de jugadores, precios y clubes.
2. **Paso 2:** Cruzar con `fixtures` para saber contra quién juegan en la jornada actual y las próximas 5.
3. **Paso 3:** Descargar `element-summary` de los jugadores TOP para analizar su forma reciente (últimos 3-5 partidos).
4. **Paso 4:** Generar el modelo de optimización basándose en el presupuesto y restricciones de equipo.
