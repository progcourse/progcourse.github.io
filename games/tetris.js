const canvas = document.getElementById('game-canvas');
canvas.height = 600;
canvas.width = 300;
const ctx = canvas.getContext('2d');
const blockSize = 30;
const width = canvas.width / blockSize;
const height = canvas.height / blockSize;
let playfield = Array.from({ length: height }, () => Array(width).fill(0));

let score = 0;
let level = 1;
let dropInterval = 1000; // Initial drop interval in milliseconds (1 second)

// You may want to define a base speed and calculate dropInterval based on level.
const BASE_DROP_INTERVAL = 1000; // Base time in ms for level 1
let gameOver = false;
// ... Other initial setup

const tetrominoColors = {
    'I': ['#ccc', '#fff'], // Color for the I tetromino
    'O': ['#cc0', '#ff0'], // Color for the O tetromino
    'T': ['#c0c', '#f0f'], // Color for the T tetromino
    'S': ['#0cc', '#0ff'], // Color for the S tetromino
    'Z': ['#c00', '#f00'], // Color for the Z tetromino
    'J': ['#0c0', '#0f0'], // Color for the J tetromino
    'L': ['#00c', '#00f'] // Color for the L tetromino
};

// Tetromino definitions
const tetrominoes = [
    { // I Shape
        name: 'I',
        matrix: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        rotations: 2 // Number of valid rotations (excluding 180-degree flip which is same as initial)
    },
    { // O Shape (No rotation)
        name: 'O',
        matrix: [
            [2, 2],
            [2, 2]
        ],
        rotations: 1
    },
    { // T Shape
        name: 'T',
        matrix: [
            [0, 3, 0],
            [3, 3, 3],
            [0, 0, 0]
        ],
        rotations: 4
    },
    { // S Shape
        name: 'S',
        matrix: [
            [0, 4, 4],
            [4, 4, 0],
            [0, 0, 0]
        ],
        rotations: 2
    },
    { // Z Shape
        name: 'Z',
        matrix: [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0]
        ],
        rotations: 2
    },
    { // J Shape
        name: 'J',
        matrix: [
            [0, 6, 0],
            [0, 6, 0],
            [6, 6, 0]
        ],
        rotations: 4
    },
    { // L Shape
        name: 'L',
        matrix: [
            [0, 7, 0],
            [0, 7, 0],
            [0, 7, 7]
        ],
        rotations: 4
    }
];

let tetrominoIndexes = Array.from( tetrominoes, (value, index) => index);

// Helper function to rotate a matrix 90 degrees clockwise
function rotate(matrix) {
    const N = matrix.length;
    const result = new Array(N).fill(null).map(() => new Array(N));

    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            result[col][N - 1 - row] = matrix[row][col];
        }
    }

    return result;
}

function initTetromino(tetrominoData) {
    return {
        name: tetrominoData.name,
        matrix: tetrominoData.matrix,
        rotations: tetrominoData.rotations,
        x: Math.floor((width - tetrominoData.matrix[0].length) / 2), // Start in the middle horizontally
        y: 0, // Start at the top
    };
}

function getNextTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoIndexes.length);
    let response = initTetromino(tetrominoes[tetrominoIndexes[randomIndex]]);
    tetrominoIndexes.splice(randomIndex, 1)
    tetrominoIndexes = tetrominoIndexes.length ? tetrominoIndexes : Array.from( tetrominoes, (value, index) => index);
    return response;
}

function placeTetromino() {
    // Place the current tetromino on the playfield (assuming collision checks were successful)
    for (let row = 0; row < currentTetromino.matrix.length; row++) {
        for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
            if (currentTetromino.matrix[row][col]) {
                playfield[currentTetromino.y + row][currentTetromino.x + col] = currentTetromino.name;
            }
        }
    }
}

function clearLinesAndScore() {
    // Check for completed lines and clear them, updating the score
    for (let row = height - 1; row >= 0; row--) {
        if (playfield[row].every(cell => cell !== 0)) {
            score += 100; // Example score increment per line
            // Shift rows above down
            for (let r = row; r > 0; r--) {
                playfield[r] = playfield[r - 1];
            }
            playfield[0] = Array(width).fill(0); // Clear top row
        }
    }
}

function updateGame() {
    // Core game update logic
    if (!canMoveDown()) {
        placeTetromino();
        clearCompletedLines();
        // clearLinesAndScore();
        currentTetromino = nextTetromino;
        nextTetromino = getNextTetromino();
        if (!canMoveDown()) { // Game over if new tetromino can't move down
            gameOver = true;
        }
    } else {
        moveDown();
    }
}

function drawPlayfield() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row <= height - 1; row++) {
        for (let col = 0; col < width; col++) {
            if (playfield[row][col] !== 0) {
                drawBlock(col, row, tetrominoColors[playfield[row][col]]);
            }
            drawGridCell(col, row);
        }
    }
}

function drawGridCell(x, y) {
    ctx.strokeStyle = "#444"; // Color of the grid lines
    ctx.lineWidth = 1;
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawTetromino() {
    currentTetromino.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(currentTetromino.x + x, currentTetromino.y + y, tetrominoColors[currentTetromino.name]);
            }
        });
    });
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color[0];
    ctx.fillRect(x * blockSize + 6, y * blockSize + 6, blockSize - 12, blockSize - 12);
    ctx.strokeStyle = color[1];
    ctx.lineWidth = 6;
    ctx.strokeRect(x * blockSize + 4, y * blockSize + 4, blockSize - 8, blockSize - 8 );
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
    document.getElementById('score-display').innerText = 'Score: ' + score + ' Level: ' + level;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayfield();
    drawTetromino();
    updateLevel();
    drawScore();

    // Move the tetromino down if possible, otherwise lock it.
    if (!willCollideDown()) {
        // moveDown();
    } else {
        lockTetromino();
    }
    // ... rest of your game logic (movement, collision checks, etc.)
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function handleInput() {
    if (keyPressed[37] || keyPressed[65]) { // Left arrow or 'A'
        moveLeft();
    }
    if (keyPressed[39] || keyPressed[68]) { // Right arrow or 'D'
        moveRight();
    }
    if (keyPressed[40] || keyPressed[83]) { // Down arrow or 'S'
        moveDown();
    }
    if (keyPressed[38] || keyPressed[87] || keyPressed[32]) { // Up arrow, 'W', or Space for rotation
        rotateTetromino();
    }
}


function canMoveTo(newX, newY, newMatrix) {
    for (let row = 0; row < newMatrix.length; row++) {
        for (let col = 0; col < newMatrix[row].length; col++) {
            if (newMatrix[row][col] !== 0) {
                if (
                    newX + col < 0 ||
                    newX + col >= width ||
                    newY + row >= height ||
                    playfield[newY + row][newX + col] !== 0
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Call handleInput in your game loop to continuously check for key states

function moveLeft() {
    if (!willCollideLeft()) {
        currentTetromino.x--;
    }

  }
function moveRight() {
    if (!willCollideRight()) {
        currentTetromino.x++;
    }
}

function moveDown() {
    let newY = currentTetromino.y + 1;
    if (!isCollision(currentTetromino.x, newY, currentTetromino.matrix)) {
        currentTetromino.y = newY;
    } else {
        lockTetromino();
    }
}

function canMoveDown() {
    return canMoveTo(currentTetromino.x, currentTetromino.y + 1, currentTetromino.matrix);
}

function hardDrop() {
    while (canMoveDown()) {
        currentTetromino.y++;
    }
    updateGame();
    canHold = true
    // drawGame();
}

function rotateTetromino() {
    const rotatedMatrix = rotate(currentTetromino.matrix);
    if (!isCollision(currentTetromino.x, currentTetromino.y, rotatedMatrix)) {
        currentTetromino.matrix = rotatedMatrix;
    } else {
        // Wall kick logic: try to shift tetromino left or right to fit it in
        const shifts = [-1, 1, -2, 2];
        for (let i = 0; i < shifts.length; i++) {
            const newX = currentTetromino.x + shifts[i];
            if (!isCollision(newX, currentTetromino.y, rotatedMatrix)) {
                currentTetromino.x = newX;
                currentTetromino.matrix = rotatedMatrix;
                break; // Exit the loop once a valid position is found
            }
        }
    }
}



function willCollideLeft() {
    return isCollision(currentTetromino.x - 1, currentTetromino.y, currentTetromino.matrix);
}

function willCollideRight() {
    return isCollision(currentTetromino.x + 1, currentTetromino.y, currentTetromino.matrix);
}

function willCollideDown() {
    return isCollision(currentTetromino.x, currentTetromino.y + 1, currentTetromino.matrix);
}

function isCollision(x, y, matrix) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] !== 0) {
                if (
                    playfield[y + row] === undefined || // Outside the playfield (bottom)
                    playfield[y + row][x + col] === undefined || // Outside the playfield (left or right)
                    playfield[y + row][x + col] !== 0 // Cell is already occupied
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}


let rotateDebounce = false;

function rotateTetrominoWithDebounce() {
    if (rotateDebounce) return;
    rotateTetromino();
    rotateDebounce = true;
    setTimeout(() => {
        rotateDebounce = false;
    }, 100); // Adjust the delay as needed
}

// Event listener for key presses
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 37: // Left arrow
            moveLeft();
            break;
        case 39: // Right arrow
            moveRight();
            break;
        case 40: // Down arrow (soft drop)
            moveDown();
            break;
        case 38: // Up arrow (rotate)
            rotateTetrominoWithDebounce();
            break;
        case 67: // Up arrow (rotate)
            holdCurrentTetromino();
            break;
        case 32: // Up arrow (rotate)
            hardDrop();
            break;
        // Add more cases if you have additional controls
    }
});


function lockTetromino() {
    placeTetromino();
    clearCompletedLines();
    currentTetromino = nextTetromino;
    nextTetromino = getNextTetromino();
    canHold = true;

    if (isCollision(currentTetromino.x, currentTetromino.y, currentTetromino.matrix)) {
        // gameOver = true;
        score = 0;
        level = 1;
        dropInterval = 1000;
        clearTimeout(dropTimeout);
        dropTimeout = setTimeout(startDrop, dropInterval);
        // alert("Game Over");
        playfield = Array.from({ length: height }, () => Array(width).fill(0));
    }
}

function clearCompletedLines() {
    let linesCleared = 0;
    let linesCombo = 0; // Track consecutive line clears for potential bonus
    let scoreIncrement = 0; // Initialize score increment
    for(let row = height - 1; row >= 0; row--) {
        while(playfield[row].every(cell => cell !== 0)) {
            linesCleared++;
            // linesCombo++; // Increment combo count
            // Clear the line
            for(let col = 0; col < width; col++) {
                playfield[row][col] = 0;
            }
            // Move everything above down
            for(let r = row; r > 0; r--) {
                playfield[r] = playfield[r - 1];
            }
            playfield[0] = Array(width).fill(0); // Clear the top row
        }
    }
  
    // Determine the score increment based on lines cleared
    switch(linesCleared) {
        case 1:
            scoreIncrement = 100;
            break;
        case 2:
            scoreIncrement = 300;
            break;
        case 3:
            scoreIncrement = 500;
            break;
        case 4: // Tetris
            scoreIncrement = 800;
            break;
        default:
            scoreIncrement = 0;
    }
  
    // Apply bonuses for consecutive line clears if desired
    if (linesCombo > 1) {
        scoreIncrement *= linesCombo; // Example: doubling the score for each additional line in the combo
    }
  
    score += scoreIncrement; // Add to total score
  }

function startDrop() {
    if (!gameOver) {
        moveDown();
        dropTimeout = setTimeout(startDrop, dropInterval);
    }
}

function updateLevel() {
    if (score >= level * 10 * 100) {
        level++;
        dropInterval = Math.max(BASE_DROP_INTERVAL - level * 50, 50);
        clearTimeout(dropTimeout);
        startDrop();
    }
}

// Initialize the game
let currentTetromino = getNextTetromino();
let nextTetromino = getNextTetromino();
startDrop();
gameLoop();

let holdTetromino = null;
let canHold = true; // To ensure you can only hold once per drop

function drawHoldBox() {
    const holdCanvas = document.getElementById('hold-canvas');
    const holdCtx = holdCanvas.getContext('2d');
    holdCanvas.width = 6 * blockSize;
    holdCanvas.height = 6 * blockSize;

    holdCtx.fillStyle = '#000';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdTetromino) {
        holdTetromino.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlockInBox(holdCtx, x + 1, y + 1, tetrominoColors[holdTetromino.name]);
                }
            });
        });
    }
}

function drawBlockInBox(ctx, x, y, color) {
    ctx.fillStyle = color[0];
    ctx.fillRect(x * blockSize, y * blockSize, blockSize - 9, blockSize - 9);
    ctx.strokeStyle = color[1];
    ctx.lineWidth = 5;
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize - 7, blockSize - 7 );
}

function holdCurrentTetromino() {
    if (!canHold) return;

    if (holdTetromino) {
        let temp = holdTetromino;
        holdTetromino = currentTetromino;
        currentTetromino = initTetromino(temp);
    } else {
        holdTetromino = currentTetromino;
        currentTetromino = nextTetromino;
        nextTetromino = getNextTetromino();
    }

    holdTetromino.x = 0;
    holdTetromino.y = 0;

    canHold = false;
    drawHoldBox();
}
