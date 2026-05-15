// ============================================
// APP.JS — SmashCode (Página principal - Aprender)
// Usa shared.js para sidebar y progreso
// ============================================

const USER_ID = 'user-demo-123';
const API_BASE = '/api/gamification';
const SECTION_ID = 'via_oral_topica';

// Node icons for the path (4 lessons + chest + trophy)
const NODE_ICONS = [
    { type: 'lesson', icon: 'fa-star' },
    { type: 'lesson', icon: 'fa-book' },
    { type: 'lesson', icon: 'fa-star' },
    { type: 'lesson', icon: 'fa-star' },
    { type: 'chest',  icon: 'fa-box-open' },
    { type: 'trophy', icon: 'fa-trophy' },
];

const OFFSETS = ['', '', 'offset-right', 'offset-left', '', 'offset-right'];

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar('aprender');
    renderPath();
    loadProfile();
});

function renderPath() {
    const progress = getProgress();
    const container = document.getElementById('path-container');

    // Update header
    document.getElementById('header-competencia').innerHTML =
        `<i class="fas fa-arrow-left"></i> COMPETENCIA: ${progress.currentCompetencia}`;
    
    // Header title is the title of the first active section
    let activeSec = progress.sections.find(s => !isSectionComplete(s.id)) || progress.sections[progress.sections.length - 1];
    document.getElementById('header-title').textContent = activeSec.title;

    container.innerHTML = '';

    const OFFSETS = ['', '', 'offset-right', 'offset-left', '', 'offset-right'];
    let allComplete = true;
    let nextLessonGlobal = null;
    let activeSectionGlobal = null;

    progress.sections.forEach((section, i) => {
        const div = document.createElement('div');
        const offset = OFFSETS[i % OFFSETS.length];
        const sectionComplete = isSectionComplete(section.id);
        const nextLes = getNextLesson(section.id);
        
        if (!sectionComplete) allComplete = false;

        let nodeClass = '';
        let iconHtml = '';
        let isActive = false;
        let showTooltip = false;

        // Active section is the FIRST section that is not complete
        const isFirstIncomplete = !sectionComplete && progress.sections.findIndex(s => !isSectionComplete(s.id)) === i;

        if (sectionComplete) {
            nodeClass = 'star completed';
            iconHtml = '<i class="fas fa-check"></i>';
        } else if (isFirstIncomplete) {
            nodeClass = 'star';
            iconHtml = `<i class="fas ${section.icon}"></i>`;
            isActive = true;
            showTooltip = true;
            nextLessonGlobal = nextLes;
            activeSectionGlobal = section;
        } else {
            nodeClass = 'star-locked';
            iconHtml = `<i class="fas ${section.icon}"></i>`;
        }

        div.className = `path-item ${isActive ? 'current' : 'locked'} ${offset}`;
        div.innerHTML = `
            <div class="node-wrapper">
                ${showTooltip && nextLes ? `<span class="tooltip" id="start-tooltip">EMPEZAR</span>` : ''}
                <div class="node ${nodeClass}" ${isActive ? 'id="star-node"' : ''}>
                    ${iconHtml}
                </div>
                ${isActive ? renderProgressArc(section) : ''}
            </div>
        `;
        container.appendChild(div);
    });

    // Render Chest and Trophy
    const extraNodes = [
        { type: 'chest', icon: 'fa-box-open' },
        { type: 'trophy', icon: 'fa-trophy' }
    ];

    extraNodes.forEach((node, idx) => {
        const div = document.createElement('div');
        const i = progress.sections.length + idx;
        const offset = OFFSETS[i % OFFSETS.length];
        div.className = `path-item ${allComplete ? 'completed' : 'locked'} ${offset}`;

        let nodeClass = node.type;
        if (allComplete) nodeClass += '-complete';
        
        div.innerHTML = `
            <div class="node-wrapper">
                <div class="node ${nodeClass}"><i class="fas ${node.icon}"></i></div>
            </div>
        `;
        container.appendChild(div);
    });

    // Attach click to active node
    const starNode = document.getElementById('star-node');
    if (starNode && nextLessonGlobal && activeSectionGlobal) {
        starNode.addEventListener('click', () => openPopover(nextLessonGlobal, activeSectionGlobal));
    }
}

function renderProgressArc(section) {
    const pct = (section.completedLessons / section.totalLessons) * 100;
    const radius = 45; // Matches the 98px total diameter of inactive rings (90 + 8)
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    return `
        <svg class="progress-ring" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#e5e5e5" stroke-width="8"/>
            <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#58cc02" stroke-width="8"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                    stroke-linecap="round" transform="rotate(-90 50 50)"/>
        </svg>
    `;
}

function openPopover(nextLesson, section) {
    if (!nextLesson) return;

    const overlay = document.getElementById('popover-overlay');
    const popoverBox = document.querySelector('.popover-box');
    const starNode = document.getElementById('star-node');
    const tooltip = document.getElementById('start-tooltip');

    // Position
    const rect = starNode.getBoundingClientRect();
    popoverBox.style.left = (rect.left + rect.width / 2 - 140) + 'px';
    popoverBox.style.top = (rect.bottom + 15) + 'px';

    // Content
    document.getElementById('popover-title').textContent = section.title;
    document.getElementById('popover-subtitle').textContent =
        `Lección ${nextLesson.id} de ${section.totalLessons}`;

    // Button
    const btn = document.getElementById('popover-btn');
    btn.textContent = 'EMPEZAR +10 EXP';
    btn.onclick = () => {
        window.location.href = `/lesson.html?section=${SECTION_ID}&lesson=${nextLesson.id}`;
    };

    overlay.style.display = 'block';
    if (tooltip) tooltip.style.display = 'none';
}

function closePopover() {
    document.getElementById('popover-overlay').style.display = 'none';
    const tooltip = document.getElementById('start-tooltip');
    if (tooltip) tooltip.style.display = '';
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/profile/${USER_ID}`);
        const { data } = await res.json();
        if (data) {
            const xpEl = document.getElementById('total-xp');
            if (xpEl) xpEl.innerText = `${data.xpPoints} XP`;
        }
    } catch (err) {
        console.error('Error loading profile:', err);
    }
}
