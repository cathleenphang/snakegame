// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 3; // 降低初始速度，让游戏更容易上手

// 游戏状态
let running = false;
let paused = false;
let score = 0;
let gameLoop;

// 蛇的初始位置和速度
let snake = [
    { x: 5, y: 5 }
];
let velocityX = 0;
let velocityY = 0;
let nextVelocityX = 0;
let nextVelocityY = 0;

// 食物位置
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// 游戏主循环
function gameUpdate() {
    if (paused) return;
    
    moveSnake();
    
    // 检查游戏结束条件
    if (isGameOver()) {
        clearInterval(gameLoop);
        running = false;
        showGameOver();
        return;
    }
    
    checkFoodCollision();
    drawGame();
}

// 移动蛇
function moveSnake() {
    // 更新速度方向
    velocityX = nextVelocityX;
    velocityY = nextVelocityY;
    
    // 创建新的蛇头
    const head = { 
        x: snake[0].x + velocityX, 
        y: snake[0].y + velocityY 
    };
    
    // 添加新头部到蛇身体
    snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

// 检查是否吃到食物
function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 生成新食物
        generateFood();
        
        // 每吃到10个食物增加速度，且增加幅度减小
        if (score % 100 === 0 && speed < 10) {
            speed += 0.5; // 速度增加更平缓
            clearInterval(gameLoop);
            gameLoop = setInterval(gameUpdate, 1000 / speed);
        }
    }
}

// 生成新食物
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 确保食物不会出现在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 检查游戏是否结束
function isGameOver() {
    // 撞墙
    if (
        snake[0].x < 0 ||
        snake[0].x >= tileCount ||
        snake[0].y < 0 ||
        snake[0].y >= tileCount
    ) {
        return true;
    }
    
    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    
    return false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 绘制蛇头
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
}

// 显示游戏结束界面
function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// 重置游戏
function resetGame() {
    snake = [{ x: 5, y: 5 }];
    velocityX = 0;
    velocityY = 0;
    nextVelocityX = 0;
    nextVelocityY = 0;
    score = 0;
    speed = 7;
    scoreElement.textContent = score;
    generateFood();
    gameOverScreen.classList.add('hidden');
}

// 开始游戏
function startGame() {
    if (!running) {
        resetGame();
        running = true;
        paused = false;
        gameLoop = setInterval(gameUpdate, 1000 / speed);
    }
}

// 暂停游戏
function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? '继续' : '暂停';
}

// 键盘控制
function changeDirection(e) {
    // 防止反向移动
    const preventReverse = (newX, newY) => {
        return (velocityX === -newX && velocityY === -newY);
    };
    
    // 上
    if ((e.key === 'ArrowUp' || e.key === 'w') && !preventReverse(0, -1)) {
        nextVelocityX = 0;
        nextVelocityY = -1;
    }
    // 下
    else if ((e.key === 'ArrowDown' || e.key === 's') && !preventReverse(0, 1)) {
        nextVelocityX = 0;
        nextVelocityY = 1;
    }
    // 左
    else if ((e.key === 'ArrowLeft' || e.key === 'a') && !preventReverse(-1, 0)) {
        nextVelocityX = -1;
        nextVelocityY = 0;
    }
    // 右
    else if ((e.key === 'ArrowRight' || e.key === 'd') && !preventReverse(1, 0)) {
        nextVelocityX = 1;
        nextVelocityY = 0;
    }
}

// 事件监听
document.addEventListener('keydown', changeDirection);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', startGame);

// 移动端控制
upBtn.addEventListener('click', () => {
    if (!(velocityX === 0 && velocityY === 1)) {
        nextVelocityX = 0;
        nextVelocityY = -1;
    }
});

downBtn.addEventListener('click', () => {
    if (!(velocityX === 0 && velocityY === -1)) {
        nextVelocityX = 0;
        nextVelocityY = 1;
    }
});

leftBtn.addEventListener('click', () => {
    if (!(velocityX === 1 && velocityY === 0)) {
        nextVelocityX = -1;
        nextVelocityY = 0;
    }
});

rightBtn.addEventListener('click', () => {
    if (!(velocityX === -1 && velocityY === 0)) {
        nextVelocityX = 1;
        nextVelocityY = 0;
    }
});

// 初始绘制
drawGame();