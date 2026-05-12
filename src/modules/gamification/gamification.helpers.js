const { PROFILE_LEVELS } = require('./gamification.constants');

/**
 * Dado un total de xp_points, retorna el profile_level correspondiente.
 */
function calculateProfileLevel(xpPoints) {
    let currentLevel = PROFILE_LEVELS[0].name;
    for (const level of PROFILE_LEVELS) {
        if (xpPoints >= level.minXP) {
            currentLevel = level.name;
        } else {
            break;
        }
    }
    return currentLevel;
}

/**
 * Retorna cuántos XP faltan para el siguiente nivel.
 * Si ya es 'Experto Clínico' retorna 0.
 */
function xpToNextLevel(xpPoints) {
    const nextLevel = PROFILE_LEVELS.find(level => level.minXP > xpPoints);
    if (!nextLevel) return 0;
    return nextLevel.minXP - xpPoints;
}

/**
 * Dado el número ISO de semana actual y el año, retorna { weekNumber, year }.
 * Usa la semana ISO (lunes = inicio).
 */
function getCurrentWeek() {
    const d = new Date();
    // Copy date so don't modify original
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    
    return {
        weekNumber: weekNo,
        year: date.getUTCFullYear()
    };
}

module.exports = {
    calculateProfileLevel,
    xpToNextLevel,
    getCurrentWeek
};
