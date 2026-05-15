// ============================================
// SHARED COMPONENTS — SmashCode
// Reutilizable en todas las páginas
// ============================================

// --- SIDEBAR COMPONENT ---
function renderSidebar(activePage) {
    const pages = [
        { id: 'aprender',     href: '/',                 icon: 'fa-graduation-cap',  label: 'APRENDER' },
        { id: 'vocabulario',   href: '/vocabulario.html',  icon: 'fa-book-medical',    label: 'VOCABULARIO' },
        { id: 'dialogos',      href: '/dialogos.html',     icon: 'fa-comments',        label: 'DIÁLOGOS' },
        { id: 'ejercicios',    href: '/ejercicios.html',   icon: 'fa-clipboard-check', label: 'EJERCICIOS' },
        { id: 'perfil',        href: '/perfil.html',       icon: 'fa-user-nurse',      label: 'PERFIL' },
        { id: 'mas',           href: '#',                  icon: 'fa-ellipsis',        label: 'MÁS' },
    ];

    const nav = document.getElementById('main-sidebar');
    if (!nav) return;

    nav.innerHTML = `
        <div class="logo"><span>SmashCode</span></div>
        <ul class="nav-links">
            ${pages.map(p => `
                <li class="${p.id === activePage ? 'active' : ''}">
                    <a href="${p.href}"><i class="fas ${p.icon}"></i> ${p.label}</a>
                </li>
            `).join('')}
        </ul>
    `;
}

// --- PROGRESS SYSTEM (localStorage) ---
const PROGRESS_KEY = 'smashcode_progress';

function getProgress() {
    let parsed = null;
    const stored = localStorage.getItem(PROGRESS_KEY);
    
    if (stored) {
        try {
            parsed = JSON.parse(stored);
            // Verify data integrity for the new array-based schema
            if (!parsed.sections || !Array.isArray(parsed.sections) || !parsed.currentCompetencia) {
                parsed = null; // Force reset if outdated
            }
        } catch (e) {
            parsed = null;
        }
    }

    if (parsed) return parsed;
    
    const defaultLessons = [
        { id: 1, title: 'Terminología Básica',        completed: false },
        { id: 2, title: 'Instrumentos y Formas',      completed: false },
        { id: 3, title: 'Protocolos de Administración',completed: false },
        { id: 4, title: 'Evaluación Final',            completed: false },
    ];

    return {
        currentCompetencia: 'ADM. MEDICAMENTOS',
        sections: [
            {
                id: 'via_oral',
                title: 'Vía Oral y Tópica',
                icon: 'fa-star',
                totalLessons: 4,
                completedLessons: 0,
                lessons: JSON.parse(JSON.stringify(defaultLessons))
            },
            {
                id: 'via_iv',
                title: 'Vía Intravenosa',
                icon: 'fa-book',
                totalLessons: 4,
                completedLessons: 0,
                lessons: JSON.parse(JSON.stringify(defaultLessons))
            },
            {
                id: 'via_subcutanea',
                title: 'Vía Subcutánea',
                icon: 'fa-star',
                totalLessons: 4,
                completedLessons: 0,
                lessons: JSON.parse(JSON.stringify(defaultLessons))
            },
            {
                id: 'via_intramuscular',
                title: 'Vía Intramuscular',
                icon: 'fa-star',
                totalLessons: 4,
                completedLessons: 0,
                lessons: JSON.parse(JSON.stringify(defaultLessons))
            }
        ]
    };
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function completeLesson(sectionId, lessonId) {
    const progress = getProgress();
    const section = progress.sections.find(s => s.id === sectionId);
    if (!section) return;

    const lesson = section.lessons.find(l => l.id === lessonId);
    if (lesson && !lesson.completed) {
        lesson.completed = true;
        section.completedLessons = section.lessons.filter(l => l.completed).length;
    }
    saveProgress(progress);
    return section;
}

function getNextLesson(sectionId) {
    const progress = getProgress();
    const section = progress.sections.find(s => s.id === sectionId);
    if (!section) return null;
    return section.lessons.find(l => !l.completed) || null;
}

function isSectionComplete(sectionId) {
    const progress = getProgress();
    const section = progress.sections.find(s => s.id === sectionId);
    if (!section) return false;
    return section.completedLessons >= section.totalLessons;
}
