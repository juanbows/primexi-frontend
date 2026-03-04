# Estructura del API de Fantasy Premier League (FPL)

Esta carpeta contiene la documentación técnica del esquema de datos, diccionarios de campos y relaciones de la API oficial de la Fantasy Premier League para la temporada 2024/25.

## Endpoints Principales

| Endpoint | Descripción | Información Clave |
|---|---|---|
| `/api/bootstrap-static/` | Datos maestros del juego | Equipos, Jugadores, Jornadas, Configuración global. |
| `/api/fixtures/` | Calendario de partidos | Fechas, equipos, dificultad y resultados en tiempo real. |
| `/api/element-summary/{id}/` | Detalle por jugador | Historial de puntos y próximos partidos del jugador. |
| `/api/event/{id}/live/` | Datos en vivo de la jornada | Puntos y estadísticas detalladas por jugador en la GW actual. |
| `/api/entry/{id}/` | Perfil del Mánager | Info del usuario, ligas y puntos totales. |
| `/api/entry/{id}/event/{gw}/picks/` | Equipo semanal | Alineación elegida por un mánager para una GW específica. |

## Entidades de Datos

El sistema se basa en 5 entidades principales:
1. **Events (Jornadas):** Define los tiempos de entrega (deadlines) y el estado de cada semana de juego.
2. **Teams (Clubes):** Los 20 equipos de la Premier League con sus ratings de fuerza.
3. **Elements (Jugadores):** La entidad más densa, contiene precios, puntos, estadísticas de rendimiento y xG.
4. **ElementTypes (Posiciones):** Define las reglas para Porteros, Defensas, Mediocampistas y Delanteros.
5. **Fixtures (Partidos):** Cruce entre equipos que genera los puntos para los "Elements".

## Glosario de Términos Comunes
- **Element:** Se refiere a un Jugador de fútbol.
- **Entry:** Se refiere a un equipo de un Usuario (Mánager).
- **GW / Event:** Gameweek o Jornada.
- **xG / xA / xP:** Estadísticas esperadas (Goles, Asistencias, Puntos).
- **BPS:** Bonus Points System (sistema que determina quién gana los 3, 2 o 1 puntos extra).
