# Esquema de Base de Datos - PRIME XI (Supabase)

Este documento describe la arquitectura de la base de datos implementada en Supabase para soportar el análisis de datos de la Premier League.

## 🗃️ Tablas Implementadas

| Tabla | Propósito | Claves Principales / Foráneas |
|---|---|---|
| `element_types` | Define las posiciones (GKP, DEF, MID, FWD) y sus reglas. | `id` (PK) |
| `teams` | Los 20 clubes con sus ratings de fuerza. | `id` (PK) |
| `events` | Las 38 jornadas (Gameweeks) de la temporada. | `id` (PK) |
| `elements` | **Jugadores.** Precios, puntos acumulados y métricas xG/xA. | `id` (PK), `team_id`, `element_type_id` |
| `fixtures` | Calendario completo y resultados de partidos. | `id` (PK), `event_id`, `team_h`, `team_a` |
| `element_history` | Historial de puntos y estadísticas por jugador por jornada. | `id` (PK), `element_id`, `fixture_id`, `round` |

## ⚙️ Características Técnicas
- **Integridad Referencial:** Todas las tablas están vinculadas mediante Claves Foráneas (FK) para evitar datos huérfanos.
- **Índices de Rendimiento:** Se han creado índices en columnas clave (`team_id`, `event_id`, `element_id`) para acelerar las consultas de filtrado.
- **Tipos de Datos:**
    - `DECIMAL` para métricas de precisión (ej. xG de 0.85).
    - `TIMESTAMPTZ` para asegurar la sincronización de horarios de partidos (deadlines).
    - `BIGSERIAL` para el historial, anticipando millones de registros.

## 🚀 Próximos Pasos
1. **Poblado de Datos:** Ejecutar el scrapper/importador para llenar estas tablas desde la API oficial de la FPL.
2. **Funciones de Base de Datos (PL/pgSQL):** Crear procedimientos para calcular automáticamente el "Once Ideal" basándose en el presupuesto de un usuario.
3. **RLS (Row Level Security):** Configurar políticas de seguridad si se añaden perfiles de usuario.
