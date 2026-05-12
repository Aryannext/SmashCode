const XP_REWARDS = {
  EXERCISE_CORRECT:  10,
  QUIZ_PASSED:       50,
  QUIZ_PERFECT:     100,   // se suma al QUIZ_PASSED (total 150)
  STREAK_BONUS:      70,   // al completar racha de 7 días
};

const PROFILE_LEVELS = [
  { name: 'Aspirante Técnico',  minXP: 0    },
  { name: 'Auxiliar Junior',     minXP: 100  },
  { name: 'Técnico en Formación',minXP: 300  },
  { name: 'Técnico Graduado',    minXP: 600  },
  { name: 'Especialista Clínico',minXP: 1000 },
];

module.exports = { XP_REWARDS, PROFILE_LEVELS };
