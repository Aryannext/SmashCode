// ============================================
// CHAT ENGINE — SmashCode (Diálogos Clínicos)
// ============================================

// Predefined conversation flows per scenario
const scenarios = {
    intake: {
        title: 'Patient Intake',
        level: 'Nivel Básico',
        context: 'Eres un enfermero/a atendiendo a un paciente que acaba de llegar al hospital. Debes recoger sus datos personales y motivo de consulta <strong>en inglés</strong>.',
        flow: [
            {
                ai: "Hello! Welcome to the clinic. I'm Nurse Smith. What is your name, please?",
                aiTranslation: "¡Hola! Bienvenido a la clínica. Soy la enfermera Smith. ¿Cuál es su nombre, por favor?",
                expectedKeywords: ['name', 'my', 'is', 'i am', "i'm"],
                hint: 'Responde con tu nombre. Ejemplo: "My name is María" o "I am Juan"'
            },
            {
                ai: "Nice to meet you. How old are you?",
                aiTranslation: "Mucho gusto. ¿Cuántos años tiene?",
                expectedKeywords: ['years', 'old', 'i am', "i'm"],
                hint: 'Indica tu edad. Ejemplo: "I am 25 years old"'
            },
            {
                ai: "Thank you. What brings you to the hospital today? What are your symptoms?",
                aiTranslation: "Gracias. ¿Qué lo trae al hospital hoy? ¿Cuáles son sus síntomas?",
                expectedKeywords: ['pain', 'headache', 'fever', 'cough', 'feel', 'sick', 'hurt', 'stomach', 'throat'],
                hint: 'Describe tus síntomas. Ejemplo: "I have a headache" o "I feel pain in my stomach"'
            },
            {
                ai: "I understand. How long have you had these symptoms?",
                aiTranslation: "Entiendo. ¿Desde cuándo tiene estos síntomas?",
                expectedKeywords: ['days', 'hours', 'week', 'since', 'yesterday', 'today', 'ago'],
                hint: 'Indica el tiempo. Ejemplo: "Since yesterday" o "For two days"'
            },
            {
                ai: "Are you currently taking any medication?",
                aiTranslation: "¿Está tomando algún medicamento actualmente?",
                expectedKeywords: ['no', 'yes', 'take', 'taking', 'medicine', 'medication', 'aspirin', 'ibuprofen'],
                hint: 'Responde si tomas medicamentos. Ejemplo: "Yes, I take aspirin" o "No, I am not taking any medication"'
            },
            {
                ai: "Do you have any allergies we should know about?",
                aiTranslation: "¿Tiene alguna alergia que debamos saber?",
                expectedKeywords: ['no', 'yes', 'allergy', 'allergic', 'penicillin', 'none', 'not'],
                hint: 'Indica tus alergias. Ejemplo: "I am allergic to penicillin" o "No, I don\'t have any allergies"'
            },
            {
                ai: "Perfect. The doctor will see you shortly. Please wait in the waiting area. Feel better soon!",
                aiTranslation: "Perfecto. El doctor lo verá en breve. Por favor espere en la sala de espera. ¡Que se mejore pronto!",
                expectedKeywords: null, // Final message, no response needed
                hint: null
            }
        ]
    },
    vitals: {
        title: 'Taking Vital Signs',
        level: 'Nivel Básico',
        context: 'Estás tomando los signos vitales de un paciente. Debes explicarle cada procedimiento <strong>en inglés</strong>.',
        flow: [
            {
                ai: "Good morning! I'm going to check your vital signs today. Is that okay?",
                aiTranslation: "¡Buenos días! Voy a revisar sus signos vitales hoy. ¿Está bien?",
                expectedKeywords: ['yes', 'ok', 'okay', 'sure', 'of course'],
                hint: 'Acepta el procedimiento. Ejemplo: "Yes, of course" o "Sure, go ahead"'
            },
            {
                ai: "First, I'll take your temperature. Please open your mouth. Your temperature is 37.2°C. That's normal!",
                aiTranslation: "Primero, voy a tomar su temperatura. Abra la boca por favor. Su temperatura es 37.2°C. ¡Es normal!",
                expectedKeywords: ['good', 'great', 'thank', 'normal', 'okay'],
                hint: 'Responde sobre la temperatura. Ejemplo: "That\'s good" o "Thank you"'
            },
            {
                ai: "Now I need to check your blood pressure. Please extend your left arm and relax. Your blood pressure is 120/80. Very good!",
                aiTranslation: "Ahora necesito revisar su presión arterial. Extienda su brazo izquierdo y relájese. Su presión es 120/80. ¡Muy bien!",
                expectedKeywords: ['normal', 'good', 'what', 'mean', 'thank', 'okay'],
                hint: 'Pregunta o comenta sobre los resultados. Ejemplo: "Is that normal?" o "What does that mean?"'
            },
            {
                ai: "Your vital signs look great! Everything is within normal range. The doctor will review the results.",
                aiTranslation: "¡Sus signos vitales se ven bien! Todo está dentro del rango normal. El doctor revisará los resultados.",
                expectedKeywords: null,
                hint: null
            }
        ]
    },
    medication: {
        title: 'Medication Administration',
        level: 'Nivel Intermedio',
        context: 'Debes informar al paciente sobre su medicamento, dosis, vía de administración y posibles efectos secundarios <strong>en inglés</strong>.',
        flow: [
            {
                ai: "Hello. The doctor has prescribed medication for you. Do you have any questions before we begin?",
                aiTranslation: "Hola. El doctor le ha recetado un medicamento. ¿Tiene alguna pregunta antes de empezar?",
                expectedKeywords: ['what', 'which', 'medicine', 'medication', 'yes', 'no', 'tell'],
                hint: 'Pregunta sobre el medicamento. Ejemplo: "What medication is it?" o "Yes, what is it for?"'
            },
            {
                ai: "You will take Amoxicillin 500mg, three times a day, after meals. This is an antibiotic for your infection.",
                aiTranslation: "Tomará Amoxicilina 500mg, tres veces al día, después de las comidas. Es un antibiótico para su infección.",
                expectedKeywords: ['how', 'long', 'days', 'side', 'effects', 'food', 'take', 'understand'],
                hint: 'Pregunta sobre la duración o efectos. Ejemplo: "How long should I take it?" o "Are there any side effects?"'
            },
            {
                ai: "Take it for 7 days. Possible side effects include nausea and diarrhea. If you experience a rash, stop taking it and call us immediately.",
                aiTranslation: "Tómelo por 7 días. Los posibles efectos secundarios incluyen náuseas y diarrea. Si presenta sarpullido, deje de tomarlo y llámenos de inmediato.",
                expectedKeywords: ['understand', 'okay', 'thank', 'got', 'will', 'rash', 'stop'],
                hint: 'Confirma que entiendes. Ejemplo: "I understand, thank you" o "Okay, I will follow the instructions"'
            },
            {
                ai: "Remember: take it with food, complete the full course, and don't skip any doses. Do you have any other questions?",
                aiTranslation: "Recuerde: tómelo con comida, complete el tratamiento completo y no omita ninguna dosis. ¿Tiene alguna otra pregunta?",
                expectedKeywords: null,
                hint: null
            }
        ]
    },
    emergency: {
        title: 'Emergency Room',
        level: 'Nivel Avanzado',
        context: 'Estás en la sala de emergencias realizando un triaje rápido. Debes comunicarte con urgencia y claridad <strong>en inglés</strong>.',
        flow: [
            {
                ai: "Emergency department, Nurse Davis speaking. What happened? Can you describe the situation?",
                aiTranslation: "Departamento de emergencias, habla la enfermera Davis. ¿Qué pasó? ¿Puede describir la situación?",
                expectedKeywords: ['accident', 'fell', 'pain', 'bleeding', 'chest', 'breath', 'hurt', 'emergency'],
                hint: 'Describe la emergencia. Ejemplo: "There was an accident" o "I have severe chest pain"'
            },
            {
                ai: "Stay calm. On a scale of 1 to 10, how severe is the pain?",
                aiTranslation: "Mantenga la calma. En una escala del 1 al 10, ¿qué tan severo es el dolor?",
                expectedKeywords: ['1','2','3','4','5','6','7','8','9','10','severe','mild','moderate'],
                hint: 'Indica el nivel de dolor. Ejemplo: "It\'s about 8 out of 10" o "The pain is severe"'
            },
            {
                ai: "We're going to help you right away. A doctor will see you immediately. Please try to stay still.",
                aiTranslation: "Vamos a ayudarle de inmediato. Un doctor lo verá inmediatamente. Por favor intente quedarse quieto.",
                expectedKeywords: null,
                hint: null
            }
        ]
    }
};

let currentScenario = null;
let currentStep = 0;

function init() {
    // Get scenario from URL
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get('scenario') || 'intake';
    currentScenario = scenarios[scenarioId];

    if (!currentScenario) {
        currentScenario = scenarios.intake;
    }

    // Update header
    document.getElementById('scenario-title').textContent = currentScenario.title;
    document.getElementById('scenario-level').textContent = currentScenario.level;
    document.getElementById('chat-context').querySelector('.context-text').innerHTML =
        `<strong>Escenario:</strong> ${currentScenario.context}`;

    // Start conversation
    currentStep = 0;
    setTimeout(() => showAIMessage(), 800);
}

function showAIMessage() {
    if (currentStep >= currentScenario.flow.length) return;

    const step = currentScenario.flow[currentStep];
    const messagesDiv = document.getElementById('chat-messages');

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    setTimeout(() => {
        // Remove typing
        typing.remove();

        // Add AI message
        const msg = document.createElement('div');
        msg.className = 'message nurse-ai';
        msg.innerHTML = `
            <span class="msg-label"><i class="fas fa-robot"></i> PACIENTE</span>
            ${step.ai}
            <span class="msg-translation">${step.aiTranslation}</span>
        `;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // If final message (no response needed)
        if (step.expectedKeywords === null) {
            document.querySelector('.chat-input-bar').innerHTML = `
                <button class="send-btn" style="width:100%; border-radius:15px; font-size:16px; padding:15px;" 
                        onclick="window.location.href='/dialogos.html'">
                    <i class="fas fa-check"></i> &nbsp; DIÁLOGO COMPLETADO — VOLVER
                </button>
            `;
        }
    }, 1200);
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    const messagesDiv = document.getElementById('chat-messages');
    const step = currentScenario.flow[currentStep];

    // Add user message
    const msg = document.createElement('div');
    msg.className = 'message patient';
    msg.innerHTML = `
        <span class="msg-label">TÚ (ENFERMERO/A)</span>
        ${text}
    `;
    messagesDiv.appendChild(msg);
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Check if response contains expected keywords
    const lowerText = text.toLowerCase();
    const hasKeyword = step.expectedKeywords.some(kw => lowerText.includes(kw));

    if (!hasKeyword) {
        // Show correction/hint
        const banner = document.getElementById('correction-banner');
        const corrText = document.getElementById('correction-text');
        corrText.innerHTML = `<strong>💡 Sugerencia:</strong> ${step.hint}`;
        banner.style.display = 'flex';
    } else {
        // Hide correction if visible
        document.getElementById('correction-banner').style.display = 'none';
    }

    // Move to next step
    currentStep++;
    setTimeout(() => showAIMessage(), 1500);
}

// Enter key to send
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Start
init();
