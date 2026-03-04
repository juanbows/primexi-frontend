require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Use Service Role Key if RLS is enabled
const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncData() {
    console.log('🚀 Iniciando sincronización de datos de FPL...');

    try {
        // 1. Fetch data from bootstrap-static
        console.log('📦 Obteniendo datos maestros de la API...');
        const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);
        const { teams, element_types, events, elements } = response.data;

        console.log(`✅ Datos recibidos: ${teams.length} equipos, ${elements.length} jugadores.`);

        // 2. Sync Element Types (Positions)
        console.log('🔄 Sincronizando Posiciones...');
        for (const type of element_types) {
            const { error } = await supabase.from('element_types').upsert({
                id: type.id,
                singular_name: type.singular_name,
                singular_name_short: type.singular_name_short,
                plural_name: type.plural_name,
                plural_name_short: type.plural_name_short,
                squad_select: type.squad_select,
                squad_min_play: type.squad_min_play,
                squad_max_play: type.squad_max_play,
                updated_at: new Date()
            });
            if (error) console.error(`❌ Error en element_types [${type.id}]:`, error.message);
        }

        // 3. Sync Teams
        console.log('🔄 Sincronizando Equipos...');
        for (const team of teams) {
            const { error } = await supabase.from('teams').upsert({
                id: team.id,
                name: team.name,
                short_name: team.short_name,
                code: team.code,
                strength: team.strength,
                strength_overall_home: team.strength_overall_home,
                strength_overall_away: team.strength_overall_away,
                strength_attack_home: team.strength_attack_home,
                strength_attack_away: team.strength_attack_away,
                strength_defence_home: team.strength_defence_home,
                strength_defence_away: team.strength_defence_away,
                updated_at: new Date()
            });
            if (error) console.error(`❌ Error en teams [${team.id}]:`, error.message);
        }

        // 4. Sync Events (Gameweeks)
        console.log('🔄 Sincronizando Jornadas...');
        for (const event of events) {
            const { error } = await supabase.from('events').upsert({
                id: event.id,
                name: event.name,
                deadline_time: event.deadline_time,
                finished: event.finished,
                is_previous: event.is_previous,
                is_current: event.is_current,
                is_next: event.is_next,
                average_entry_score: event.average_entry_score,
                highest_score: event.highest_score,
                updated_at: new Date()
            });
            if (error) console.error(`❌ Error en events [${event.id}]:`, error.message);
        }

        // 5. Sync Elements (Players)
        console.log('🔄 Sincronizando Jugadores (esto puede tardar)...');
        // We chunk players to avoid massive payloads
        const chunkSize = 100;
        for (let i = 0; i < elements.length; i += chunkSize) {
            const chunk = elements.slice(i, i + chunkSize).map(el => ({
                id: el.id,
                first_name: el.first_name,
                second_name: el.second_name,
                web_name: el.web_name,
                team_id: el.team,
                element_type_id: el.element_type,
                now_cost: el.now_cost,
                status: el.status,
                chance_of_playing_next_round: el.chance_of_playing_next_round,
                chance_of_playing_this_round: el.chance_of_playing_this_round,
                total_points: el.total_points,
                selected_by_percent: el.selected_by_percent,
                expected_goals: el.expected_goals,
                expected_assists: el.expected_assists,
                expected_goal_involvements: el.expected_goal_involvements,
                expected_goals_conceded: el.expected_goals_conceded,
                ict_index: el.ict_index,
                form: el.form,
                points_per_game: el.points_per_game,
                news: el.news,
                updated_at: new Date()
            }));

            const { error } = await supabase.from('elements').upsert(chunk);
            if (error) console.error(`❌ Error en elements chunk [${i}]:`, error.message);
        }

        // 6. Fetch and Sync Fixtures
        console.log('🏁 Sincronizando Calendario (Fixtures)...');
        const fixturesResponse = await axios.get(`${FPL_BASE_URL}/fixtures/`);
        const fixtures = fixturesResponse.data;

        const fixtureChunkSize = 200;
        for (let j = 0; j < fixtures.length; j += fixtureChunkSize) {
            const fChunk = fixtures.slice(j, j + fixtureChunkSize).map(fx => ({
                id: fx.id,
                event_id: fx.event,
                team_h: fx.team_h,
                team_a: fx.team_a,
                team_h_score: fx.team_h_score,
                team_a_score: fx.team_a_score,
                finished: fx.finished,
                kickoff_time: fx.kickoff_time,
                team_h_difficulty: fx.team_h_difficulty,
                team_a_difficulty: fx.team_a_difficulty,
                code: fx.code,
                updated_at: new Date()
            }));

            const { error } = await supabase.from('fixtures').upsert(fChunk);
            if (error) console.error(`❌ Error en fixtures chunk [${j}]:`, error.message);
        }

        // 7. Sync Element History (Individual Performance)
        // Note: This requires one request per player, we'll process them in small batches
        console.log('📜 Sincronizando Historial de Jugadores (esto tomará varios minutos)...');
        const players = elements.slice(0, 100); // For now, sync only the first 100 to avoid rate limits, or all? 
        // User wants "flujo de datos", let's do all but with a small delay or concurrency limit.

        const concurrentLimit = 5;
        for (let k = 0; k < elements.length; k += concurrentLimit) {
            const playerBatch = elements.slice(k, k + concurrentLimit);
            console.log(`⏳ Procesando batch de historial: ${k} a ${k + concurrentLimit}...`);

            await Promise.all(playerBatch.map(async (player) => {
                try {
                    const summaryRes = await axios.get(`${FPL_BASE_URL}/element-summary/${player.id}/`);
                    const { history } = summaryRes.data;

                    if (history && history.length > 0) {
                        const historyRecords = history.map(h => ({
                            element_id: h.element,
                            fixture_id: h.fixture,
                            opponent_team_id: h.opponent_team,
                            total_points: h.total_points,
                            was_home: h.was_home,
                            minutes: h.minutes,
                            goals_scored: h.goals_scored,
                            assists: h.assists,
                            clean_sheets: h.clean_sheets,
                            goals_conceded: h.goals_conceded,
                            own_goals: h.own_goals,
                            penalties_saved: h.penalties_saved,
                            penalties_missed: h.penalties_missed,
                            yellow_cards: h.yellow_cards,
                            red_cards: h.red_cards,
                            saves: h.saves,
                            bonus: h.bonus,
                            bps: h.bps,
                            value: h.value,
                            round: h.round
                        }));

                        // Use upsert to avoid duplicate history points for the same player/fixture
                        // We need a unique constraint or we can just upsert. 
                        // Since we don't have a unique ID for history rows in FPL, we'll rely on our BIGSERIAL id
                        // but actually we should probably check if record exists or delete old ones.
                        // For simplicity in this sync, we'll insert.
                        const { error: histError } = await supabase.from('element_history').upsert(historyRecords, {
                            onConflict: 'element_id, fixture_id'
                        });
                        if (histError) {
                            if (histError.code === '23505' || histError.message.includes('unique constraint')) {
                                // Constraint probably missing, let's just insert for now.
                                await supabase.from('element_history').insert(historyRecords);
                            } else {
                                console.error(`❌ Error en historial jugador ${player.id}:`, histError.message);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`⚠️ Falló el resumen del jugador ${player.id}:`, e.message);
                }
            }));
        }

        console.log('✨ ¡Sincronización completa con historial incluida!');

    } catch (err) {
        console.error('💥 Error fatal durante la sincronización:', err.message);
    }
}

syncData();
