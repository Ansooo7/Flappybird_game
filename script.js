const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreValue = document.getElementById('finalScoreValue');

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let gameStarted = false;
let gameRunning = false;
let score = 0;

// Bird properties (scaled for full screen)
const bird = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    velocity: 0,
    gravity: 0.6,
    jump: -10,
    rotation: 0
};

// Pipe properties (scaled for full screen)
const pipes = [];
const pipeWidth = 80;
const pipeGap = Math.min(canvas.height * 0.3, 250);
const pipeSpeed = 3;
let frameCount = 0;

// Ground (scaled for full screen)
const ground = {
    x: 0,
    y: canvas.height - 80,
    height: 80,
    speed: 3
};

// Draw bird (circle placeholder - will be transparent for user images)
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    
    // Draw bird body (red circle with white belly)
    ctx.beginPath();
    ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    
    // White belly
    ctx.beginPath();
    ctx.arc(2, 5, bird.width / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Eye
    ctx.beginPath();
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    
    // Beak
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, -2);
    ctx.lineTo(25, 2);
    ctx.closePath();
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    ctx.restore();
}

// Draw tree pipe
function drawPipe(x, topHeight) {
    // Top pipe (tree trunk)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, 0, pipeWidth, topHeight);
    
    // Tree trunk texture
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < topHeight; i += 15) {
        ctx.beginPath();
        ctx.moveTo(x + 10, i);
        ctx.lineTo(x + pipeWidth - 10, i + 10);
        ctx.stroke();
    }
    
    // Top leaves
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(x + pipeWidth / 2, topHeight, pipeWidth, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.ellipse(x + pipeWidth / 2, topHeight - 10, pipeWidth * 0.8, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom pipe (tree trunk)
    const bottomY = topHeight + pipeGap;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, bottomY, pipeWidth, canvas.height - bottomY - ground.height);
    
    // Tree trunk texture
    for (let i = bottomY; i < canvas.height - ground.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(x + 10, i);
        ctx.lineTo(x + pipeWidth - 10, i + 10);
        ctx.stroke();
    }
    
    // Bottom leaves
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(x + pipeWidth / 2, bottomY, pipeWidth, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.ellipse(x + pipeWidth / 2, bottomY + 10, pipeWidth * 0.8, 35, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    
    // Grass on top
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, ground.y, canvas.width, 10);
    
    // Ground texture
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i, ground.y + 10);
        ctx.lineTo(i + 10, ground.y + 20);
        ctx.stroke();
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#98D8C8');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(100 + (frameCount * 0.2) % (canvas.width + 200), 80, 30, 0, Math.PI * 2);
    ctx.arc(130 + (frameCount * 0.2) % (canvas.width + 200), 80, 40, 0, Math.PI * 2);
    ctx.arc(160 + (frameCount * 0.2) % (canvas.width + 200), 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(250 + (frameCount * 0.15) % (canvas.width + 200), 150, 35, 0, Math.PI * 2);
    ctx.arc(285 + (frameCount * 0.15) % (canvas.width + 200), 150, 45, 0, Math.PI * 2);
    ctx.arc(320 + (frameCount * 0.15) % (canvas.width + 200), 150, 35, 0, Math.PI * 2);
    ctx.fill();
}

// Update bird
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Rotate bird based on velocity
    if (bird.velocity < 0) {
        bird.rotation = -0.3;
    } else {
        bird.rotation = Math.min(bird.velocity / 10, Math.PI / 2);
    }
    
    // Check ground collision
    if (bird.y + bird.height >= ground.y) {
        endGame();
    }
    
    // Check top collision
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Update pipes
function updatePipes() {
    if (frameCount % 100 === 0) {
        const topHeight = Math.random() * (canvas.height - pipeGap - ground.height - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            scored: false
        });
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;
        
        // Check collision
        if (bird.x + bird.width > pipes[i].x && 
            bird.x < pipes[i].x + pipeWidth) {
            if (bird.y < pipes[i].topHeight || 
                bird.y + bird.height > pipes[i].topHeight + pipeGap) {
                endGame();
            }
        }
        
        // Score
        if (!pipes[i].scored && bird.x > pipes[i].x + pipeWidth) {
            pipes[i].scored = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    drawBackground();
    drawGround();
    
    updateBird();
    updatePipes();
    
    // Draw pipes
    pipes.forEach(pipe => {
        drawPipe(pipe.x, pipe.topHeight);
    });
    
    drawBird();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    resizeCanvas();
    startScreen.classList.add('hidden');
    gameStarted = true;
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    bird.x = canvas.width * 0.2;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    frameCount = 0;
    ground.y = canvas.height - 80;
    gameOverScreen.classList.remove('show');
    gameLoop();
}

// End game
function endGame() {
    gameRunning = false;
    finalScoreValue.textContent = score;
    gameOverScreen.classList.add('show');
}

// Restart game
function restartGame() {
    startGame();
}

// Controls
function jump() {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
}

canvas.addEventListener('click', jump);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Initial draw
drawBackground();
drawGround();
drawBird();