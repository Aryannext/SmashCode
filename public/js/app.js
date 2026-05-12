const USER_ID = 'user-demo-123'; // Mock user ID
const API_BASE = '/api/gamification';

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadLeaderboard();
    loadHeatmap();
    loadBadges();
});

async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/profile/${USER_ID}`);
        const { data } = await res.json();
        
        if (data) {
            document.getElementById('profile-level').innerText = data.profileLevel;
            document.getElementById('total-xp').innerText = `${data.xpPoints} XP`;
            document.getElementById('xp-to-next').innerText = `${data.xpToNext} XP para el siguiente nivel`;
            
            // Calculate progress percentage (simple 0-1000 scale for demo)
            const levelXp = data.xpPoints % 1000; 
            const progress = (levelXp / 1000) * 100;
            document.getElementById('level-progress').style.width = `${progress}%`;
            
            updateBadgesUI(data.badges);
        }
    } catch (err) {
        console.error('Error loading profile:', err);
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/leaderboard?programId=PROG001`);
        const { data } = await res.json();
        
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        
        data.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-item';
            li.innerHTML = `
                <span class="rank rank-${index + 1}">${index + 1}</span>
                <div class="user-info">
                    <div style="font-weight: 800;">${item.User.full_name}</div>
                    <div style="font-size: 12px; color: var(--duo-text-light);">${item.User.profile_level}</div>
                </div>
                <div style="margin-left: auto; font-weight: 800; color: var(--duo-blue);">${item.total_score} XP</div>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading leaderboard:', err);
    }
}

async function loadHeatmap() {
    try {
        const res = await fetch(`${API_BASE}/heatmap/${USER_ID}`);
        const { data } = await res.json();
        
        const grid = document.getElementById('heatmap');
        grid.innerHTML = '';
        
        // Generate 91 days (13 weeks)
        for (let i = 0; i < 91; i++) {
            const dot = document.createElement('div');
            dot.className = 'heatmap-dot';
            
            // Check if day has activity
            const date = new Date();
            date.setDate(date.getDate() - (90 - i));
            const dateStr = date.toISOString().split('T')[0];
            
            const activity = data.find(d => d.day === dateStr);
            if (activity) {
                const level = Math.min(3, Math.ceil(activity.actions / 2));
                dot.classList.add(`active-${level}`);
            }
            
            grid.appendChild(dot);
        }
    } catch (err) {
        console.error('Error loading heatmap:', err);
    }
}

async function loadBadges() {
    try {
        const res = await fetch(`${API_BASE}/badges`);
        const { data } = await res.json();
        
        const list = document.getElementById('badges-list');
        list.innerHTML = '';
        
        data.forEach(badge => {
            const div = document.createElement('div');
            div.className = 'badge-item';
            div.id = `badge-${badge.name.replace(/\s+/g, '-').toLowerCase()}`;
            div.innerHTML = `
                <img src="${badge.icon_url}" alt="${badge.name}">
                <span>${badge.name}</span>
            `;
            list.appendChild(div);
        });
        
        // Mark earned ones
        const userRes = await fetch(`${API_BASE}/badges/${USER_ID}`);
        const userData = await userRes.json();
        updateBadgesUI(userData.data.map(ub => ub.Badge));
        
    } catch (err) {
        console.error('Error loading badges:', err);
    }
}

function updateBadgesUI(earnedBadges) {
    earnedBadges.forEach(badge => {
        const id = `badge-${badge.name.replace(/\s+/g, '-').toLowerCase()}`;
        const el = document.getElementById(id);
        if (el) el.classList.add('earned');
    });
}

async function addXP(amount, reason) {
    try {
        const res = await fetch(`${API_BASE}/add-xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, amount, reason })
        });
        
        const { data } = await res.json();
        
        if (data.levelUp) {
            showToast(`¡Subiste de nivel! Ahora eres ${data.newLevel}`);
        }
        
        if (data.badgesEarned && data.badgesEarned.length > 0) {
            showToast(`¡Ganaste ${data.badgesEarned.length} insignia(s)!`);
        }
        
        // Refresh data
        loadProfile();
        loadLeaderboard();
        loadHeatmap();
        
    } catch (err) {
        console.error('Error adding XP:', err);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
