const express = require('express');
const cors = require('cors');
const path = require('path');
const models = require('./src/models');
const { gamificationRoutes, gamificationCron, gamificationSeed } = require('./src/modules/gamification');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/gamification', gamificationRoutes(models));

// Start server
async function start() {
    try {
        // Sync database (only for demo, don't use in production if schema is managed externally)
        // await models.sequelize.sync({ alter: true });
        
        console.log('Database connected.');
        
        // Run seed
        await gamificationSeed(models);
        
        // Start Cron
        gamificationCron(models);

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
}

start();
