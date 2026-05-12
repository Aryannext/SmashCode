const { Sequelize, DataTypes } = require('sequelize');

// Update with your WAMP MySQL credentials
const sequelize = new Sequelize('doulingo_ingles', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const models = {};

// User Model
models.User = sequelize.define('User', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    program_id: DataTypes.STRING,
    xp_points: { type: DataTypes.INTEGER, defaultValue: 0 },
    profile_level: { type: DataTypes.STRING, defaultValue: 'Novato' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'users', timestamps: false });

// Badge Model
models.Badge = sequelize.define('Badge', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING, unique: true },
    description: DataTypes.STRING,
    icon_url: DataTypes.STRING,
    criteria: DataTypes.STRING
}, { tableName: 'badge', timestamps: false });

// UserBadge Model
models.UserBadge = sequelize.define('UserBadge', {
    user_id: { type: DataTypes.STRING(36), primaryKey: true },
    badge_id: { type: DataTypes.STRING(36), primaryKey: true },
    earned_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'user_badge', timestamps: false });

// WeeklyScore Model
models.WeeklyScore = sequelize.define('WeeklyScore', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    user_id: DataTypes.STRING(36),
    week_number: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    total_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    rank_position: DataTypes.INTEGER
}, { tableName: 'weekly_score', timestamps: false });

// ExerciseAttempt Model
models.ExerciseAttempt = sequelize.define('ExerciseAttempt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.STRING(36),
    is_correct: DataTypes.BOOLEAN,
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'exercise_attempt', timestamps: false });

// QuizAttempt Model
models.QuizAttempt = sequelize.define('QuizAttempt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.STRING(36),
    quiz_id: DataTypes.STRING(36),
    score: DataTypes.INTEGER,
    is_passed: DataTypes.BOOLEAN,
    attempt_number: DataTypes.INTEGER,
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'quiz_attempt', timestamps: false });

// Progress Model
models.Progress = sequelize.define('Progress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.STRING(36),
    rap_id: DataTypes.STRING(36),
    is_completed: DataTypes.BOOLEAN,
    best_quiz_score: DataTypes.INTEGER
}, { tableName: 'progress', timestamps: false });

// Associations
models.UserBadge.belongsTo(models.Badge, { foreignKey: 'badge_id' });
models.WeeklyScore.belongsTo(models.User, { foreignKey: 'user_id' });

models.sequelize = sequelize;

module.exports = models;
