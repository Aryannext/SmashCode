-- =============================================================================
--  SMASHCODE — MÓDULO DE GAMIFICACIÓN
--  Extraído de ERS IEEE 830 v2.1 | RF35 · RF36 | HU07 · HU15
--  SENA ADSO — Mayo 2026
-- =============================================================================
--
--  TABLAS PROPIAS DE ESTE MÓDULO (las que tú debes crear y mantener):
--    1. badge          → Catálogo de insignias
--    2. user_badge     → Relación usuario ↔ insignia (clave compuesta)
--    3. weekly_score   → Leaderboard semanal por programa de formación
--
--  CAMPOS DE GAMIFICACIÓN EN TABLA USERS (campos que este módulo escribe):
--    · xp_points       → XP acumulados del aprendiz
--    · profile_level   → Nivel de perfil calculado (Novato → Experto Clínico)
--    (La tabla users la crea el módulo de autenticación; aquí solo se documentan
--     los campos que este módulo necesita escribir vía UPDATE.)
--
--  TABLAS EXTERNAS QUE ESTE MÓDULO SOLO LEE (no debes crearlas aquí):
--    · users           → Para leer user_id, program_id y escribir xp_points/profile_level
--    · exercise_attempt → Para calcular racha de días activos y heatmap (created_at)
--    · quiz_attempt    → Para comparativa de puntajes y XP por evaluación (score, created_at)
--    · progress        → Para disparar insignia "primer nivel completado" (is_completed)
--
--  INSTRUCCIONES DE EJECUCIÓN:
--    Paso 1 → Ejecuta primero el schema base (módulo de autenticación + contenido).
--    Paso 2 → Ejecuta ESTE archivo para agregar las tablas de gamificación.
--    Las FK de este archivo apuntan a `users` y `badge`, que ya deben existir.
-- =============================================================================


-- =============================================================================
--  SECCIÓN 1 — CATÁLOGO DE INSIGNIAS
--  RF35 ítem 1: "Insignias por logros"
--  Precargado por el admin; editable vía CRUD en el panel de administración.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `badge` (
    `id`          VARCHAR(36)  NOT NULL,
    `name`        VARCHAR(255) NOT NULL UNIQUE COMMENT 'Nombre único de la insignia (ej: "Quiz Perfecto")',
    `description` VARCHAR(255)          COMMENT 'Descripción que ve el aprendiz al ganarla',
    `icon_url`    VARCHAR(255)          COMMENT 'URL del ícono / imagen de la insignia',
    `criteria`    VARCHAR(255)          COMMENT 'Descripción del criterio de otorgamiento (para el admin)',
    PRIMARY KEY (`id`)
) COMMENT = 'Catálogo de insignias disponibles en la plataforma — RF35';


-- =============================================================================
--  SECCIÓN 2 — RELACIÓN USUARIO ↔ INSIGNIA
--  RF35 ítem 1: Insignias se otorgan automáticamente al cumplirse el criterio.
--  Clave primaria compuesta (user_id + badge_id) garantiza que cada usuario
--  solo puede ganar cada insignia una vez.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `user_badge` (
    `user_id`   VARCHAR(36) NOT NULL COMMENT 'FK → users.id',
    `badge_id`  VARCHAR(36) NOT NULL COMMENT 'FK → badge.id',
    `earned_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora exacta en que se ganó la insignia',
    PRIMARY KEY (`user_id`, `badge_id`)
) COMMENT = 'Registro de qué insignia ganó cada usuario y cuándo — RF35';


-- =============================================================================
--  SECCIÓN 3 — LEADERBOARD SEMANAL
--  RF35 ítem 4: "Tabla de posiciones semanal entre aprendices del mismo
--  programa de formación."
--  HU15: "El leaderboard se reinicia automáticamente cada lunes."
--
--  NOTA DE RENDIMIENTO (RNF03 < 200 ms):
--  El rank_position se calcula periódicamente (job/cron), NO en tiempo real.
--  El frontend hace polling AJAX cada 60 segundos para refrescar la vista.
--  Al iniciar cada semana (lunes) se insertan nuevos registros con total_score = 0
--  para todos los usuarios activos del programa.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `weekly_score` (
    `id`            VARCHAR(36) NOT NULL,
    `user_id`       VARCHAR(36) NOT NULL  COMMENT 'FK → users.id',
    `week_number`   INTEGER     NOT NULL  COMMENT 'Número de semana ISO del año (1–53)',
    `year`          INTEGER     NOT NULL  COMMENT 'Año correspondiente a la semana',
    `total_score`   INTEGER     NOT NULL  DEFAULT 0    COMMENT 'XP acumulados en la semana',
    `rank_position` INTEGER               DEFAULT NULL COMMENT 'Posición en el ranking (calculada por job periódico)',
    PRIMARY KEY (`id`)
) COMMENT = 'Leaderboard semanal por programa de formación — RF35 / HU15';


-- =============================================================================
--  SECCIÓN 4 — FOREIGN KEYS DEL MÓDULO DE GAMIFICACIÓN
-- =============================================================================

-- user_badge → users
ALTER TABLE `user_badge`
    ADD CONSTRAINT `fk_user_badge_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE NO ACTION ON DELETE NO ACTION;

-- user_badge → badge
ALTER TABLE `user_badge`
    ADD CONSTRAINT `fk_user_badge_badge`
    FOREIGN KEY (`badge_id`) REFERENCES `badge` (`id`)
    ON UPDATE NO ACTION ON DELETE NO ACTION;

-- weekly_score → users
ALTER TABLE `weekly_score`
    ADD CONSTRAINT `fk_weekly_score_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE NO ACTION ON DELETE NO ACTION;


-- =============================================================================
--  SECCIÓN 5 — DATOS INICIALES (SEED)
--  Insignias base definidas en la ERS. El admin puede agregar más desde el panel.
-- =============================================================================

INSERT INTO `badge` (`id`, `name`, `description`, `icon_url`, `criteria`) VALUES
(
    UUID(),
    'Primer Nivel Completado',
    '¡Completaste tu primer nivel en SmashCode!',
    '/assets/badges/first-level.svg',
    'is_completed = true en Progress por primera vez (cualquier RAP del nivel 1)'
),
(
    UUID(),
    'Quiz Perfecto',
    'Respondiste todas las preguntas correctamente en un quiz.',
    '/assets/badges/perfect-quiz.svg',
    'score = 100 en cualquier QuizAttempt'
),
(
    UUID(),
    'Racha de 7 días',
    'Estudiaste 7 días consecutivos sin fallar ninguno.',
    '/assets/badges/streak-7.svg',
    'Registrar ExerciseAttempt o QuizAttempt en 7 días consecutivos (calculado por job diario)'
);


-- =============================================================================
--  SECCIÓN 6 — REFERENCIA DE CAMPOS EN TABLA USERS (documentación)
--  Estos campos ya existen en users (schema base). Este módulo los escribe
--  vía UPDATE cuando el aprendiz gana XP o sube de nivel.
--
--  `xp_points`     INTEGER DEFAULT 0
--  `profile_level` VARCHAR(255)
--
--  TABLA DE NIVELES DE PERFIL (RF35 ítem 3):
--  ┌──────────────────┬─────────────────────────────────────────────────────┐
--  │ profile_level    │ Criterio de otorgamiento                            │
--  ├──────────────────┼─────────────────────────────────────────────────────┤
--  │ Novato           │ Nivel inicial — todos los aprendices comienzan aquí │
--  │ Practicante      │ Completar al menos 1 RAP aprobado                   │
--  │ Intermedio       │ Completar el 50% de los RAPs                        │
--  │ Avanzado         │ Completar todos los RAPs con puntaje ≥ 70%          │
--  │ Experto Clínico  │ Completar todos los RAPs con puntaje ≥ 90%          │
--  └──────────────────┴─────────────────────────────────────────────────────┘
--
--  FUENTES DE XP (a implementar en la lógica de negocio):
--  · ExerciseAttempt correcto          → +10 XP por ejercicio
--  · QuizAttempt aprobado              → +50 XP por quiz aprobado
--  · QuizAttempt con score = 100       → +100 XP (bonus quiz perfecto)
--  · Racha de 7 días completada        → +70 XP (1 vez por racha)
--  (Los valores exactos de XP los define el equipo — estos son sugeridos.)
-- =============================================================================


-- =============================================================================
--  SECCIÓN 7 — CONSULTAS ÚTILES PARA EL MÓDULO (referencia rápida)
-- =============================================================================

-- Leaderboard de la semana actual filtrado por programa de formación:
-- SELECT u.full_name, ws.total_score, ws.rank_position
-- FROM weekly_score ws
-- JOIN users u ON u.id = ws.user_id
-- WHERE ws.week_number = WEEK(NOW(), 3)   -- ISO week
--   AND ws.year = YEAR(NOW())
--   AND u.program_id = :programId
-- ORDER BY ws.rank_position ASC;

-- Heatmap: días con actividad en los últimos 3 meses (sin tabla extra):
-- SELECT DATE(created_at) AS active_day, COUNT(*) AS total_actions
-- FROM (
--     SELECT created_at FROM exercise_attempt WHERE user_id = :userId
--     UNION ALL
--     SELECT created_at FROM quiz_attempt     WHERE user_id = :userId
-- ) actividad
-- WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
-- GROUP BY DATE(created_at)
-- ORDER BY active_day ASC;

-- Comparativa de puntajes entre sesiones del mismo quiz (RF36 ítem 3):
-- SELECT attempt_number, score, created_at
-- FROM quiz_attempt
-- WHERE user_id = :userId AND quiz_id = :quizId
-- ORDER BY attempt_number ASC;

-- Insignias del usuario con fecha:
-- SELECT b.name, b.description, b.icon_url, ub.earned_at
-- FROM user_badge ub
-- JOIN badge b ON b.id = ub.badge_id
-- WHERE ub.user_id = :userId
-- ORDER BY ub.earned_at DESC;
