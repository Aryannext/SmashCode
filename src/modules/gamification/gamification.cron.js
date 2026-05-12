const cron = require('node-cron');
const { getCurrentWeek } = require('./gamification.helpers');
const { Sequelize } = require('sequelize');

module.exports = (models) => {
    // Schedule: '5 0 * * 1' (Monday at 00:05)
    cron.schedule('5 0 * * 1', async () => {
        console.log('--- Starting Weekly Leaderboard Recalculation ---');
        try {
            // 1. Get the week that just ended (last week)
            const now = new Date();
            const lastWeekDate = new Date(now);
            lastWeekDate.setDate(now.getDate() - 7);
            
            // We need a helper to get week/year for any date, or adjust getCurrentWeek
            // For simplicity, we'll assume the cron runs just after the week ends.
            // A more robust way would be to pass the date to getCurrentWeek.
            
            const lastWeek = _getISOWeek(lastWeekDate);
            const currentWeek = getCurrentWeek();

            // 2. Recalculate rank_position for all active programs
            const programs = await models.User.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('program_id')), 'program_id']],
                where: { is_active: true }
            });

            for (const prog of programs) {
                const programId = prog.program_id;
                
                const scores = await models.WeeklyScore.findAll({
                    where: { week_number: lastWeek.weekNumber, year: lastWeek.year },
                    include: [{
                        model: models.User,
                        where: { program_id: programId, is_active: true }
                    }],
                    order: [['total_score', 'DESC']]
                });

                // Update rank positions
                for (let i = 0; i < scores.length; i++) {
                    await scores[i].update({ rank_position: i + 1 });
                }
            }

            // 3. Create empty weekly_score records for the new week
            const activeUsers = await models.User.findAll({ where: { is_active: true } });
            let processedCount = 0;

            for (const user of activeUsers) {
                const exists = await models.WeeklyScore.findOne({
                    where: { user_id: user.id, week_number: currentWeek.weekNumber, year: currentWeek.year }
                });

                if (!exists) {
                    await models.WeeklyScore.create({
                        id: Sequelize.literal('UUID()'),
                        user_id: user.id,
                        week_number: currentWeek.weekNumber,
                        year: currentWeek.year,
                        total_score: 0
                    });
                    processedCount++;
                }
            }

            console.log(`Leaderboard recalculado: semana ${lastWeek.weekNumber} año ${lastWeek.year} — ${processedCount} usuarios procesados para la nueva semana.`);
        } catch (error) {
            console.error('Error in weekly leaderboard cron:', error);
        }
    });
};

function _getISOWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return { weekNumber: weekNo, year: date.getUTCFullYear() };
}
