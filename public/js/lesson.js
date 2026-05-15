// ============================================
// LESSON ENGINE — SmashCode (Enfermería)
// Usa shared.js para progreso
// ============================================

const API_BASE = '/api/gamification';
const USER_ID = 'user-demo-123';

// Get lesson info from URL
const urlParams = new URLSearchParams(window.location.search);
const SECTION_ID = urlParams.get('section') || 'via_oral_topica';
const LESSON_ID = parseInt(urlParams.get('lesson')) || 1;

// Question banks per lesson
const questionBanks = {
    1: [
        {
            type: 'image-select',
            label: 'TÉRMINO NUEVO',
            question: '¿Cuál de estos es un "termómetro"?',
            options: [
                { icon: 'fa-thermometer-half', text: 'Termómetro', key: '1', correct: true },
                { icon: 'fa-stethoscope',      text: 'Estetoscopio', key: '2', correct: false },
                { icon: 'fa-syringe',          text: 'Jeringa', key: '3', correct: false }
            ],
            correctAnswer: 'Termómetro'
        },
        {
            type: 'text-select',
            label: 'SELECCIONA LA RESPUESTA',
            question: '¿Cuál es la vía de administración de un medicamento que se aplica sobre la piel?',
            options: [
                { text: 'Vía Oral', correct: false },
                { text: 'Vía Tópica', correct: true },
                { text: 'Vía Intravenosa', correct: false },
                { text: 'Vía Subcutánea', correct: false }
            ],
            correctAnswer: 'Vía Tópica'
        },
        {
            type: 'image-select',
            label: 'IDENTIFICA',
            question: '¿Cuál de estos se usa para medir la presión arterial?',
            options: [
                { icon: 'fa-syringe',       text: 'Jeringa', key: '1', correct: false },
                { icon: 'fa-heart-pulse',   text: 'Tensiómetro', key: '2', correct: true },
                { icon: 'fa-pills',         text: 'Pastillas', key: '3', correct: false }
            ],
            correctAnswer: 'Tensiómetro'
        }
    ],
    2: [
        {
            type: 'text-select',
            label: 'CONOCIMIENTO CLÍNICO',
            question: '¿Qué significa "Administración por Vía Oral"?',
            options: [
                { text: 'Inyectar el medicamento en el músculo', correct: false },
                { text: 'Aplicar el medicamento sobre la piel', correct: false },
                { text: 'El paciente ingiere el medicamento por la boca', correct: true },
                { text: 'Introducir el medicamento por el recto', correct: false }
            ],
            correctAnswer: 'El paciente ingiere el medicamento por la boca'
        },
        {
            type: 'image-select',
            label: 'TÉRMINO NUEVO',
            question: '¿Cuál de estos es una "cápsula"?',
            options: [
                { icon: 'fa-bandage',  text: 'Vendaje', key: '1', correct: false },
                { icon: 'fa-capsules', text: 'Cápsula', key: '2', correct: true },
                { icon: 'fa-vial',     text: 'Ampolla', key: '3', correct: false }
            ],
            correctAnswer: 'Cápsula'
        },
        {
            type: 'text-select',
            label: 'FORMAS FARMACÉUTICAS',
            question: '¿Cuál de estos NO es una forma farmacéutica oral?',
            options: [
                { text: 'Tableta', correct: false },
                { text: 'Jarabe', correct: false },
                { text: 'Parche transdérmico', correct: true },
                { text: 'Cápsula', correct: false }
            ],
            correctAnswer: 'Parche transdérmico'
        }
    ],
    3: [
        {
            type: 'text-select',
            label: 'PROTOCOLO CLÍNICO',
            question: '¿Cuál es el primer paso antes de administrar un medicamento vía oral?',
            options: [
                { text: 'Verificar la identidad del paciente y la orden médica', correct: true },
                { text: 'Darle agua al paciente', correct: false },
                { text: 'Abrir la pastilla y triturarla', correct: false },
                { text: 'Registrar en la historia clínica', correct: false }
            ],
            correctAnswer: 'Verificar la identidad del paciente y la orden médica'
        },
        {
            type: 'text-select',
            label: 'LOS 5 CORRECTOS',
            question: '¿Cuál NO es uno de los "5 correctos" de administración de medicamentos?',
            options: [
                { text: 'Paciente correcto', correct: false },
                { text: 'Dosis correcta', correct: false },
                { text: 'Color correcto', correct: true },
                { text: 'Hora correcta', correct: false }
            ],
            correctAnswer: 'Color correcto'
        },
        {
            type: 'text-select',
            label: 'SEGURIDAD DEL PACIENTE',
            question: '¿Qué hacer si el paciente presenta una reacción alérgica al medicamento?',
            options: [
                { text: 'Continuar administrando y esperar', correct: false },
                { text: 'Suspender el medicamento y notificar al médico', correct: true },
                { text: 'Darle más agua', correct: false },
                { text: 'Aumentar la dosis', correct: false }
            ],
            correctAnswer: 'Suspender el medicamento y notificar al médico'
        }
    ],
    4: [
        {
            type: 'text-select',
            label: 'EVALUACIÓN FINAL',
            question: '¿Cuál es la diferencia principal entre crema y ungüento?',
            options: [
                { text: 'El color del envase', correct: false },
                { text: 'La crema tiene base acuosa y el ungüento base oleosa', correct: true },
                { text: 'No hay diferencia', correct: false },
                { text: 'El ungüento es líquido', correct: false }
            ],
            correctAnswer: 'La crema tiene base acuosa y el ungüento base oleosa'
        },
        {
            type: 'image-select',
            label: 'EVALUACIÓN FINAL',
            question: '¿Qué instrumento se usa para escuchar los sonidos del corazón?',
            options: [
                { icon: 'fa-thermometer-half', text: 'Termómetro', key: '1', correct: false },
                { icon: 'fa-stethoscope',      text: 'Estetoscopio', key: '2', correct: true },
                { icon: 'fa-syringe',          text: 'Jeringa', key: '3', correct: false }
            ],
            correctAnswer: 'Estetoscopio'
        },
        {
            type: 'text-select',
            label: 'EVALUACIÓN FINAL',
            question: 'Un paciente debe tomar un medicamento "bid" (bis in die). ¿Qué significa?',
            options: [
                { text: 'Una vez al día', correct: false },
                { text: 'Dos veces al día', correct: true },
                { text: 'Tres veces al día', correct: false },
                { text: 'Cada 8 horas', correct: false }
            ],
            correctAnswer: 'Dos veces al día'
        }
    ]
};

const lessonQuestions = questionBanks[LESSON_ID] || questionBanks[1];
let currentQuestion = 0;
let selectedOption = null;
let hearts = 5;
let xpEarned = 0;
let correctCount = 0;

function init() {
    renderQuestion();
}

function renderQuestion() {
    if (currentQuestion >= lessonQuestions.length) {
        showLessonComplete();
        return;
    }

    const q = lessonQuestions[currentQuestion];
    const container = document.getElementById('lesson-container');
    const progressPercent = (currentQuestion / lessonQuestions.length) * 100;
    document.getElementById('lesson-progress').style.width = `${progressPercent}%`;

    selectedOption = null;
    document.getElementById('btn-check').disabled = true;
    document.getElementById('btn-check').classList.remove('active');

    document.getElementById('feedback-bar').classList.remove('show', 'success', 'error');
    document.getElementById('feedback-bar').style.display = 'none';
    document.getElementById('action-bar').style.display = 'flex';

    if (q.type === 'image-select') {
        container.innerHTML = `
            <span class="question-label">${q.label}</span>
            <h2 class="question-text">${q.question}</h2>
            <div class="options-grid">
                ${q.options.map((opt, i) => `
                    <div class="option-card" onclick="selectOption(this, ${i})" data-index="${i}">
                        <div class="option-icon"><i class="fas ${opt.icon}"></i></div>
                        <span class="option-label">${opt.text}</span>
                        <span class="option-key">${opt.key}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <span class="question-label">${q.label}</span>
            <h2 class="question-text">${q.question}</h2>
            <div class="text-options">
                ${q.options.map((opt, i) => `
                    <div class="text-option" onclick="selectOption(this, ${i})" data-index="${i}">
                        <span class="option-number">${i + 1}</span>
                        <span>${opt.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function selectOption(el, index) {
    document.querySelectorAll('.option-card, .text-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedOption = index;
    document.getElementById('btn-check').disabled = false;
    document.getElementById('btn-check').classList.add('active');
}

function checkAnswer() {
    if (selectedOption === null) return;
    const q = lessonQuestions[currentQuestion];
    const isCorrect = q.options[selectedOption].correct;
    const allCards = document.querySelectorAll('.option-card, .text-option');

    allCards.forEach(card => { card.onclick = null; card.style.cursor = 'default'; });
    allCards.forEach((card, i) => {
        if (q.options[i].correct) card.classList.add('correct');
        if (i === selectedOption && !isCorrect) card.classList.add('wrong');
    });

    document.getElementById('action-bar').style.display = 'none';
    const fb = document.getElementById('feedback-bar');

    if (isCorrect) {
        fb.className = 'feedback-bar show success';
        document.getElementById('feedback-icon').innerHTML = '<i class="fas fa-check-circle"></i>';
        document.getElementById('feedback-title').textContent = '¡Bien hecho!';
        document.getElementById('feedback-detail').textContent = '';
        xpEarned += 10;
        correctCount++;
    } else {
        fb.className = 'feedback-bar show error';
        document.getElementById('feedback-icon').innerHTML = '<i class="fas fa-times-circle"></i>';
        document.getElementById('feedback-title').textContent = 'Solución correcta:';
        document.getElementById('feedback-detail').textContent = q.correctAnswer;
        hearts--;
        document.getElementById('hearts-count').textContent = hearts;
        if (hearts <= 0) {
            setTimeout(() => { alert('¡Se acabaron tus vidas!'); window.location.href = '/'; }, 1500);
            return;
        }
    }
    fb.style.display = 'flex';
}

function nextQuestion() {
    currentQuestion++;
    renderQuestion();
}

function skipQuestion() {
    currentQuestion++;
    renderQuestion();
}

function showLessonComplete() {
    document.getElementById('lesson-progress').style.width = '100%';
    document.getElementById('action-bar').style.display = 'none';
    document.getElementById('feedback-bar').style.display = 'none';

    // Save progress
    completeLesson(SECTION_ID, LESSON_ID);
    const sectionDone = isSectionComplete(SECTION_ID);

    const container = document.getElementById('lesson-container');
    container.innerHTML = `
        <div class="lesson-complete">
            <div class="trophy-icon"><i class="fas ${sectionDone ? 'fa-crown' : 'fa-trophy'}"></i></div>
            <h2>${sectionDone ? '¡Sección Completada!' : '¡Lección Completada!'}</h2>
            <p>Lección ${LESSON_ID} — ${questionBanks[LESSON_ID] ? 'Vía Oral y Tópica' : ''}</p>
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-value">${xpEarned}</div>
                    <div class="stat-label">XP GANADOS</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${correctCount}/${lessonQuestions.length}</div>
                    <div class="stat-label">RESPUESTAS</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${hearts}</div>
                    <div class="stat-label">VIDAS</div>
                </div>
            </div>
            <button class="btn-back-home" onclick="window.location.href='/'">
                CONTINUAR <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;

    // Send XP to API
    fetch(`${API_BASE}/add-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, amount: xpEarned, reason: 'QUIZ_PASSED' })
    }).catch(err => console.error('Error saving XP:', err));
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (currentQuestion >= lessonQuestions.length) return;
    const q = lessonQuestions[currentQuestion];
    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= q.options.length) {
        const cards = document.querySelectorAll('.option-card, .text-option');
        if (cards[keyNum - 1]) selectOption(cards[keyNum - 1], keyNum - 1);
    }
    if (e.key === 'Enter') {
        if (document.getElementById('feedback-bar').classList.contains('show')) nextQuestion();
        else if (selectedOption !== null) checkAnswer();
    }
});

init();
