const { calculateProfileLevel, xpToNextLevel, getCurrentWeek } = require('./gamification.helpers');
const { XP_REWARDS } = require('./gamification.constants');
const { Op, Sequelize } = require('sequelize'); // Assuming Sequelize is used
// Import models (adjust path as needed based on project structure)
// const { User, Badge, UserBadge, WeeklyScore, ExerciseAttempt, QuizAttempt, Progress } = require('../../models');

class GamificationService {
    constructor(models) {
        this.models = models;
    }

    /**
     * 2.1 addXP(userId, amount)
     */
    async addXP(userId, amount) {
        const transaction = await this.models.sequelize.transaction();
        try {
            const user = await this.models.User.findByPk(userId, { transaction });
            if (!user) throw new Error('User not found');

            const oldXP = user.xp_points || 0;
            const newXP = oldXP + amount;
            const newLevel = calculateProfileLevel(newXP);
            const levelUp = newLevel !== user.profile_level;

            // Update user
            await user.update({
                xp_points: newXP,
                profile_level: newLevel
            }, { transaction });

            // Update weekly score
            const { weekNumber, year } = getCurrentWeek();
            let weeklyScore = await this.models.WeeklyScore.findOne({
                where: { user_id: userId, week_number: weekNumber, year: year },
                transaction
            });

            if (weeklyScore) {
                await weeklyScore.update({
                    total_score: weeklyScore.total_score + amount
                }, { transaction });
            } else {
                await this.models.WeeklyScore.create({
                    id: Sequelize.literal('UUID()'), // or generate in JS
                    user_id: userId,
                    week_number: weekNumber,
                    year: year,
                    total_score: amount
                }, { transaction });
            }

            await transaction.commit();
            return { levelUp, newLevel, xpAdded: amount };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * 2.2 checkAndAwardBadges(userId)
     */
    async checkAndAwardBadges(userId) {
        const earnedBadges = [];
        
        // 1. Badge: 'Primer Nivel Completado'
        const hasProgress = await this.models.Progress.findOne({
            where: { user_id: userId, is_completed: true }
        });
        if (hasProgress) {
            await this._awardBadgeIfMissing(userId, 'Primer Nivel Completado', earnedBadges);
        }

        // 2. Badge: 'Quiz Perfecto'
        const hasPerfectQuiz = await this.models.QuizAttempt.findOne({
            where: { user_id: userId, score: 100 }
        });
        if (hasPerfectQuiz) {
            await this._awardBadgeIfMissing(userId, 'Quiz Perfecto', earnedBadges);
        }

        // 3. Badge: 'Racha de 7 días'
        const streakDays = await this.models.sequelize.query(`
            SELECT DISTINCT DATE(created_at) as day
            FROM (
                SELECT created_at FROM exercise_attempt WHERE user_id = :userId
                UNION ALL
                SELECT created_at FROM quiz_attempt WHERE user_id = :userId
            ) t
            ORDER BY day DESC
            LIMIT 30
        `, {
            replacements: { userId },
            type: Sequelize.QueryTypes.SELECT
        });

        if (streakDays.length >= 7) {
            let consecutive = true;
            for (let i = 0; i < 6; i++) {
                const currentDay = new Date(streakDays[i].day);
                const prevDay = new Date(streakDays[i + 1].day);
                const diff = (currentDay - prevDay) / (1000 * 60 * 60 * 24);
                if (diff !== 1) {
                    consecutive = false;
                    break;
                }
            }
            if (consecutive) {
                await this._awardBadgeIfMissing(userId, 'Racha de 7 días', earnedBadges);
            }
        }

        return earnedBadges;
    }

    async _awardBadgeIfMissing(userId, badgeName, earnedList) {
        const badge = await this.models.Badge.findOne({ where: { name: badgeName } });
        if (!badge) return;

        const alreadyHas = await this.models.UserBadge.findOne({
            where: { user_id: userId, badge_id: badge.id }
        });

        if (!alreadyHas) {
            await this.models.UserBadge.create({
                user_id: userId,
                badge_id: badge.id,
                earned_at: new Date()
            });
            earnedList.push(badge);
        }
    }

    /**
     * 2.3 getLeaderboard(programId, weekNumber, year)
     */
    async getLeaderboard(programId, weekNumber, year) {
        if (!weekNumber || !year) {
            const current = getCurrentWeek();
            weekNumber = current.weekNumber;
            year = current.year;
        }

        return await this.models.WeeklyScore.findAll({
            where: { week_number: weekNumber, year: year },
            include: [{
                model: this.models.User,
                where: { program_id: programId },
                attributes: ['full_name', 'profile_level']
            }],
            order: [['total_score', 'DESC']],
            limit: 20
        });
    }

    /**
     * 2.4 getHeatmap(userId)
     */
    async getHeatmap(userId) {
        return await this.models.sequelize.query(`
            SELECT DATE(created_at) as day, COUNT(*) as actions
            FROM (
                SELECT created_at FROM exercise_attempt WHERE user_id = :userId
                UNION ALL
                SELECT created_at FROM quiz_attempt WHERE user_id = :userId
            ) t
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        `, {
            replacements: { userId },
            type: Sequelize.QueryTypes.SELECT
        });
    }

    /**
     * 2.5 getWeeklyActivity(userId)
     */
    async getWeeklyActivity(userId) {
        // Implementation for current week activity (Monday to Sunday)
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (today.getDay() || 7) + 1);
        monday.setHours(0, 0, 0, 0);

        const results = await this.models.sequelize.query(`
            SELECT DATE(created_at) as day, COUNT(*) as actions
            FROM (
                SELECT created_at FROM exercise_attempt WHERE user_id = :userId
                UNION ALL
                SELECT created_at FROM quiz_attempt WHERE user_id = :userId
            ) t
            WHERE created_at >= :monday
            GROUP BY DATE(created_at)
        `, {
            replacements: { userId, monday },
            type: Sequelize.QueryTypes.SELECT
        });

        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const activity = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = results.find(r => r.day === dateStr);
            activity.push({
                dayName: dayNames[i],
                date: dateStr,
                actions: dayData ? parseInt(dayData.actions) : 0
            });
        }
        return activity;
    }

    /**
     * 2.6 getScoreHistory(userId, quizId)
     */
    async getScoreHistory(userId, quizId) {
        return await this.models.QuizAttempt.findAll({
            where: { user_id: userId, quiz_id: quizId },
            attributes: ['attempt_number', 'score', 'created_at', 'is_passed'],
            order: [['attempt_number', 'ASC']]
        });
    }

    /**
     * 2.7 getUserGamificationProfile(userId)
     */
    async getUserGamificationProfile(userId) {
        const user = await this.models.User.findByPk(userId, {
            attributes: ['xp_points', 'profile_level']
        });
        if (!user) return null;

        const badges = await this.models.UserBadge.findAll({
            where: { user_id: userId },
            include: [this.models.Badge],
            order: [['earned_at', 'DESC']]
        });

        const { weekNumber, year } = getCurrentWeek();
        const weeklyScore = await this.models.WeeklyScore.findOne({
            where: { user_id: userId, week_number: weekNumber, year: year }
        });

        return {
            xpPoints: user.xp_points,
            profileLevel: user.profile_level,
            xpToNext: xpToNextLevel(user.xp_points),
            badges: badges.map(ub => ({
                name: ub.Badge.name,
                description: ub.Badge.description,
                icon_url: ub.Badge.icon_url,
                earned_at: ub.earned_at
            })),
            weeklyRank: {
                totalScore: weeklyScore ? weeklyScore.total_score : 0,
                rankPosition: weeklyScore ? weeklyScore.rank_position : null
            }
        };
    }
}

module.exports = GamificationService;
