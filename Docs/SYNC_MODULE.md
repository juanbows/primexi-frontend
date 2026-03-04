# Módulo de Sincronización de Datos (Backend) ⚙️

PRIME XI utiliza un flujo de datos robusto para mantener su base de datos Supabase sincronizada con la API oficial de la Fantasy Premier League.

## 📦 Componentes del Módulo
La lógica reside en `Backend/sync/sync.js`, un script Node.js que realiza las siguientes operaciones:

1. **Extracción (Extract):** Realiza peticiones HTTP a la API oficial (`bootstrap-static/`, `fixtures/` y `element-summary/`).
2. **Transformación (Transform):** Limpia los datos de los 800+ jugadores, normaliza los precios (x10) y prepara los objetos para Supabase.
3. **Carga (Load):** Utiliza la operación `upsert` para insertar o actualizar registros en tiempo real. Se ha implementado una restricción única (`element_id, fixture_id`) en la base de datos para evitar duplicados en el historial.

## 🗃️ Tablas Sincronizadas
El script puebla las siguientes dimensiones críticas:
- **`teams`**: Los 20 clubes con sus ratings de fuerza.
- **`element_types`**: Reglas por posición (Portero, Defensa, etc.).
- **`events`**: Estado de las 38 jornadas (Gameweeks).
- **`elements`**: Estadísticas de cada jugador (incluyendo métricas xG/xA).
- **`fixtures`**: Calendario completo y resultados de la temporada.
- **`element_history`**: **Sincronización Profunda.** Registra el rendimiento detallado (puntos, goles, bonus) de cada jugador en cada jornada disputada (20,000+ registros).

## 🛡️ Mecanismos de Optimización (Deep Sync)
Sincronizar el historial requiere realizar una petición individual por cada uno de los 800+ jugadores. Para garantizar la estabilidad del sistema:
- **Concurrency Control:** El script procesa lotes de 5 jugadores simultáneamente para respetar los límites de la API oficial de la FPL.
- **Error Handling:** Si la API falla para un jugador específico, el script registra el error y continúa con el siguiente para asegurar que la base de datos se llene lo más posible.

## 🛠️ Cómo Iniciar la Sincronización
Para refrescar los datos manualmente:
```bash
cd Backend/sync
node sync.js
```

## 🔋 Consideraciones de Arquitectura
- **Rendimiento:** El script procesa los jugadores por lotes (chunks) de 100 para evitar saturar la base de datos.
- **Mantenimiento:** RLS ha sido deshabilitado temporalmente en estas tablas para facilitar la ingesta masiva inicial de datos maestros.
- **Actualización:** Se recomienda ejecutar este script antes de cada Gameweek para capturar cambios de precio y noticias de lesiones.
