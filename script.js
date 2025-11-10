// State Management
const state = {
    password: 'iloveyou', // Change this to your desired password
    unlockedContent: [],
    currentScreen: 'password',
    musicPlaying: false
};

// Animated Character
let characterSVG;
let leftPupil, rightPupil, head, body, leftArm, rightArm;

function initCharacterAnimation() {
    characterSVG = document.getElementById('characterSVG');
    if (!characterSVG) return;
    
    leftPupil = document.getElementById('leftPupil');
    rightPupil = document.getElementById('rightPupil');
    head = document.getElementById('head');
    body = document.getElementById('body');
    leftArm = document.getElementById('leftArm');
    rightArm = document.getElementById('rightArm');
    
    document.addEventListener('mousemove', animateCharacter);
}

function animateCharacter(e) {
    if (!characterSVG) return;
    
    const rect = characterSVG.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate angle and distance
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    const distance = Math.min(Math.hypot(mouseX - centerX, mouseY - centerY) / 10, 30);
    
    // Move pupils
    const pupilX = Math.cos(angle) * Math.min(distance / 5, 3);
    const pupilY = Math.sin(angle) * Math.min(distance / 5, 3);
    
    if (leftPupil) leftPupil.setAttribute('cx', 85 + pupilX);
    if (leftPupil) leftPupil.setAttribute('cy', 55 + pupilY);
    if (rightPupil) rightPupil.setAttribute('cx', 115 + pupilX);
    if (rightPupil) rightPupil.setAttribute('cy', 55 + pupilY);
    
    // Tilt head slightly
    const headTilt = Math.cos(angle) * Math.min(distance / 30, 3);
    const headMoveY = Math.sin(angle) * Math.min(distance / 30, 2);
    if (head) {
        head.setAttribute('cx', 100 + headTilt);
        head.setAttribute('cy', 60 + headMoveY);
    }
    
    // Move body slightly
    const bodyMove = Math.cos(angle) * Math.min(distance / 40, 2);
    if (body) {
        body.setAttribute('cx', 100 + bodyMove);
    }
    
    // Animate arms
    if (leftArm && rightArm) {
        const armAngle = Math.cos(angle) * Math.min(distance / 20, 5);
        leftArm.setAttribute('x2', 40 - armAngle);
        rightArm.setAttribute('x2', 160 + armAngle);
    }
}

// Maze Game
function startMazeGame() {
    const mazeHTML = `
        <div class="maze-game-container">
            <h2 class="quiz-title">🎮 Find Your Way to Love!</h2>
            <p style="text-align: center; margin-bottom: 20px;">Use Arrow Keys to move 💕</p>
            <canvas id="mazeCanvas" width="500" height="500"></canvas>
            <div class="maze-controls">
                <button class="control-btn" onclick="moveMazePlayer('up')">⬆️</button>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="control-btn" onclick="moveMazePlayer('left')">⬅️</button>
                    <button class="control-btn" onclick="moveMazePlayer('down')">⬇️</button>
                    <button class="control-btn" onclick="moveMazePlayer('right')">➡️</button>
                </div>
            </div>
            <p id="mazeMessage" style="text-align: center; margin-top: 20px; font-size: 1.2rem; color: var(--primary-color);"></p>
        </div>
    `;
    
    document.getElementById('quizContent').innerHTML = mazeHTML;
    document.getElementById('quizModal').classList.add('active');
    
    initMaze();
}

let mazePlayer = { x: 0, y: 0 };
let mazeTarget = { x: 9, y: 9 };
let mazeGrid = [];
let mazeCtx;
let mazeCanvas;

function initMaze() {
    mazeCanvas = document.getElementById('mazeCanvas');
    mazeCtx = mazeCanvas.getContext('2d');
    
    // Simple maze layout (0 = wall, 1 = path)
    mazeGrid = [
        [1,1,1,0,1,1,1,0,1,1],
        [0,0,1,0,1,0,1,0,1,0],
        [1,1,1,1,1,0,1,1,1,0],
        [1,0,0,0,0,0,0,0,1,0],
        [1,1,1,1,1,0,1,1,1,1],
        [0,0,0,0,1,0,1,0,0,0],
        [1,1,1,0,1,1,1,0,1,1],
        [1,0,1,0,0,0,0,0,1,0],
        [1,0,1,1,1,1,1,1,1,0],
        [1,1,1,0,0,0,0,0,1,1]
    ];
    
    mazePlayer = { x: 0, y: 0 };
    drawMaze();
    
    // Keyboard controls
    document.addEventListener('keydown', handleMazeKeyboard);
}

function handleMazeKeyboard(e) {
    if (!document.getElementById('mazeCanvas')) return;
    
    switch(e.key) {
        case 'ArrowUp': moveMazePlayer('up'); break;
        case 'ArrowDown': moveMazePlayer('down'); break;
        case 'ArrowLeft': moveMazePlayer('left'); break;
        case 'ArrowRight': moveMazePlayer('right'); break;
    }
}

function moveMazePlayer(direction) {
    let newX = mazePlayer.x;
    let newY = mazePlayer.y;
    
    switch(direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    // Check boundaries and walls
    if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && mazeGrid[newY][newX] === 1) {
        mazePlayer.x = newX;
        mazePlayer.y = newY;
        drawMaze();
        
        // Check if reached target
        if (mazePlayer.x === mazeTarget.x && mazePlayer.y === mazeTarget.y) {
            setTimeout(() => {
                showMazeVictory();
            }, 300);
        }
    }
}

function drawMaze() {
    const cellSize = 50;
    mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
    
    // Draw maze
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (mazeGrid[y][x] === 0) {
                mazeCtx.fillStyle = '#2c3e50';
            } else {
                mazeCtx.fillStyle = '#b3e5fc';
            }
            mazeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            mazeCtx.strokeStyle = '#fff';
            mazeCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    
    // Draw target (heart)
    mazeCtx.font = '30px Arial';
    mazeCtx.fillText('💕', mazeTarget.x * cellSize + 10, mazeTarget.y * cellSize + 38);
    
    // Draw player
    mazeCtx.font = '30px Arial';
    mazeCtx.fillText('😊', mazePlayer.x * cellSize + 10, mazePlayer.y * cellSize + 38);
}

function showMazeVictory() {
    document.getElementById('mazeMessage').innerHTML = '🎉 Yayyy! We found each other! 💕<br>Here\'s your sweet kiss 😘';
    createConfetti();
    unlockContent('letter'); // Unlock a content after winning
    
    setTimeout(() => {
        document.getElementById('quizModal').classList.remove('active');
        document.removeEventListener('keydown', handleMazeKeyboard);
    }, 3000);
}

// Math Puzzle Game
function startMathPuzzle() {
    const mathHTML = `
        <div class="math-puzzle-container">
            <h2 class="quiz-title">🧮 Decode My Love Message</h2>
            <p style="text-align: center; margin-bottom: 30px;">Solve each equation. The answer reveals a letter!</p>
            
            <div class="math-equations">
                <div class="math-item">
                    <p class="equation">5 + 4 = ?</p>
                    <input type="number" class="math-input" data-answer="9" data-letter="I" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">10 + 2 = ?</p>
                    <input type="number" class="math-input" data-answer="12" data-letter="L" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">3 × 5 = ?</p>
                    <input type="number" class="math-input" data-answer="15" data-letter="O" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">14 + 8 = ?</p>
                    <input type="number" class="math-input" data-answer="22" data-letter="V" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">2 + 3 = ?</p>
                    <input type="number" class="math-input" data-answer="5" data-letter="E" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">25 - 4 = ?</p>
                    <input type="number" class="math-input" data-answer="21" data-letter="Y" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">6 × 2 = ?</p>
                    <input type="number" class="math-input" data-answer="12" data-letter="O" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
                
                <div class="math-item">
                    <p class="equation">18 - 3 = ?</p>
                    <input type="number" class="math-input" data-answer="15" data-letter="U" placeholder="?">
                    <span class="letter-reveal"></span>
                </div>
            </div>
            
            <div id="mathMessage" class="math-message"></div>
            <button id="checkMathBtn" class="btn-primary" style="margin-top: 20px;">Check Answers</button>
        </div>
    `;
    
    document.getElementById('quizContent').innerHTML = mathHTML;
    document.getElementById('quizModal').classList.add('active');
    
    document.getElementById('checkMathBtn').addEventListener('click', checkMathAnswers);
}

function checkMathAnswers() {
    const inputs = document.querySelectorAll('.math-input');
    let allCorrect = true;
    let message = '';
    
    inputs.forEach(input => {
        const answer = parseInt(input.value);
        const correctAnswer = parseInt(input.dataset.answer);
        const letter = input.dataset.letter;
        const reveal = input.nextElementSibling;
        
        if (answer === correctAnswer) {
            input.style.borderColor = '#27ae60';
            reveal.textContent = letter;
            reveal.style.color = 'var(--primary-color)';
            reveal.style.fontSize = '2rem';
            reveal.style.fontWeight = 'bold';
            message += letter;
        } else {
            input.style.borderColor = '#e74c3c';
            reveal.textContent = '?';
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        document.getElementById('mathMessage').innerHTML = `
            <div class="success-message sparkle">
                <h3 style="font-size: 3rem; margin-bottom: 15px;">${message}</h3>
                <p style="font-size: 1.2rem;">You decoded my message! 💕</p>
            </div>
        `;
        createConfetti();
        unlockContent('music');
        
        setTimeout(() => {
            document.getElementById('quizModal').classList.remove('active');
        }, 3000);
    } else {
        document.getElementById('mathMessage').innerHTML = '<p style="color: #e74c3c;">Some answers are wrong. Try again! 💪</p>';
    }
}

// Caesar Cipher Decoder Game
function startCipherGame() {
    const cipherHTML = `
        <div class="cipher-game-container">
            <h2 class="quiz-title">🔐 Decode My Secret Message</h2>
            <p style="text-align: center; margin-bottom: 20px;">I wrote you a love letter in secret code! 💌</p>
            
            <div class="cipher-scrapbook">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect fill='%23fef5f8' width='400' height='500'/%3E%3Ctext x='50%25' y='30' text-anchor='middle' fill='%23ff6b9d' font-size='20' font-weight='bold'%3E💌 Secret Love Letter 💌%3C/text%3E%3Ctext x='20' y='80' fill='%232c3e50' font-size='14' font-family='courier'%3EBrx duh pb idyrulwh shuvrq%3C/text%3E%3Ctext x='20' y='110' fill='%232c3e50' font-size='14' font-family='courier'%3EPb khduw ehdwv rqob iru brx%3C/text%3E%3Ctext x='20' y='140' fill='%232c3e50' font-size='14' font-family='courier'%3EZlwkrxw brx, olih lvq'w hpswb%3C/text%3E%3Ctext x='20' y='170' fill='%232c3e50' font-size='14' font-family='courier'%3EZkhq L dp zlwk brx, L dp kdssb%3C/text%3E%3Ctext x='20' y='200' fill='%232c3e50' font-size='14' font-family='courier'%3EL fdq'w vwrs wklqnlqj derxw brx%3C/text%3E%3Ctext x='20' y='230' fill='%232c3e50' font-size='14' font-family='courier'%3EBrx duh pb vxqvklqh%3C/text%3E%3Ctext x='20' y='260' fill='%232c3e50' font-size='14' font-family='courier'%3EPxfk qhduhu wkurxjkrxw%3C/text%3E%3Ctext x='20' y='290' fill='%232c3e50' font-size='14' font-family='courier'%3EL zrxog fkrrvh brx djdlq%3C/text%3E%3Ctext x='20' y='320' fill='%232c3e50' font-size='14' font-family='courier'%3EBrx duh pb iruhyhu oryh%3C/text%3E%3C/svg%3E" style="max-width: 100%; border-radius: 15px; box-shadow: var(--shadow);">
            </div>
            
            <div class="cipher-controls">
                <p style="margin: 20px 0;">Hint: Try shifting the alphabet! Each letter is replaced by another letter a certain number of positions away. 🤔</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0;">
                    <label>Shift Amount:</label>
                    <input type="range" id="cipherShift" min="1" max="25" value="3" style="width: 200px;">
                    <span id="shiftValue">3</span>
                </div>
                <button id="decodeCipherBtn" class="btn-primary">Decode Message</button>
            </div>
            
            <div id="cipherResult" class="cipher-result"></div>
        </div>
    `;
    
    document.getElementById('quizContent').innerHTML = cipherHTML;
    document.getElementById('quizModal').classList.add('active');
    
    const shiftInput = document.getElementById('cipherShift');
    const shiftValue = document.getElementById('shiftValue');
    shiftInput.addEventListener('input', () => {
        shiftValue.textContent = shiftInput.value;
    });
    
    document.getElementById('decodeCipherBtn').addEventListener('click', decodeCipher);
}

function decodeCipher() {
    const shift = parseInt(document.getElementById('cipherShift').value);
    const encoded = [
        "Brx duh pb idyrulwh shuvrq",
        "Pb khduw ehdwv rqob iru brx",
        "Zlwkrxw brx, olih lvq'w hpswb",
        "Zkhq L dp zlwk brx, L dp kdssb",
        "L fdq'w vwrs wklqnlqj derxw brx",
        "Brx duh pb vxqvklqh",
        "Pxfk qhduhu wkurxjkrxw",
        "L zrxog fkrrvh brx djdlq dqg djdlq",
        "Brx duh pb iruhyhu oryh"
    ];
    
    const decoded = encoded.map(line => caesarDecode(line, shift));
    
    const resultDiv = document.getElementById('cipherResult');
    
    if (shift === 3) {
        resultDiv.innerHTML = `
            <div class="success-message sparkle" style="text-align: left; padding: 30px;">
                <h3 style="text-align: center; margin-bottom: 20px; color: var(--primary-color);">💕 Decoded Successfully! 💕</h3>
                ${decoded.map(line => `<p style="font-size: 1.1rem; line-height: 1.8; margin: 10px 0;">${line}</p>`).join('')}
            </div>
        `;
        createConfetti();
        unlockContent('gallery');
        
        setTimeout(() => {
            document.getElementById('quizModal').classList.remove('active');
        }, 5000);
    } else {
        resultDiv.innerHTML = `
            <div style="background: #fadbd8; padding: 20px; border-radius: 15px; margin-top: 20px;">
                <p style="color: #e74c3c;">Hmm, that doesn't look right... Try a different shift! 🤔</p>
                <div style="margin-top: 15px; text-align: left; font-size: 0.9rem; color: #555;">
                    ${decoded.slice(0, 3).map(line => `<p>${line}</p>`).join('')}
                </div>
            </div>
        `;
    }
}

function caesarDecode(text, shift) {
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
        return char;
    }).join('');
}

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
    // MATIKAN AUTO-LOGIN! User harus login setiap kali buka website
    // Tapi progress unlock tetap tersimpan
    
    // Hapus status login (kalau ada)
    localStorage.removeItem('loveWebsiteLoggedIn');
    
    console.log('🔒 Auto-login disabled. Please login first!');
    
    // Tidak ada kode lain disini - semua user mulai dari password screen
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
        
        // HAPUS BARIS INI - jangan save login status!
        // localStorage.setItem('loveWebsiteLoggedIn', 'true'); // ❌ HAPUS!
        
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
            
            <!-- Spotify Player -->
            <div class="spotify-player-container">
                <div id="currentSongInfo" style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: var(--primary-color);">🎵 Select a song below</h3>
                </div>
                <div id="spotifyPlayerWrapper" style="display: none;">
                    <iframe id="spotifyPlayer" 
                            style="border-radius:12px" 
                            src="" 
                            width="100%" 
                            height="352" 
                            frameBorder="0" 
                            allowfullscreen="" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy">
                    </iframe>
                </div>
            </div>
            
            <div class="music-list" style="margin-top: 40px;">
                <div class="music-item" onclick="playSpotifySong('0yDghAfS3CT7Di30WoJE7h', 'Song 1', 'First song for you')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 1</h4>
                        <p>First song for you</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('3NLnwwAQbbFKcEcV8hDItk', 'Song 2', 'Our favorite')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 2</h4>
                        <p>Our favorite song</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('3Puhw21QI2MKR4rdvyPuIb', 'Song 3', 'Reminds me of you')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 3</h4>
                        <p>Always reminds me of you</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('3U4isOIWM3VvDubwSI3y7a', 'Song 4', 'Our anthem')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 4</h4>
                        <p>Our love anthem</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('34gCuhDGsG4bRPIf9bb02f', 'Song 5', 'Sweet memories')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 5</h4>
                        <p>Sweet memories together</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('273QnyCvJB65rScHJ1nPZb', 'Song 6', 'Special moment')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 6</h4>
                        <p>Our special moment</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
                
                <div class="music-item" onclick="playSpotifySong('6lanRgr6wXibZr8KgzXxBl', 'Song 7', 'Forever song')">
                    <div class="music-icon">🎵</div>
                    <div class="music-info">
                        <h4>Song 7</h4>
                        <p>Our forever song</p>
                    </div>
                    <div class="play-icon">▶️</div>
                </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #1DB954; color: white; border-radius: 15px; text-align: center;">
                <h4 style="margin-bottom: 10px;">🎵 Powered by Spotify</h4>
                <p style="font-size: 0.9rem; opacity: 0.9;">
                    Click any song above to play. Enjoy! 💕
                </p>
            </div>
        </div>
    `;
}

// Spotify Music Player
function playSpotifySong(trackId, title, description) {
    const player = document.getElementById('spotifyPlayer');
    const wrapper = document.getElementById('spotifyPlayerWrapper');
    const info = document.getElementById('currentSongInfo');
    
    // Show player
    wrapper.style.display = 'block';
    
    // Update iframe with Spotify embed
    player.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    
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
    event.currentTarget.style.background = '#e8f5e9';
    event.currentTarget.style.borderLeft = '4px solid #1DB954';
    
    // Scroll to player smoothly
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
    // Buat modal custom
    const modal = document.createElement('div');
    modal.id = 'prankModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 50px 40px;
            border-radius: 30px;
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.3s ease;
        ">
            <div style="font-size: 5rem; margin-bottom: 20px;">😈</div>
            <h2 style="color: #ff6b9d; font-size: 2rem; margin-bottom: 20px;">
                SERIUS NIH MAU LOGOUT?
            </h2>
            <p style="font-size: 1.2rem; color: #555; margin-bottom: 30px; line-height: 1.6;">
                Kamu pikir bisa lepas dari aku? 😏<br>
                <strong>NO YOU CAN'T!</strong><br>
                YOU ARE MINE! 💕
            </p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <button onclick="attemptLogout()" style="
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #ff6b9d, #c44569);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Yes, Logout
                </button>
                <button onclick="cancelLogout()" style="
                    flex: 1;
                    padding: 15px;
                    background: white;
                    color: #ff6b9d;
                    border: 2px solid #ff6b9d;
                    border-radius: 15px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    No, Stay
                </button>
            </div>
            
            <p style="font-size: 0.9rem; color: #999; font-style: italic;">
                (Pilih yang manapun, hasil tetep sama 😘)
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Kalau klik YES (tetap ga bisa logout)
function attemptLogout() {
    const modal = document.getElementById('prankModal');
    modal.querySelector('div').innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 20px;">🔒</div>
        <h2 style="color: #ff6b9d; font-size: 2rem; margin-bottom: 20px;">
            LOGOUT DITOLAK!
        </h2>
        <p style="font-size: 1.2rem; color: #555; margin-bottom: 30px; line-height: 1.6;">
            Hahaha! Kamu pikir gampang? 😂<br>
            Aku ga akan pernah lepas kamu!<br>
            <strong>YOU'RE STUCK WITH ME FOREVER! 💖</strong>
        </p>
        <button onclick="closePrankModal()" style="
            padding: 15px 40px;
            background: linear-gradient(135deg, #ff6b9d, #c44569);
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
        ">
            Fine, I'll Stay 💕
        </button>
    `;
    
    createLoveExplosion();
}

// Kalau klik NO (tetap ga bisa logout juga)
function cancelLogout() {
    const modal = document.getElementById('prankModal');
    modal.querySelector('div').innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 20px;">🥰</div>
        <h2 style="color: #ff6b9d; font-size: 2rem; margin-bottom: 20px;">
            GOOD CHOICE!
        </h2>
        <p style="font-size: 1.2rem; color: #555; margin-bottom: 30px; line-height: 1.6;">
            Emang gabisa ninggalin aku kan? 😊<br>
            Kita terikat selamanya!<br>
            <strong>FOREVER AND EVER! 💕</strong>
        </p>
        <button onclick="closePrankModal()" style="
            padding: 15px 40px;
            background: linear-gradient(135deg, #ff6b9d, #c44569);
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
        ">
            Yes, I'm Yours Forever 💖
        </button>
    `;
    
    createLoveExplosion();
}

// Tutup modal (TIDAK LOGOUT!)
function closePrankModal() {
    const modal = document.getElementById('prankModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Love explosion effect
function createLoveExplosion() {
    const hearts = ['💕', '💖', '💗', '💝', '❤️', '💘', '💓'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.fontSize = '2.5rem';
            heart.style.zIndex = '9998';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'float-up 2s ease-out forwards';
            
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), 2000);
        }, i * 50);
    }
}

// Tambah CSS animations untuk modal
const prankStyles = document.createElement('style');
prankStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideIn {
        from { 
            transform: scale(0.7) translateY(-50px);
            opacity: 0;
        }
        to { 
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(prankStyles);