const models = require('./src/models');
const { v4: uuidv4 } = require('uuid');

async function setup() {
    try {
        await models.sequelize.sync({ force: true });
        console.log('Tablas creadas.');

        // Crear usuario demo
        await models.User.create({
            id: 'user-demo-123',
            full_name: 'Cristian Demo',
            email: 'cristian@demo.com',
            program_id: 'PROG001',
            xp_points: 150,
            profile_level: 'Practicante'
        });

        // Crear otros usuarios para el leaderboard
        const others = [
            { name: 'Ana Garcia', xp: 500, level: 'Intermedio' },
            { name: 'Luis Perez', xp: 300, level: 'Practicante' },
            { name: 'Maria Lopez', xp: 800, level: 'Avanzado' },
            { name: 'Juan Soto', xp: 50, level: 'Novato' }
        ];

        for (const u of others) {
            const id = uuidv4();
            await models.User.create({
                id,
                full_name: u.name,
                email: `${u.name.toLowerCase().replace(' ', '.')}@demo.com`,
                program_id: 'PROG001',
                xp_points: u.xp,
                profile_level: u.level
            });

            await models.WeeklyScore.create({
                id: uuidv4(),
                user_id: id,
                week_number: 20, // Example week
                year: 2026,
                total_score: u.xp,
                rank_position: null
            });
        }

        // Weekly score for demo user
        await models.WeeklyScore.create({
            id: uuidv4(),
            user_id: 'user-demo-123',
            week_number: 20,
            year: 2026,
            total_score: 150,
            rank_position: null
        });

        // Mock activity (last 7 days)
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            await models.ExerciseAttempt.create({
                user_id: 'user-demo-123',
                is_correct: true,
                created_at: date
            });
        }

        console.log('Datos de prueba insertados correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error en el setup:', error);
        process.exit(1);
    }
}

setup();
