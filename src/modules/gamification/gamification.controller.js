// Import service
const GamificationService = require('./gamification.service');
// Note: In a real project, the service instance might be injected or created with models.
// For this implementation, we assume a controller class structure.

class GamificationController {
    constructor(models) {
        this.service = new GamificationService(models);
    }

    async getProfile(req, res) {
        try {
            const { userId } = req.params;
            const profile = await this.service.getUserGamificationProfile(userId);
            if (!profile) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            res.status(200).json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const { programId, week, year } = req.query;
            if (!programId) {
                return res.status(400).json({ success: false, message: 'programId es requerido' });
            }
            const leaderboard = await this.service.getLeaderboard(programId, parseInt(week), parseInt(year));
            res.status(200).json({ success: true, data: leaderboard });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getHeatmap(req, res) {
        try {
            const { userId } = req.params;
            const heatmap = await this.service.getHeatmap(userId);
            res.status(200).json({ success: true, data: heatmap });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWeeklyActivity(req, res) {
        try {
            const { userId } = req.params;
            const activity = await this.service.getWeeklyActivity(userId);
            res.status(200).json({ success: true, data: activity });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getScoreHistory(req, res) {
        try {
            const { userId, quizId } = req.params;
            const history = await this.service.getScoreHistory(userId, quizId);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addXP(req, res) {
        try {
            const { userId, amount, reason } = req.body;
            if (!userId || !amount) {
                return res.status(400).json({ success: false, message: 'userId y amount son requeridos' });
            }
            
            const xpResult = await this.service.addXP(userId, parseInt(amount));
            const badgesEarned = await this.service.checkAndAwardBadges(userId);

            res.status(200).json({
                success: true,
                data: {
                    xpAdded: amount,
                    levelUp: xpResult.levelUp,
                    newLevel: xpResult.newLevel,
                    badgesEarned: badgesEarned
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllBadges(req, res) {
        try {
            // Assuming this.service.models.Badge is accessible
            const badges = await this.service.models.Badge.findAll();
            res.status(200).json({ success: true, data: badges });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUserBadges(req, res) {
        try {
            const { userId } = req.params;
            const userBadges = await this.service.models.UserBadge.findAll({
                where: { user_id: userId },
                include: [this.service.models.Badge]
            });
            res.status(200).json({ success: true, data: userBadges });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = GamificationController;
