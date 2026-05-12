const routes = require('./gamification.routes');
const service = require('./gamification.service');
const controller = require('./gamification.controller');
const cron = require('./gamification.cron');
const seed = require('./gamification.seed');
const constants = require('./gamification.constants');
const helpers = require('./gamification.helpers');

module.exports = {
    gamificationRoutes: routes,
    GamificationService: service,
    GamificationController: controller,
    gamificationCron: cron,
    gamificationSeed: seed,
    gamificationConstants: constants,
    gamificationHelpers: helpers
};
