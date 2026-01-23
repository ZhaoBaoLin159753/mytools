// Game State
const state = {
    stage: 'welcome', // welcome, role, p1_game, interim, p2_game, result
    p1Role: '', // 'male' or 'female'
    p2Role: '',
    selectedQuestions: [],
    currentQuestionIndex: 0,
    p1Answers: {}, // { questionId: optionId }
    p2Answers: {}
};

// Constants
const TOTAL_QUESTIONS_TO_ASK = 10;
const ROLES = {
    male: { label: '男方', icon: '🤵' },
    female: { label: '女方', icon: '👰' }
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    role: document.getElementById('role-selection'),
    game: document.getElementById('game-screen'),
    interim: document.getElementById('interim-screen'),
    result: document.getElementById('result-screen')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
});

function bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => showScreen('role'));
    
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const role = card.dataset.role;
            selectRole(role);
        });
    });

    document.getElementById('p2-start-btn').addEventListener('click', startPlayer2Turn);
    
    document.getElementById('restart-btn').addEventListener('click', () => location.reload());
}

function showScreen(screenName, customStage) {
    // Hide all screens
    Object.values(screens).forEach(s => s.classList.remove('active'));
    // Show target screen
    screens[screenName].classList.add('active');
    
    if (customStage) {
        state.stage = customStage;
    } else {
        state.stage = screenName;
    }
}

function selectRole(role) {
    state.p1Role = role;
    state.p2Role = role === 'male' ? 'female' : 'male';
    
    // Initialize Game Data
    initGame();
    
    // Start P1
    showScreen('game');
    updateGameUI();
}

function initGame() {
    // Randomly select 10 questions
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    state.selectedQuestions = shuffled.slice(0, TOTAL_QUESTIONS_TO_ASK);
    state.currentQuestionIndex = 0;
    state.p1Answers = {};
    state.p2Answers = {};
}

function updateGameUI() {
    const isP1 = state.stage === 'game'; // If stage is 'game', it's P1. 'p2_game' will handle P2 logic sharing same UI? 
    // Wait, let's distinguish stages clearly
    // My showScreen('game') is used for both. I need to know WHO is playing.
    
    const currentPlayerRole = (state.stage === 'game' || state.stage === 'p1_game') ? state.p1Role : state.p2Role;
    const currentRoleData = ROLES[currentPlayerRole];
    
    // Update Badge
    const badge = document.getElementById('current-player-badge');
    badge.textContent = `${currentRoleData.icon} ${currentRoleData.label}作答中`;
    
    // Update Progress
    const currentNum = state.currentQuestionIndex + 1;
    document.getElementById('current-q-num').textContent = currentNum;
    document.getElementById('total-q-num').textContent = TOTAL_QUESTIONS_TO_ASK;
    document.getElementById('progress-fill').style.width = `${(currentNum / TOTAL_QUESTIONS_TO_ASK) * 100}%`;

    // Render Question
    const qData = state.selectedQuestions[state.currentQuestionIndex];
    document.getElementById('question-text').textContent = `${currentNum}. ${qData.question}`;

    // Render Options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    qData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text; // Just text, no A/B/C prefix needed for clean UI
        btn.onclick = () => handleAnswer(qData.id, opt.id);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(questionId, optionId) {
    // Determine which player is answering
    const isP1 = (state.stage === 'game' || state.stage === 'p1_game');
    
    if (isP1) {
        state.p1Answers[questionId] = optionId;
    } else {
        state.p2Answers[questionId] = optionId;
    }

    // Move to next question or finish
    if (state.currentQuestionIndex < TOTAL_QUESTIONS_TO_ASK - 1) {
        state.currentQuestionIndex++;
        
        // Add a small fade effect or just update
        updateGameUI();
    } else {
        finishTurn();
    }
}

function finishTurn() {
    const isP1 = (state.stage === 'game' || state.stage === 'p1_game');
    
    if (isP1) {
        // P1 Finished -> Go to Interim
        state.stage = 'interim'; // Internal state update
        showScreen('interim');
    } else {
        // P2 Finished -> Go to Results
        calculateResults();
    }
}

function startPlayer2Turn() {
    state.currentQuestionIndex = 0;
    showScreen('game', 'p2_game'); // Re-use game screen but set stage to p2_game
    updateGameUI();
}

function calculateResults() {
    let matches = 0;
    const matchList = [];
    const mismatchList = [];

    state.selectedQuestions.forEach(q => {
        const p1OptId = state.p1Answers[q.id];
        const p2OptId = state.p2Answers[q.id];
        
        const p1Text = q.options.find(o => o.id === p1OptId).text;
        const p2Text = q.options.find(o => o.id === p2OptId).text;

        const resultItem = {
            question: q.question,
            p1Answer: p1Text,
            p2Answer: p2Text,
            isMatch: p1OptId === p2OptId
        };

        if (resultItem.isMatch) {
            matches++;
            matchList.push(resultItem);
        } else {
            mismatchList.push(resultItem);
        }
    });

    // Score
    const score = Math.round((matches / TOTAL_QUESTIONS_TO_ASK) * 100);
    
    // Title
    let title = '';
    if (score >= 90) title = "天作之合！非常适合结婚 💖";
    else if (score >= 70) title = "默契十足！适合步入婚姻 💍";
    else if (score >= 50) title = "还有磨合空间，多沟通哦 ☕";
    else title = "差异较大，建议深入谈谈 🤔";

    // Render Results
    document.getElementById('score-number').textContent = score;
    document.getElementById('score-title').textContent = title;
    
    document.getElementById('match-count').textContent = matches;
    document.getElementById('mismatch-count').textContent = TOTAL_QUESTIONS_TO_ASK - matches;

    renderDetails(matchList, 'match-list', true);
    renderDetails(mismatchList, 'mismatch-list', false);

    showScreen('result');
}

function renderDetails(list, containerId, isMatch) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = `detail-item ${isMatch ? 'match' : 'mismatch'}`;
        
        const p1Label = ROLES[state.p1Role].label;
        const p2Label = ROLES[state.p2Role].label;

        div.innerHTML = `
            <div class="q-title">${item.question}</div>
            <div class="answer-row">
                <span><span class="p-label">${p1Label}:</span> ${item.p1Answer}</span>
            </div>
            <div class="answer-row">
                <span><span class="p-label">${p2Label}:</span> ${item.p2Answer}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Global scope function for HTML onclick
window.switchTab = function(type) {
    const btns = document.querySelectorAll('.tab-btn');
    const lists = document.querySelectorAll('.details-list');
    
    btns.forEach(b => b.classList.remove('active'));
    lists.forEach(l => l.classList.remove('active-list'));

    if (type === 'match') {
        btns[0].classList.add('active');
        document.getElementById('match-list').classList.add('active-list');
    } else {
        btns[1].classList.add('active');
        document.getElementById('mismatch-list').classList.add('active-list');
    }
};
