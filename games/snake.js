const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 30; // Size of each cell in pixels
canvas.width = 600;
canvas.height = 600;
const width = canvas.width / gridSize; // Number of cells horizontally
const height = canvas.height / gridSize; // Number of cells vertically
const initialSnakeLength = 3; // Starting length of the snake
const speed = 200; // Milliseconds between updates (controls game speed)

// Snake variables
let snake = [{ x: 3, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 0 }];
let snakeColor = [];
let direction = 'right';
let newDirection = direction; // Tracks intended direction change

const foodColors = [
    ['#ccc', '#fff'],
    ['#cc0', '#ff0'],
    ['#c0c', '#f0f'],
    ['#0c0', '#0f0'],
    ['#c00', '#f00'],
    ['#00c', '#00f'],
    ['#0cc', '#0ff']
];

let foodColor = [];
// Food location
let foodX;
let foodY;

// Game state
let gameOver = false;

function initialize() {
    const randomIndex = Math.floor(Math.random() * foodColors.length);
    snakeColor = foodColors[randomIndex];
    placeFood();
    update();
}

function placeFood() {
    // Randomly place food within the grid boundaries
    const randomIndex = Math.floor(Math.random() * foodColors.length);
    foodColor = foodColors[randomIndex];
    foodX = Math.floor(Math.random() * width);
    foodY = Math.floor(Math.random() * height);

    // Ensure food doesn't spawn inside the snake
    while (snake.some(segment => segment.x === foodX && segment.y === foodY)) {
        placeFood();
    }
}

function update() {
    if (gameOver) return; // Stop updating if game over

    // Handle direction changes (only allow 90 degree turns)
    if (newDirection === 'left' && direction !== 'right') {
        direction = newDirection;
    } else if (newDirection === 'right' && direction !== 'left') {
        direction = newDirection;
    } else if (newDirection === 'up' && direction !== 'down') {
        direction = newDirection;
    } else if (newDirection === 'down' && direction !== 'up') {
        direction = newDirection;
    }

    // Update snake head position based on direction
    let head = { x: snake[0].x, y: snake[0].y };

    //   console.log(snake);

    // Check for collisions
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height ||
        snake.slice(2).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        return;
    }

    switch (direction) {
        case 'right':
            head.x++;
            break;
        case 'left':
            head.x--;
            break;
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
    }

    // Check for food collision
    if (head.x === foodX && head.y === foodY) {
        // Grow the snake and place new food
        snakeColor = foodColor;
        snake.push({ ...head }); // Add new segment at the tail
        document.getElementById('score-display').innerText = 'Score: ' + (snake.length - 3);
        placeFood();
    } else {
        // Move snake (shift body segments)
        snake.pop(); // Remove last segment
        snake.unshift(head); // Add new head segment
    }

    // Clear canvas and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawSnake();
    drawFood();

    setTimeout(update, speed);
}

function drawGridCell(x, y) {
    ctx.strokeStyle = "#444"; // Color of the grid lines
    ctx.lineWidth = 1;
    ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

function drawGrid() {
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            ctx.fillStyle = '#000';
            ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
            drawGridCell(i, j);
        }
    }
}

function drawSnake() {
    ctx.fillStyle = snakeColor[0];
    ctx.strokeStyle = snakeColor[1];
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + 6, gridSize - 12, gridSize - 12);
        ctx.lineWidth = 6;
        ctx.strokeRect(segment.x * gridSize + 4, segment.y * gridSize + 4, gridSize - 8, gridSize - 8);
    });
}

function drawFood() {
    ctx.fillStyle = foodColor[0];
    ctx.strokeStyle = foodColor[1];
    ctx.fillRect(foodX * gridSize + 10, foodY * gridSize + 10, gridSize - 20, gridSize - 20);
    ctx.lineWidth = 6;
    ctx.strokeRect(foodX * gridSize + 4, foodY * gridSize + 4, gridSize - 8, gridSize - 8);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            newDirection = 'left';
            break;
        case 'ArrowRight':
            newDirection = 'right';
            break;
        case 'ArrowUp':
            newDirection = 'up';
            break;
        case 'ArrowDown':
            newDirection = 'down';
            break;
    }
});

initialize();
