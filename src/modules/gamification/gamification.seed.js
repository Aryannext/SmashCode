// Note: This script assumes Sequelize and models are available
// const { Badge } = require('../../models');

const baseBadges = [
    { 
        name: 'Primera Guardia', 
        description: '¡Has completado tu primer turno de formación con éxito!',
        icon_url: '/assets/badges/first-level.svg',
        criteria: 'Completar el primer RAP' 
    },
    { 
        name: 'Triaje Perfecto', 
        description: 'Identificaste correctamente todos los síntomas en un caso clínico.',
        icon_url: '/assets/badges/perfect-quiz.svg',
        criteria: 'Obtener 100% en cualquier quiz' 
    },
    { 
        name: 'Ética Profesional', 
        description: 'Mantuviste una constancia de estudio ejemplar durante 7 días.',
        icon_url: '/assets/badges/streak-7.svg',
        criteria: 'Estudiar 7 días consecutivos' 
    },
];

module.exports = async (models) => {
    console.log('--- Seeding Base Badges ---');
    try {
        for (const badgeData of baseBadges) {
            const [badge, created] = await models.Badge.findOrCreate({
                where: { name: badgeData.name },
                defaults: {
                    id: models.sequelize.literal('UUID()'),
                    ...badgeData
                }
            });

            if (created) {
                console.log(`Badge created: ${badgeData.name}`);
            } else {
                console.log(`Badge already exists: ${badgeData.name}`);
            }
        }
        console.log('--- Seed completed ---');
    } catch (error) {
        console.error('Error seeding badges:', error);
    }
};
