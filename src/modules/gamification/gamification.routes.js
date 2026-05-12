const express = require('express');
const router = express.Router();
const GamificationController = require('./gamification.controller');

// Note: Authentication middleware should be imported from the existing project
// const authMiddleware = require('../../middlewares/auth.middleware');

module.exports = (models) => {
    const controller = new GamificationController(models);

    // Profile and general data
    router.get('/profile/:userId', controller.getProfile.bind(controller));
    router.get('/leaderboard', controller.getLeaderboard.bind(controller));
    router.get('/heatmap/:userId', controller.getHeatmap.bind(controller));
    router.get('/weekly-activity/:userId', controller.getWeeklyActivity.bind(controller));
    router.get('/score-history/:userId/:quizId', controller.getScoreHistory.bind(controller));

    // XP Management
    router.post('/add-xp', controller.addXP.bind(controller));

    // Badges
    router.get('/badges', controller.getAllBadges.bind(controller));
    router.get('/badges/:userId', controller.getUserBadges.bind(controller));

    return router;
};
