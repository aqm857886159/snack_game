// 游戏配置
const config = {
    canvasSize: 600,
    gridSize: 20,
    initialSpeed: 150,
    speedIncrease: 2,
    maxSpeed: 50
};

// 蛇的皮肤配置
const snakeSkins = {
    classic: {
        name: '经典绿',
        headColor: '#34AADC',
        bodyColor: '#4CD964',
        pattern: 'solid',
        headStyle: 'round'
    },
    modern: {
        name: '现代黑',
        headColor: '#000000',
        bodyColor: '#333333',
        pattern: 'modern',
        headStyle: 'modern',
        eyeColor: '#FFFFFF',
        pupilColor: '#000000'
    },
    cyber: {
        name: '赛博朋克',
        headColor: '#00FFFF',
        bodyColor: '#FF00FF',
        pattern: 'cyber',
        headStyle: 'cyber',
        glowColor: '#00FFFF',
        trailColor: '#FF00FF'
    },
    dragon: {
        name: '龙蛇',
        headColor: '#FF4500',
        bodyColor: '#FF8C00',
        pattern: 'dragon',
        headStyle: 'dragon',
        scaleColor: '#FFD700'
    }
};

// 食物配置
const foodTypes = {
    apple: {
        color: '#FF3B30',
        points: 10,
        shape: 'apple'
    },
    star: {
        color: '#FFD700',
        points: 20,
        shape: 'star'
    },
    diamond: {
        color: '#00FFFF',
        points: 15,
        shape: 'diamond'
    }
};

// 游戏状态
let gameState = {
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    gameLoop: null,
    isGameOver: false,
    isPaused: false,
    selectedSkin: 'classic',
    foodType: 'apple'
};

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreElement = document.getElementById('current-score');
const leaderboardList = document.getElementById('leaderboardList');
const gameStats = document.getElementById('gameStats');

// 初始化画布
function initCanvas() {
    canvas.width = config.canvasSize;
    canvas.height = config.canvasSize;
}

// 初始化游戏
function initGame() {
    // 初始化蛇的位置
    const center = Math.floor(config.canvasSize / (2 * config.gridSize));
    gameState.snake = [
        { x: center, y: center },
        { x: center - 1, y: center },
        { x: center - 2, y: center }
    ];
    
    // 生成第一个食物
    generateFood();
    
    // 重置游戏状态
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    
    // 更新分数显示
    updateScore(0);
    
    // 更新按钮状态
    startBtn.textContent = '开始游戏';
    startBtn.disabled = false;
    restartBtn.disabled = true;
}

// 生成食物
function generateFood() {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * (config.canvasSize / config.gridSize)),
            y: Math.floor(Math.random() * (config.canvasSize / config.gridSize))
        };
    } while (gameState.snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    gameState.food = food;
}

// 更新分数
function updateScore(newScore) {
    gameState.score = newScore;
    scoreElement.textContent = newScore;
}

// 绘制食物
function drawFood() {
    const food = gameState.food;
    const foodConfig = foodTypes[gameState.foodType];
    const x = food.x * config.gridSize;
    const y = food.y * config.gridSize;
    const size = config.gridSize - 1;

    ctx.save();
    ctx.translate(x + size/2, y + size/2);

    switch (foodConfig.shape) {
        case 'apple':
            // 绘制苹果主体
            ctx.beginPath();
            ctx.fillStyle = foodConfig.color;
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制苹果叶子
            ctx.beginPath();
            ctx.fillStyle = '#4CD964';
            ctx.moveTo(-size/4, -size/2);
            ctx.quadraticCurveTo(0, -size/1.5, size/4, -size/2);
            ctx.fill();
            break;

        case 'star':
            // 绘制星星
            ctx.beginPath();
            ctx.fillStyle = foodConfig.color;
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * size/2;
                const y = Math.sin(angle) * size/2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;

        case 'diamond':
            // 绘制钻石
            ctx.beginPath();
            ctx.fillStyle = foodConfig.color;
            ctx.moveTo(0, -size/2);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(0, size/2);
            ctx.lineTo(-size/2, 0);
            ctx.closePath();
            ctx.fill();
            break;
    }

    ctx.restore();
}

// 绘制蛇
function drawSnake() {
    const skin = snakeSkins[gameState.selectedSkin];
    
    // 绘制蛇身
    for (let i = gameState.snake.length - 1; i >= 0; i--) {
        const segment = gameState.snake[i];
        const x = segment.x * config.gridSize;
        const y = segment.y * config.gridSize;
        const size = config.gridSize - 1;

        ctx.save();
        ctx.translate(x + size/2, y + size/2);

        // 计算蛇的方向
        let angle = 0;
        if (i > 0) {
            const prev = gameState.snake[i - 1];
            angle = Math.atan2(segment.y - prev.y, segment.x - prev.x);
        } else {
            // 蛇头的方向
            switch (gameState.direction) {
                case 'up': angle = -Math.PI/2; break;
                case 'down': angle = Math.PI/2; break;
                case 'left': angle = Math.PI; break;
                case 'right': angle = 0; break;
            }
        }

        ctx.rotate(angle);

        if (i === 0) {
            // 绘制蛇头
            drawSnakeHead(skin, size);
        } else {
            // 绘制蛇身
            drawSnakeBody(skin, size, i);
        }

        ctx.restore();
    }
}

// 绘制蛇头
function drawSnakeHead(skin, size) {
    switch (skin.headStyle) {
        case 'modern':
            // 现代风格蛇头
            ctx.beginPath();
            ctx.fillStyle = skin.headColor;
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();

            // 添加眼睛
            ctx.fillStyle = skin.eyeColor;
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/8, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/8, 0, Math.PI * 2);
            ctx.fill();

            // 添加瞳孔
            ctx.fillStyle = skin.pupilColor;
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/16, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/16, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'cyber':
            // 赛博朋克风格蛇头
            ctx.shadowColor = skin.glowColor;
            ctx.shadowBlur = 15;
            
            // 主体
            ctx.beginPath();
            ctx.fillStyle = skin.headColor;
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();

            // 发光环
            ctx.beginPath();
            ctx.strokeStyle = skin.glowColor;
            ctx.lineWidth = 2;
            ctx.arc(0, 0, size/2 - 2, 0, Math.PI * 2);
            ctx.stroke();

            // 电子眼
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/8, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/8, 0, Math.PI * 2);
            ctx.fill();

            // 瞳孔
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/16, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/16, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'dragon':
            // 龙风格蛇头
            ctx.beginPath();
            ctx.fillStyle = skin.headColor;
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();

            // 添加鳞片效果
            ctx.fillStyle = skin.scaleColor;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(-size/3 + (i * size/6), 0, size/8, 0, Math.PI * 2);
                ctx.fill();
            }

            // 龙眼
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/8, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/8, 0, Math.PI * 2);
            ctx.fill();

            // 瞳孔
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-size/4, -size/6, size/16, 0, Math.PI * 2);
            ctx.arc(-size/4, size/6, size/16, 0, Math.PI * 2);
            ctx.fill();
            break;

        default:
            // 默认圆形蛇头
            ctx.beginPath();
            ctx.fillStyle = skin.headColor;
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();
    }
}

// 绘制蛇身
function drawSnakeBody(skin, size, index) {
    switch (skin.pattern) {
        case 'modern':
            // 现代风格蛇身
            ctx.beginPath();
            ctx.fillStyle = skin.bodyColor;
            ctx.arc(0, 0, size/2 - 1, 0, Math.PI * 2);
            ctx.fill();

            // 添加光泽效果
            const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
            ctx.fillStyle = gradient;
            ctx.fill();
            break;

        case 'cyber':
            // 赛博朋克风格蛇身
            ctx.shadowColor = skin.trailColor;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.fillStyle = skin.bodyColor;
            ctx.arc(0, 0, size/2 - 1, 0, Math.PI * 2);
            ctx.fill();

            // 添加发光环
            ctx.beginPath();
            ctx.strokeStyle = skin.trailColor;
            ctx.lineWidth = 1;
            ctx.arc(0, 0, size/2 - 2, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case 'dragon':
            // 龙风格蛇身
            ctx.beginPath();
            ctx.fillStyle = skin.bodyColor;
            ctx.arc(0, 0, size/2 - 1, 0, Math.PI * 2);
            ctx.fill();

            // 添加鳞片效果
            ctx.fillStyle = skin.scaleColor;
            ctx.beginPath();
            ctx.arc(0, 0, size/4, 0, Math.PI * 2);
            ctx.fill();
            break;

        default:
            // 默认圆形蛇身
            ctx.beginPath();
            ctx.fillStyle = skin.bodyColor;
            ctx.arc(0, 0, size/2 - 1, 0, Math.PI * 2);
            ctx.fill();
    }
}

// 修改绘制函数
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);
    
    // 绘制网格（可选）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < config.canvasSize; i += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, config.canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(config.canvasSize, i);
        ctx.stroke();
    }
    
    // 绘制蛇和食物
    drawSnake();
    drawFood();
}

// 移动蛇
function moveSnake() {
    const head = { ...gameState.snake[0] };
    
    // 根据方向移动蛇头
    switch (gameState.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= config.canvasSize / config.gridSize ||
        head.y < 0 || head.y >= config.canvasSize / config.gridSize) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 移动蛇
    gameState.snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        updateScore(gameState.score + 10);
        generateFood();
        saveScore();
        updateLeaderboard();
    } else {
        gameState.snake.pop();
    }
    
    // 更新方向
    gameState.direction = gameState.nextDirection;
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isPaused && !gameState.isGameOver) {
        moveSnake();
        draw();
    }
}

// 开始游戏
function startGame() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    
    gameState.isPaused = false;
    gameState.gameLoop = setInterval(gameLoop, config.initialSpeed);
    startBtn.textContent = '暂停';
    startBtn.disabled = false;
}

// 暂停游戏
function pauseGame() {
    gameState.isPaused = true;
    startBtn.textContent = '继续';
}

// 游戏结束
function gameOver() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameLoop);
    startBtn.textContent = '重新开始';
    restartBtn.disabled = false;
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);
    ctx.fillStyle = '#fff';
    ctx.font = '30px -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', config.canvasSize / 2, config.canvasSize / 2);
    ctx.font = '20px -apple-system';
    ctx.fillText(`最终得分: ${gameState.score}`, config.canvasSize / 2, config.canvasSize / 2 + 40);
}

// 保存分数
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
    scores.push({
        score: gameState.score,
        date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // 只保留前10名
    localStorage.setItem('snakeScores', JSON.stringify(scores));
}

// 更新排行榜
function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
    leaderboardList.innerHTML = scores.map((score, index) => `
        <div class="score-item">
            <span class="rank">#${index + 1}</span>
            <span class="score">${score.score}</span>
            <span class="date">${new Date(score.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// 更新游戏统计
function updateGameStats() {
    const scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
    const totalGames = scores.length;
    const averageScore = scores.reduce((acc, curr) => acc + curr.score, 0) / totalGames || 0;
    const highestScore = scores[0]?.score || 0;
    
    gameStats.innerHTML = `
        <div class="stat-item">
            <span class="label">总游戏次数:</span>
            <span class="value">${totalGames}</span>
        </div>
        <div class="stat-item">
            <span class="label">平均分数:</span>
            <span class="value">${Math.round(averageScore)}</span>
        </div>
        <div class="stat-item">
            <span class="label">最高分数:</span>
            <span class="value">${highestScore}</span>
        </div>
    `;
}

// 事件监听
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (gameState.direction !== 'down') gameState.nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (gameState.direction !== 'up') gameState.nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (gameState.direction !== 'right') gameState.nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (gameState.direction !== 'left') gameState.nextDirection = 'right';
            break;
    }
});

startBtn.addEventListener('click', () => {
    if (gameState.isGameOver) {
        initGame();
        startGame();
    } else if (gameState.isPaused) {
        startGame();
    } else {
        pauseGame();
    }
});

restartBtn.addEventListener('click', () => {
    initGame();
    startGame();
});

// 添加皮肤选择UI
function createSkinSelector() {
    const skinSelector = document.createElement('div');
    skinSelector.className = 'skin-selector';
    skinSelector.innerHTML = `
        <h2>选择蛇的皮肤</h2>
        <div class="skin-options">
            ${Object.entries(snakeSkins).map(([key, skin]) => `
                <div class="skin-option ${key === gameState.selectedSkin ? 'selected' : ''}" data-skin="${key}">
                    <div class="skin-preview" style="background: ${skin.headColor}"></div>
                    <span>${skin.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    // 插入到游戏容器中
    const gameContainer = document.querySelector('.game-container');
    gameContainer.insertBefore(skinSelector, canvas);

    // 添加事件监听
    skinSelector.querySelectorAll('.skin-option').forEach(option => {
        option.addEventListener('click', () => {
            const skin = option.dataset.skin;
            gameState.selectedSkin = skin;
            skinSelector.querySelectorAll('.skin-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

// 初始化时创建皮肤选择器
createSkinSelector();

// 初始化游戏
initCanvas();
initGame();
updateLeaderboard();
updateGameStats(); 