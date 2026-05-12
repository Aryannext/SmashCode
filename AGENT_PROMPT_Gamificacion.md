# AGENT PROMPT — Módulo de Gamificación SmashCode
> Pega esto completo en el agente de Antigravity

---

## 🎯 CONTEXTO DEL PROYECTO

Estás trabajando en **SmashCode**, una plataforma de inglés médico para enfermería (SENA ADSO).
El proyecto ya tiene un schema de base de datos MySQL completo.
Tu tarea es implementar **únicamente el módulo de gamificación** como un conjunto de servicios, controladores y rutas independientes.

**Stack asumido:** Node.js + Express + Sequelize (o el ORM que ya esté configurado en el proyecto).
Si el proyecto usa otro stack, adapta la estructura pero respeta la lógica y los nombres de tabla exactos.

---

## 🗄️ TABLAS QUE DEBE USAR ESTE MÓDULO

```sql
-- TABLAS PROPIAS (las gestiona este módulo):
users          → xp_points, profile_level              (escribe)
badge          → id, name, description, icon_url, criteria
user_badge     → user_id, badge_id, earned_at
weekly_score   → id, user_id, week_number, year, total_score, rank_position

-- TABLAS QUE SOLO LEE (no modificar su estructura):
exercise_attempt → user_id, is_correct, created_at
quiz_attempt     → user_id, score, quiz_id, created_at
progress         → user_id, rap_id, is_completed, best_quiz_score
```

---

## 📦 ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
└── modules/
    └── gamification/
        ├── gamification.routes.js
        ├── gamification.controller.js
        ├── gamification.service.js
        ├── gamification.helpers.js   ← lógica de XP y niveles
        └── gamification.cron.js      ← job semanal del leaderboard
```

---

## ✅ TAREA 1 — `gamification.helpers.js`

Implementa estas funciones puras (sin efectos secundarios, solo lógica):

```js
/**
 * Dado un total de xp_points, retorna el profile_level correspondiente.
 * Regla:
 *   0   – 99   → 'Novato'
 *   100 – 299  → 'Practicante'
 *   300 – 599  → 'Intermedio'
 *   600 – 999  → 'Avanzado'
 *   1000+      → 'Experto Clínico'
 */
function calculateProfileLevel(xpPoints) { ... }

/**
 * Retorna cuántos XP faltan para el siguiente nivel.
 * Si ya es 'Experto Clínico' retorna 0.
 */
function xpToNextLevel(xpPoints) { ... }

/**
 * Dado el número ISO de semana actual y el año, retorna { weekNumber, year }.
 * Usa la semana ISO (lunes = inicio).
 */
function getCurrentWeek() { ... }
```

---

## ✅ TAREA 2 — `gamification.service.js`

Implementa los siguientes métodos. Usa transacciones donde haya múltiples escrituras.

### 2.1 `addXP(userId, amount)`
```
- Suma `amount` a users.xp_points del usuario
- Recalcula profile_level con calculateProfileLevel()
- Si el nivel cambió → retorna { levelUp: true, newLevel: '...' }
- Si no cambió     → retorna { levelUp: false }
- También suma amount a weekly_score.total_score de la semana actual
  (si no existe el registro, lo crea con total_score = amount)
```

### 2.2 `checkAndAwardBadges(userId)`
```
Evalúa las 3 insignias base y otorga las que apliquen.
Solo otorga si el usuario aún NO la tiene en user_badge.

Insignia: 'Primer Nivel Completado'
  Criterio: EXISTS un registro en progress donde user_id = userId AND is_completed = true

Insignia: 'Quiz Perfecto'
  Criterio: EXISTS un quiz_attempt donde user_id = userId AND score = 100

Insignia: 'Racha de 7 días'
  Criterio: el usuario tiene registros en exercise_attempt o quiz_attempt
            en 7 fechas (DATE) distintas y consecutivas hasta hoy

Para la racha:
  SELECT DISTINCT DATE(created_at) as day
  FROM (
    SELECT created_at FROM exercise_attempt WHERE user_id = :userId
    UNION ALL
    SELECT created_at FROM quiz_attempt WHERE user_id = :userId
  ) t
  ORDER BY day DESC
  LIMIT 30
  → Verifica que los primeros 7 días sean consecutivos

Retorna: array de badges otorgadas en esta llamada (puede ser vacío)
```

### 2.3 `getLeaderboard(programId, weekNumber, year)`
```
Retorna top 20 de weekly_score para esa semana,
filtrando por users.program_id = programId.
JOIN con users para traer full_name y profile_level.
Ordenado por total_score DESC.
```

### 2.4 `getHeatmap(userId)`
```
Retorna los días activos de los últimos 90 días.
Un día es "activo" si tiene al menos 1 registro en exercise_attempt
o quiz_attempt.

SQL base:
  SELECT DATE(created_at) as day, COUNT(*) as actions
  FROM (
    SELECT created_at FROM exercise_attempt WHERE user_id = :userId
    UNION ALL
    SELECT created_at FROM quiz_attempt WHERE user_id = :userId
  ) t
  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
  GROUP BY DATE(created_at)
  ORDER BY day ASC

Retorna: [ { day: '2026-05-01', actions: 5 }, ... ]
```

### 2.5 `getWeeklyActivity(userId)`
```
Retorna cantidad de acciones por día de la semana ACTUAL (lunes a domingo).
Retorna array de 7 elementos:
  [ { dayName: 'Lunes', date: '...', actions: 3 }, ... ]
```

### 2.6 `getScoreHistory(userId, quizId)`
```
Retorna historial de intentos de un quiz específico.
  SELECT attempt_number, score, created_at, is_passed
  FROM quiz_attempt
  WHERE user_id = :userId AND quiz_id = :quizId
  ORDER BY attempt_number ASC

Retorna: [ { attemptNumber: 1, score: 65, isPassed: false, date: '...' }, ... ]
```

### 2.7 `getUserGamificationProfile(userId)`
```
Retorna en un solo objeto:
{
  xpPoints,
  profileLevel,
  xpToNext,           ← usa xpToNextLevel()
  badges: [...],      ← todas las insignias del usuario con earned_at
  weeklyRank: {       ← posición y puntaje de la semana actual
    totalScore,
    rankPosition
  }
}
```

---

## ✅ TAREA 3 — `gamification.controller.js`

Un controlador por endpoint. Maneja errores con try/catch y responde con:
```js
// Éxito:
res.status(200).json({ success: true, data: { ... } })

// Error 404:
res.status(404).json({ success: false, message: 'Recurso no encontrado' })

// Error 500:
res.status(500).json({ success: false, message: error.message })
```

---

## ✅ TAREA 4 — `gamification.routes.js`

```
GET  /gamification/profile/:userId
     → getUserGamificationProfile(userId)

GET  /gamification/leaderboard?programId=&week=&year=
     → getLeaderboard(programId, weekNumber, year)
     Si no llegan week y year, usa la semana actual.

GET  /gamification/heatmap/:userId
     → getHeatmap(userId)

GET  /gamification/weekly-activity/:userId
     → getWeeklyActivity(userId)

GET  /gamification/score-history/:userId/:quizId
     → getScoreHistory(userId, quizId)

POST /gamification/add-xp
     Body: { userId, amount, reason }
     reason: 'EXERCISE_CORRECT' | 'QUIZ_PASSED' | 'QUIZ_PERFECT' | 'STREAK_BONUS'
     → addXP(userId, amount) + checkAndAwardBadges(userId)
     Retorna: { xpAdded, levelUp, newLevel, badgesEarned }

GET  /gamification/badges
     → Devuelve catálogo completo de badges (tabla badge)

GET  /gamification/badges/:userId
     → Devuelve badges del usuario con earned_at
```

Todas las rutas deben pasar por el middleware de autenticación ya existente en el proyecto.

---

## ✅ TAREA 5 — `gamification.cron.js`

Job que se ejecuta cada lunes a las 00:05.
Usa `node-cron` (ya debe estar en las dependencias, si no: `npm install node-cron`).

```
Cron schedule: '5 0 * * 1'   ← lunes a las 00:05

Lógica:
1. Obtener todos los users donde is_active = true
2. Para cada user, calcular rank_position en la semana que acaba de terminar:
   - Agrupar weekly_score por week_number/year del programa del user
   - Ordenar por total_score DESC
   - Asignar rank_position secuencial
3. Crear registros weekly_score vacíos (total_score = 0) para la semana nueva
   para todos los usuarios activos
4. Loggear: "Leaderboard recalculado: semana X año Y — N usuarios procesados"
```

---

## ✅ TAREA 6 — XP por acción (constantes)

Crea un archivo `gamification.constants.js`:

```js
const XP_REWARDS = {
  EXERCISE_CORRECT:  10,
  QUIZ_PASSED:       50,
  QUIZ_PERFECT:     100,   // se suma al QUIZ_PASSED (total 150)
  STREAK_BONUS:      70,   // al completar racha de 7 días
};

const PROFILE_LEVELS = [
  { name: 'Novato',          minXP: 0    },
  { name: 'Practicante',     minXP: 100  },
  { name: 'Intermedio',      minXP: 300  },
  { name: 'Avanzado',        minXP: 600  },
  { name: 'Experto Clínico', minXP: 1000 },
];

module.exports = { XP_REWARDS, PROFILE_LEVELS };
```

---

## ✅ TAREA 7 — Seed de badges

Crea un archivo `gamification.seed.js` que inserte las 3 badges base si no existen:

```js
// Usar INSERT IGNORE o verificar antes de insertar
// Badges a insertar:
[
  { name: 'Primer Nivel Completado', criteria: 'Completar el primer RAP' },
  { name: 'Quiz Perfecto',           criteria: 'Obtener 100% en cualquier quiz' },
  { name: 'Racha de 7 días',         criteria: 'Estudiar 7 días consecutivos' },
]
```

---

## 🚫 RESTRICCIONES IMPORTANTES

1. **NO modifiques** tablas fuera de: `users` (solo xp_points y profile_level), `badge`, `user_badge`, `weekly_score`.
2. **NO crees** migraciones nuevas — el schema ya existe en la BD.
3. **NO toques** el módulo de autenticación ni el de contenido (levels, rap, vocabulary, etc.).
4. Toda la lógica de negocio va en `gamification.service.js`, los controladores solo orquestan.
5. Usa **raw queries o el ORM existente** — no instales ORMs nuevos.
6. El endpoint `POST /gamification/add-xp` es el único punto de entrada para sumar XP. Los demás módulos lo llaman internamente cuando el usuario completa un ejercicio o quiz.

---

## 📋 ORDEN DE IMPLEMENTACIÓN SUGERIDO

```
1. gamification.constants.js   ← sin dependencias
2. gamification.helpers.js     ← usa constants
3. gamification.seed.js        ← inserta badges base
4. gamification.service.js     ← núcleo del módulo
5. gamification.controller.js  ← usa service
6. gamification.routes.js      ← usa controller
7. gamification.cron.js        ← usa service
8. Registrar rutas en app.js / index.js principal
9. Ejecutar seed al iniciar la app
```

---

## 🧪 PRUEBAS MÍNIMAS (para verificar que funciona)

Al terminar, verifica manualmente con Postman o Thunder Client:

```
1. POST /gamification/add-xp
   { "userId": "<id_real>", "amount": 50, "reason": "QUIZ_PASSED" }
   → Debe retornar xpAdded: 50 y el nuevo profile_level

2. GET /gamification/profile/<userId>
   → Debe retornar xpPoints, profileLevel, badges, weeklyRank

3. GET /gamification/leaderboard?programId=<id>
   → Debe retornar array ordenado por puntaje

4. GET /gamification/heatmap/<userId>
   → Debe retornar array de días (puede estar vacío si no hay attempts)
```

---

*SmashCode — Módulo de Gamificación | Prompt para Antigravity Agent | Mayo 2026*
