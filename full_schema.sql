-- =============================================================================
-- BASE SCHEMA FOR SMASHCODE (Minimal for Gamification Module)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `doulingo_ingles`;
USE `doulingo_ingles`;

-- 1. users
CREATE TABLE IF NOT EXISTS `users` (
    `id`          VARCHAR(36)  NOT NULL,
    `full_name`   VARCHAR(255) NOT NULL,
    `email`       VARCHAR(191) NOT NULL UNIQUE,
    `program_id`  VARCHAR(36)  NOT NULL,
    `xp_points`   INTEGER      DEFAULT 0,
    `profile_level` VARCHAR(255) DEFAULT 'Novato',
    `is_active`   BOOLEAN      DEFAULT TRUE,
    PRIMARY KEY (`id`)
);

-- 2. exercise_attempt
CREATE TABLE IF NOT EXISTS `exercise_attempt` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `user_id`     VARCHAR(36)  NOT NULL,
    `is_correct`  BOOLEAN      NOT NULL,
    `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- 3. quiz_attempt
CREATE TABLE IF NOT EXISTS `quiz_attempt` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `user_id`     VARCHAR(36)  NOT NULL,
    `quiz_id`     VARCHAR(36)  NOT NULL,
    `score`       INTEGER      NOT NULL,
    `is_passed`   BOOLEAN      NOT NULL,
    `attempt_number` INTEGER   NOT NULL,
    `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- 4. progress
CREATE TABLE IF NOT EXISTS `progress` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `user_id`     VARCHAR(36)  NOT NULL,
    `rap_id`      VARCHAR(36)  NOT NULL,
    `is_completed` BOOLEAN     NOT NULL DEFAULT FALSE,
    `best_quiz_score` INTEGER  DEFAULT 0,
    PRIMARY KEY (`id`)
);

-- Ahora ejecutamos el resto del script original
-- =============================================================================
--  SMASHCODE — MÓDULO DE GAMIFICACIÓN
-- =============================================================================

CREATE TABLE IF NOT EXISTS `badge` (
    `id`          VARCHAR(36)  NOT NULL,
    `name`        VARCHAR(191) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `icon_url`    VARCHAR(255),
    `criteria`    VARCHAR(255),
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user_badge` (
    `user_id`   VARCHAR(36) NOT NULL,
    `badge_id`  VARCHAR(36) NOT NULL,
    `earned_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `badge_id`)
);

CREATE TABLE IF NOT EXISTS `weekly_score` (
    `id`            VARCHAR(36) NOT NULL,
    `user_id`       VARCHAR(36) NOT NULL,
    `week_number`   INTEGER     NOT NULL,
    `year`          INTEGER     NOT NULL,
    `total_score`   INTEGER     NOT NULL DEFAULT 0,
    `rank_position` INTEGER     DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- FKs
ALTER TABLE `user_badge` ADD CONSTRAINT `fk_user_badge_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `user_badge` ADD CONSTRAINT `fk_user_badge_badge` FOREIGN KEY (`badge_id`) REFERENCES `badge` (`id`);
ALTER TABLE `weekly_score` ADD CONSTRAINT `fk_weekly_score_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- Seed inicial de badges
INSERT IGNORE INTO `badge` (`id`, `name`, `description`, `icon_url`, `criteria`) VALUES
(UUID(), 'Primer Nivel Completado', '¡Completaste tu primer nivel!', '/assets/badges/first-level.svg', 'is_completed = true'),
(UUID(), 'Quiz Perfecto', '100% en un quiz.', '/assets/badges/perfect-quiz.svg', 'score = 100'),
(UUID(), 'Racha de 7 días', '7 días consecutivos.', '/assets/badges/streak-7.svg', '7 días seguidos');
