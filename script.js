// State Management
const state = {
    password: 'iloveyou', // Change this to your desired password
    unlockedContent: [],
    currentScreen: 'password',
    musicPlaying: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    createFloatingHearts();
    setupEventListeners();
    loadSavedProgress();
    checkAutoLogin();
}

// Check if user already logged in
function checkAutoLogin() {
    const isLoggedIn = localStorage.getItem('loveWebsiteLoggedIn');
    if (isLoggedIn === 'true') {
        // Skip password and welcome screen
        document.getElementById('passwordScreen').classList.remove('active');
        document.getElementById('mainContent').classList.add('active');
        state.currentScreen = 'main';
        updateCardStates();
    }
}

// Create Floating Hearts Animation
function createFloatingHearts() {
    const container = document.getElementById('hearts-container');
    const heartSymbols = ['💕', '💖', '💗', '💝', '💘', '❤️', '💓'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 10000);
    }, 500);
}

// Event Listeners Setup
function setupEventListeners() {
    // Password Screen
    const passwordInput = document.getElementById('passwordInput');
    const enterBtn = document.getElementById('enterBtn');
    
    enterBtn.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
    
    // Welcome Screen
    const startBtn = document.getElementById('startExploring');
    startBtn.addEventListener('click', showMainContent);
    
    // Music Toggle
    const musicToggle = document.getElementById('musicToggle');
    musicToggle.addEventListener('click', toggleMusic);
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            switchSection(target);
        });
    });
    
    // Feature Cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', () => handleCardClick(card));
    });
    
    // Activity Cards
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        const btn = card.querySelector('.btn-secondary');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const quizType = card.getAttribute('data-quiz');
            startQuiz(quizType);
        });
    });
    
    // Modal Close
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal on outside click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    });
}

// Password Check
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('passwordError');
    
    if (input.value.toLowerCase() === state.password.toLowerCase()) {
        errorMsg.textContent = '';
        localStorage.setItem('loveWebsiteLoggedIn', 'true');
        showWelcomeScreen();
    } else {
        errorMsg.textContent = '❌ Oops! Try again, sweetheart 💕';
        input.value = '';
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

// Screen Management
function showWelcomeScreen() {
    document.getElementById('passwordScreen').classList.remove('active');
    document.getElementById('welcomeScreen').classList.add('active');
    state.currentScreen = 'welcome';
}

function showMainContent() {
    document.getElementById('welcomeScreen').classList.remove('active');
    document.getElementById('mainContent').classList.add('active');
    state.currentScreen = 'main';
    updateCardStates();
}

function switchSection(sectionId) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Music Control
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    
    if (state.musicPlaying) {
        music.pause();
        btn.classList.remove('playing');
        state.musicPlaying = false;
    } else {
        music.play();
        btn.classList.add('playing');
        state.musicPlaying = true;
    }
}

// Content Management
function handleCardClick(card) {
    const contentType = card.getAttribute('data-content');
    const isUnlocked = state.unlockedContent.includes(contentType);
    
    if (isUnlocked) {
        showContent(contentType);
    } else {
        showUnlockPrompt(contentType);
    }
}

function showUnlockPrompt(contentType) {
    const modal = document.getElementById('quizModal');
    const content = document.getElementById('quizContent');
    
    content.innerHTML = `
        <div class="quiz-container">
            <h2 class="quiz-title">🔒 Content Locked</h2>
            <p style="font-size: 1.1rem; margin-bottom: 30px;">
                Complete a quiz or game to unlock this content! 💝
            </p>
            <button class="btn-primary" onclick="closeModal(); switchSection('activities');">
                Go to Activities
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function unlockContent(contentType) {
    if (!state.unlockedContent.includes(contentType)) {
        state.unlockedContent.push(contentType);
        updateCardStates();
        saveProgress();
    }
}

function updateCardStates() {
    document.querySelectorAll('.feature-card').forEach(card => {
        const contentType = card.getAttribute('data-content');
        const status = card.querySelector('.card-status');
        
        if (state.unlockedContent.includes(contentType)) {
            status.classList.remove('locked');
            status.classList.add('unlocked');
            status.innerHTML = '<i class="fas fa-unlock"></i> Unlocked!';
        }
    });
    
    updateProgressIndicator();
}

function updateProgressIndicator() {
    const total = 6;
    const unlocked = state.unlockedContent.length;
    const percentage = (unlocked / total) * 100;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${unlocked} / ${total} Contents Unlocked`;
        
        if (unlocked === total) {
            progressText.innerHTML = `🎉 All Contents Unlocked! You're Amazing! 💕`;
        }
    }
}

// Quiz System
function startQuiz(quizType) {
    const modal = document.getElementById('quizModal');
    const content = document.getElementById('quizContent');
    
    switch (quizType) {
        case 'crossword':
            content.innerHTML = createCrosswordQuiz();
            break;
        case 'trivia':
            content.innerHTML = createTriviaQuiz();
            initializeTriviaQuiz();
            break;
        case 'memory':
            content.innerHTML = createMemoryGame();
            initializeMemoryGame();
            break;
    }
    
    modal.classList.add('active');
}

// Crossword Quiz
function createCrosswordQuiz() {
    return `
        <div class="quiz-container">
            <h2 class="quiz-title">🎯 Love Crossword</h2>
            <p style="margin-bottom: 20px;">Fill in the crossword with words about us!</p>
            
            <div class="crossword-container">
                <div style="display: grid; grid-template-columns: repeat(10, 40px); gap: 2px; margin: 20px auto; width: fit-content;">
                    ${generateCrosswordGrid()}
                </div>
                
                <div style="text-align: left; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                    <h4 style="margin-bottom: 15px;">Clues:</h4>
                    <div style="display: grid; gap: 10px;">
                        <p><strong>1 Across:</strong> Our first date location (5 letters)</p>
                        <p><strong>2 Down:</strong> Your favorite flower (4 letters)</p>
                        <p><strong>3 Across:</strong> Month we met (5 letters)</p>
                    </div>
                </div>
            </div>
            
            <button class="btn-primary" onclick="checkCrossword()" style="margin-top: 30px;">
                Check Answers
            </button>
        </div>
    `;
}

function generateCrosswordGrid() {
    // Simplified crossword grid
    return `
        <div class="crossword-cell"><input type="text" maxlength="1" data-answer="P"></div>
        <div class="crossword-cell"><input type="text" maxlength="1" data-answer="A"></div>
        <div class="crossword-cell"><input type="text" maxlength="1" data-answer="R"></div>
        <div class="crossword-cell"><input type="text" maxlength="1" data-answer="K"></div>
        <div class="crossword-cell"><input type="text" maxlength="1" data-answer="S"></div>
        <div class="crossword-cell black"></div>
        <div class="crossword-cell black"></div>
        <div class="crossword-cell black"></div>
        <div class="crossword-cell black"></div>
        <div class="crossword-cell black"></div>
    `.repeat(10);
}

function checkCrossword() {
    // Simplified check - in real version, check actual answers
    const content = document.getElementById('quizContent');
    content.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin: 20px 0;">🎉</div>
            <h3 style="font-size: 2rem; margin-bottom: 15px;">Great Job!</h3>
            <div class="success-message">
                ✨ Choose which content to unlock! ✨
            </div>
            <div id="unlockChoices"></div>
        </div>
    `;
    showUnlockChoices();
}

// Trivia Quiz
let currentQuestion = 0;
let triviaScore = 0;

const triviaQuestions = [
    {
        question: "What's my favorite color? 🎨",
        options: ["Pink", "Blue", "Purple", "Red"],
        correct: 0
    },
    {
        question: "What's our song? 🎵",
        options: ["Perfect", "Thinking Out Loud", "All of Me", "Stay"],
        correct: 2
    },
    {
        question: "Where did we first meet? 📍",
        options: ["Coffee Shop", "Park", "School", "Mall"],
        correct: 0
    },
    {
        question: "What's my favorite food? 🍕",
        options: ["Pizza", "Pasta", "Sushi", "Burger"],
        correct: 1
    },
    {
        question: "What do I love most about you? 💕",
        options: ["Your smile", "Your kindness", "Everything", "Your humor"],
        correct: 2
    }
];

function createTriviaQuiz() {
    return `
        <div class="quiz-container">
            <h2 class="quiz-title">❓ Love Trivia</h2>
            <p style="margin-bottom: 20px;">How well do you know us?</p>
            <div id="triviaContent"></div>
        </div>
    `;
}

function initializeTriviaQuiz() {
    currentQuestion = 0;
    triviaScore = 0;
    showTriviaQuestion();
}

function showTriviaQuestion() {
    const content = document.getElementById('triviaContent');
    const question = triviaQuestions[currentQuestion];
    
    content.innerHTML = `
        <div class="quiz-progress" style="text-align: center; margin-bottom: 20px; color: #7f8c8d;">
            Question ${currentQuestion + 1} of ${triviaQuestions.length}
        </div>
        <div class="quiz-question">${question.question}</div>
        <div class="quiz-options">
            ${question.options.map((option, index) => `
                <div class="quiz-option" onclick="selectTriviaAnswer(${index})">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;
}

function selectTriviaAnswer(selectedIndex) {
    const question = triviaQuestions[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });
    
    if (selectedIndex === question.correct) {
        triviaScore++;
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < triviaQuestions.length) {
            showTriviaQuestion();
        } else {
            showTriviaResults();
        }
    }, 1500);
}

function showTriviaResults() {
    const content = document.getElementById('triviaContent');
    const percentage = (triviaScore / triviaQuestions.length) * 100;
    
    let message = '';
    if (percentage === 100) {
        message = 'Perfect! You know me so well! 🥰';
    } else if (percentage >= 80) {
        message = 'Amazing! You really pay attention! 💖';
    } else if (percentage >= 60) {
        message = 'Good job! You know me pretty well! 💕';
    } else {
        message = 'We need to spend more time together! 😊';
    }
    
    content.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin: 20px 0;">🎉</div>
            <h3 style="font-size: 2rem; margin-bottom: 15px;">Quiz Complete!</h3>
            <p style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 10px;">
                ${triviaScore} / ${triviaQuestions.length}
            </p>
            <p style="font-size: 1.1rem; margin-bottom: 30px;">${message}</p>
            <div class="success-message">
                ✨ Choose which content to unlock! ✨
            </div>
            <div id="unlockChoices"></div>
        </div>
    `;
    
    showUnlockChoices();
}

// Memory Game
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function createMemoryGame() {
    return `
        <div class="quiz-container">
            <h2 class="quiz-title">🎴 Memory Match</h2>
            <p style="margin-bottom: 20px;">Match the pairs!</p>
            <div id="memoryGame" style="display: grid; grid-template-columns: repeat(4, 80px); gap: 10px; justify-content: center; margin: 30px auto;">
            </div>
            <div id="memoryStatus" style="text-align: center; margin-top: 20px; font-size: 1.1rem;"></div>
        </div>
    `;
}

function initializeMemoryGame() {
    const symbols = ['💕', '💖', '💗', '💝', '💘', '❤️', '💓', '🌹'];
    memoryCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    
    const game = document.getElementById('memoryGame');
    game.innerHTML = memoryCards.map((symbol, index) => `
        <div class="memory-card" onclick="flipCard(${index})" style="
            width: 80px;
            height: 80px;
            background: var(--primary-color);
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        " data-index="${index}">
            <span style="display: none;">${symbol}</span>
        </div>
    `).join('');
    
    updateMemoryStatus();
}

function flipCard(index) {
    if (flippedCards.length >= 2) return;
    
    const card = document.querySelector(`[data-index="${index}"]`);
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    card.querySelector('span').style.display = 'block';
    card.style.background = 'white';
    flippedCards.push({ index, symbol: memoryCards[index], element: card });
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.symbol === card2.symbol) {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matchedPairs++;
        
        if (matchedPairs === 8) {
            setTimeout(() => {
                document.getElementById('memoryStatus').innerHTML = `
                    <div class="success-message">
                        🎉 Congratulations! Choose which content to unlock!
                    </div>
                    <div id="unlockChoices" style="margin-top: 20px;"></div>
                `;
                showUnlockChoices();
            }, 500);
        }
    } else {
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
        card1.element.querySelector('span').style.display = 'none';
        card2.element.querySelector('span').style.display = 'none';
        card1.element.style.background = 'var(--primary-color)';
        card2.element.style.background = 'var(--primary-color)';
    }
    
    flippedCards = [];
    updateMemoryStatus();
}

function updateMemoryStatus() {
    const status = document.getElementById('memoryStatus');
    if (status) {
        status.textContent = `Matched: ${matchedPairs} / 8`;
    }
}

// Content Display
function showContent(contentType) {
    const modal = document.getElementById('contentModal');
    const content = document.getElementById('modalContent');
    
    let html = '';
    
    switch (contentType) {
        case 'letter':
            html = createLetterContent();
            break;
        case 'music':
            html = createMusicContent();
            break;
        case 'gallery':
            html = createGalleryContent();
            break;
        case 'notes':
            html = createNotesContent();
            break;
        case 'coupons':
            html = createCouponsContent();
            break;
        case 'birthday':
            html = createBirthdayContent();
            break;
    }
    
    content.innerHTML = html;
    modal.classList.add('active');
}

function createLetterContent() {
    return `
        <div class="content-display">
            <h2>💌 My Love Letter to You</h2>
            <div class="letter-content">
                <p>My Dearest Love,</p>
                <br>
                <p>Every moment with you feels like a dream come true. You've brought so much joy, laughter, and love into my life. Your smile brightens my darkest days, and your presence makes everything better.</p>
                <br>
                <p>I want you to know that you are cherished, appreciated, and loved beyond measure. Thank you for being you, for your kindness, your patience, and for choosing to share your life with me.</p>
                <br>
                <p>This website is just a small token of my love for you. I hope it brings a smile to your face and reminds you of how special you are to me.</p>
                <br>
                <p>Forever yours,<br>Your Loving Partner 💕</p>
            </div>
        </div>
    `;
}

function createMusicContent() {
    return `
        <div class="content-display">
            <h2>🎵 Songs That Remind Me of You</h2>
            <p style="text-align: center; margin-bottom: 30px; color: #7f8c8d;">
                Click to play! 🎧
            </p>
            
            <!-- YouTube Player -->
            <div class="youtube-player-container">
                <div id="currentSongInfo" style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: var(--primary-color);">Click a song below to play</h3>
                </div>
                <div id="youtubePlayerWrapper" style="display: none;">
                    <iframe id="youtubePlayer" width="100%" height="315" style="border-radius: 15px; border: none;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
            
            <div class="music-list" style="margin-top: 40px;">
                <div class="music-item" onclick="playYouTubeSong('dQw4w9WgXcQ', 'Perfect - Ed Sheeran', 'Because you\\'re perfect to me')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Perfect - Ed Sheeran</h4>
                        <p>Because you're perfect to me</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                <div class="music-item" onclick="playYouTubeSong('450p7goxZqg', 'All of Me - John Legend', 'I give you all of me')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>All of Me - John Legend</h4>
                        <p>I give you all of me</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                <div class="music-item" onclick="playYouTubeSong('lp-EO5I60KA', 'Thinking Out Loud - Ed Sheeran', 'Our first dance song')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Thinking Out Loud - Ed Sheeran</h4>
                        <p>Our first dance song</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                <div class="music-item" onclick="playYouTubeSong('0put0_a--Ng', 'Make You Feel My Love - Adele', 'I\\'d do anything for you')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Make You Feel My Love - Adele</h4>
                        <p>I'd do anything for you</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                <div class="music-item" onclick="playYouTubeSong('rtOvBOTyX00', 'A Thousand Years - Christina Perri', 'I\\'ll love you for a thousand more')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>A Thousand Years - Christina Perri</h4>
                        <p>I'll love you for a thousand more</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 15px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-bottom: 10px;">🎵 How to Add Your Own Songs:</h4>
                <ol style="color: #856404; line-height: 1.8;">
                    <li>Buka YouTube, cari lagu favorit kamu</li>
                    <li>Copy URL-nya (contoh: https://www.youtube.com/watch?v=<strong>VIDEO_ID</strong>)</li>
                    <li>Edit script.js, ganti VIDEO_ID di function playYouTubeSong</li>
                    <li>Done! Lagu kamu siap diplay!</li>
                </ol>
            </div>
        </div>
    `;
}

// YouTube Music Player
function playYouTubeSong(videoId, title, description) {
    const player = document.getElementById('youtubePlayer');
    const wrapper = document.getElementById('youtubePlayerWrapper');
    const info = document.getElementById('currentSongInfo');
    
    // Show player
    wrapper.style.display = 'block';
    
    // Update iframe with autoplay
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    // Update song info
    info.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 10px;">🎵</div>
        <h3 style="color: var(--primary-color); margin-bottom: 5px;">${title}</h3>
        <p style="color: #7f8c8d;">${description}</p>
    `;
    
    // Highlight active song
    document.querySelectorAll('.music-item').forEach((item) => {
        item.style.background = '#f8f9fa';
        item.style.borderLeft = 'none';
    });
    
    // Highlight clicked song
    event.currentTarget.style.background = 'var(--accent-color)';
    event.currentTarget.style.borderLeft = '4px solid var(--primary-color)';
    
    // Scroll to player
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createGalleryContent() {
    return `
        <div class="content-display">
            <h2>📸 Our Memories Together</h2>
            <p style="text-align: center; margin-bottom: 30px; color: #7f8c8d;">
                Our beautiful moments captured in time 💕
            </p>
            <div class="gallery-grid">
                ${Array(6).fill(0).map((_, i) => `
                    <div class="gallery-item">
                        <div class="gallery-placeholder">
                            ${['💑', '🌹', '💕', '🎂', '🌟', '💝'][i]}
                        </div>
                    </div>
                `).join('')}
            </div>
            <p style="text-align: center; margin-top: 30px; font-style: italic; color: #7f8c8d;">
                (Replace these placeholders with your actual photos!)
            </p>
        </div>
    `;
}

function createNotesContent() {
    return `
        <div class="content-display">
            <h2>📝 Things I Love About You</h2>
            <div class="notes-list">
                <div class="note-item">
                    <h4>Your Smile 😊</h4>
                    <p>Your smile lights up my entire world. It's the first thing I think about in the morning and the last thing I see before I sleep.</p>
                </div>
                <div class="note-item">
                    <h4>Your Kindness 💖</h4>
                    <p>The way you treat everyone with compassion and understanding amazes me every day.</p>
                </div>
                <div class="note-item">
                    <h4>Your Laugh 😄</h4>
                    <p>Your laughter is music to my ears. I love how genuine and infectious it is.</p>
                </div>
                <div class="note-item">
                    <h4>Your Intelligence 🧠</h4>
                    <p>I'm constantly impressed by how smart you are and how you see the world in unique ways.</p>
                </div>
                <div class="note-item">
                    <h4>Your Support 🤝</h4>
                    <p>Thank you for always being there for me, through good times and bad.</p>
                </div>
                <div class="note-item">
                    <h4>Everything About You 💕</h4>
                    <p>Honestly, I could write a thousand notes and still not capture everything I love about you.</p>
                </div>
            </div>
        </div>
    `;
}

function createCouponsContent() {
    const coupons = [
        { title: 'Dinner & A Movie', color: '#ff6b9d', number: '001', validity: 'Valid until: December 2025' },
        { title: 'Shopping Spree', color: '#3498db', number: '002', validity: 'Valid until: December 2025' },
        { title: 'Gift of My Choice', color: '#f39c12', number: '003', validity: 'Valid until: December 2025' },
        { title: 'Spa Day', color: '#e74c3c', number: '004', validity: 'Valid until: December 2025' },
        { title: 'Road Trip', color: '#16a085', number: '005', validity: 'Valid until: December 2025' },
        { title: 'One Wish Granted', color: '#f39c12', number: '006', validity: 'Valid until: December 2025' }
    ];
    
    return `
        <div class="content-display">
            <h2>🎫 Love Coupons</h2>
            <p style="text-align: center; margin-bottom: 30px; color: #7f8c8d;">
                Redeem these special coupons for fun activities together! 💖
            </p>
            <div class="coupons-grid">
                ${coupons.map(coupon => `
                    <div class="coupon-card">
                        <div class="coupon-number">${coupon.number}</div>
                        <div class="coupon-header" style="background: ${coupon.color};">
                            LOVE COUPON
                        </div>
                        <div class="coupon-body">
                            <div class="coupon-title">${coupon.title}</div>
                            <div class="coupon-validity">${coupon.validity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createBirthdayContent() {
    setTimeout(() => {
        createFallingPetals();
    }, 100);
    
    return `
        <div class="content-display birthday-content">
            <h1>🎂 Happy Birthday, Love! 💕</h1>
            <div class="birthday-flower-container" style="position: relative;">
                <div class="birthday-flower">🌹</div>
            </div>
            <div class="birthday-message">
                <p>Happy Birthday to the most amazing person in my life! 🎉</p>
                <br>
                <p>Today we celebrate YOU - your kindness, your beauty (inside and out), your incredible spirit, and all the joy you bring to everyone around you.</p>
                <br>
                <p>I'm so grateful to have you in my life, and I can't wait to celebrate many more birthdays together. Here's to another year of adventures, laughter, and love! 💝</p>
                <br>
                <p>May all your wishes come true today and always! 🎂✨</p>
                <br>
                <p style="font-size: 1.5rem; margin-top: 30px;">I LOVE YOU! 💕💕💕</p>
            </div>
        </div>
    `;
}

// Falling Petals Animation
function createFallingPetals() {
    const container = document.querySelector('.birthday-flower-container');
    if (!container) return;
    
    const petals = ['🌸', '🌺', '🌼', '🌻', '🌷', '💮'];
    
    setInterval(() => {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.textContent = petals[Math.floor(Math.random() * petals.length)];
        petal.style.left = (Math.random() * 100) + '%';
        petal.style.animationDuration = (Math.random() * 3 + 3) + 's';
        petal.style.animationDelay = Math.random() + 's';
        
        container.appendChild(petal);
        
        setTimeout(() => {
            petal.remove();
        }, 6000);
    }, 500);
}

// Helper Functions
function showUnlockChoices() {
    const allContent = ['letter', 'music', 'gallery', 'notes', 'coupons', 'birthday'];
    const locked = allContent.filter(c => !state.unlockedContent.includes(c));
    
    if (locked.length === 0) {
        document.getElementById('unlockChoices').innerHTML = `
            <p style="margin: 20px 0; color: #7f8c8d;">All content already unlocked! 🎉</p>
            <button class="btn-primary" onclick="closeModal()">Close</button>
        `;
        return;
    }
    
    const contentNames = {
        letter: '💌 Love Letter',
        music: '🎵 Music Playlist',
        gallery: '📸 Gallery',
        notes: '📝 Sweet Notes',
        coupons: '🎫 Love Coupons',
        birthday: '🎂 Birthday Wish'
    };
    
    const choicesHTML = locked.map(content => `
        <button class="unlock-choice-btn" onclick="selectUnlock('${content}')">
            ${contentNames[content]}
        </button>
    `).join('');
    
    document.getElementById('unlockChoices').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 30px;">
            ${choicesHTML}
        </div>
    `;
}

function selectUnlock(contentType) {
    unlockContent(contentType);
    
    // Create confetti effect
    createConfetti();
    
    document.getElementById('unlockChoices').innerHTML = `
        <div class="success-message sparkle" style="margin-top: 20px;">
            ✨🎉 Content unlocked successfully! 🎉✨
        </div>
        <button class="btn-primary" onclick="closeModal()" style="margin-top: 20px;">Close</button>
    `;
    
    // Auto update UI
    setTimeout(() => {
        closeModal();
    }, 2000);
}

function createConfetti() {
    const colors = ['#ff6b9d', '#c44569', '#ffc6d9', '#ff9ff3', '#feca57', '#48dbfb'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

function unlockRandomContent() {
    const allContent = ['letter', 'music', 'gallery', 'notes', 'coupons', 'birthday'];
    const locked = allContent.filter(c => !state.unlockedContent.includes(c));
    
    if (locked.length > 0) {
        const randomContent = locked[Math.floor(Math.random() * locked.length)];
        unlockContent(randomContent);
    }
}

function showSuccessMessage(message) {
    const content = document.getElementById('quizContent');
    content.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin: 20px 0;">🎉</div>
            <div class="success-message">${message}</div>
            <button class="btn-primary" onclick="closeModal()" style="margin-top: 30px;">Close</button>
        </div>
    `;
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Local Storage
function saveProgress() {
    localStorage.setItem('loveWebsiteProgress', JSON.stringify(state.unlockedContent));
}

function loadSavedProgress() {
    const saved = localStorage.getItem('loveWebsiteProgress');
    if (saved) {
        state.unlockedContent = JSON.parse(saved);
        updateCardStates();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout? 💔')) {
        localStorage.removeItem('loveWebsiteLoggedIn');
        location.reload();
    }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);