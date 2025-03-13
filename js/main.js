// Game variables
let canvas, ctx;
let duck = {
    x: 50,
    y: 200,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jumpForce: -10,
    rotation: 0
};

// Cloud positions
let clouds = Array(5).fill().map(() => ({
    x: Math.random() * 800,
    y: Math.random() * 150 + 20,
    speed: Math.random() * 0.5 + 0.1
}));
let obstacles = [];
let score = 0;
let gameLoop;
let isGameRunning = false;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Show canvas and hide start button
    canvas.classList.remove('hidden');
    document.getElementById('startButton').classList.add('hidden');
    
    // Reset game state
    duck.y = 200;
    duck.velocity = 0;
    obstacles = [];
    score = 0;
    updateScore();
    
    // Start game loop
    isGameRunning = true;
    gameLoop = requestAnimationFrame(update);
    
    // Start spawning obstacles
    spawnObstacle();
}

// Main game loop
function update() {
    if (!isGameRunning) return;
    
    // Draw sky background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and update clouds
    ctx.fillStyle = '#FFFFFF';
    clouds.forEach(cloud => {
        // Draw cloud
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x - 15, cloud.y + 10, 15, 0, Math.PI * 2);
        ctx.arc(cloud.x + 15, cloud.y + 10, 15, 0, Math.PI * 2);
        ctx.fill();

        // Move cloud
        cloud.x -= cloud.speed;
        if (cloud.x < -50) {
            cloud.x = canvas.width + 50;
            cloud.y = Math.random() * 150 + 20;
        }
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    groundGradient.addColorStop(0, '#90EE90');
    groundGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Update duck position
    duck.velocity += duck.gravity;
    duck.y += duck.velocity;
    
    // Ground collision (accounting for ground height)
    if (duck.y + duck.height > canvas.height - 50) {
        duck.y = canvas.height - 50 - duck.height;
        duck.velocity = 0;
    }
    
    // Ceiling collision
    if (duck.y < 0) {
        duck.y = 0;
        duck.velocity = 0;
    }
    
    // Calculate duck rotation based on velocity
    duck.rotation = Math.max(-30, Math.min(30, duck.velocity * 3));

    // Draw duck using emoji with rotation
    ctx.save();
    ctx.translate(duck.x + 20, duck.y + 20);
    ctx.rotate(duck.rotation * Math.PI / 180);
    ctx.font = '40px Arial';
    ctx.fillText('🦆', -20, 20);
    ctx.restore();
    
    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= 5;
        
        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score++;
            updateScore();
            continue;
        }
        
        // Draw obstacle with gradient
        const gradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
        gradient.addColorStop(0, '#2E7D32');
        gradient.addColorStop(1, '#4CAF50');
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add some texture to the obstacle
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Check collision with adjusted hitbox
        const hitbox = {
            x: duck.x + 5,
            y: duck.y + 5,
            width: duck.width - 10,
            height: duck.height - 10
        };
        
        if (checkCollision(hitbox, obstacle)) {
            gameOver();
            return;
        }
    }
    
    gameLoop = requestAnimationFrame(update);
}

// Spawn new obstacle
function spawnObstacle() {
    if (!isGameRunning) return;
    
    const height = Math.random() * 200 + 100;
    const obstacle = {
        x: canvas.width,
        y: canvas.height - height,
        width: 50,
        height: height
    };
    
    obstacles.push(obstacle);
    
    // Schedule next obstacle
    setTimeout(spawnObstacle, 2000);
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Game over handling
function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(gameLoop);
    
    // Show game over screen
    const gameOverScreen = document.getElementById('gameOver');
    gameOverScreen.classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
}

// Event listeners
document.getElementById('startButton').addEventListener('click', init);

document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    init();
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isGameRunning) {
        duck.velocity = duck.jumpForce;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = Math.min(800, window.innerWidth - 32);
    }
});
