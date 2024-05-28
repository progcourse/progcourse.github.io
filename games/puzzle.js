const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;
let squareSize = 60;
const boardRows = canvas.height / squareSize;
const boardCols = canvas.width / squareSize;

const colors = [
    ['#f00', '#f88'],
    ['#aa0', '#ff0'],
    ['#0f0', '#8f8'],
    ['#0aa', '#0ff'],
    ['#00f', '#88f'],
    ['#a0a', '#f0f'],
    ['#ccc', '#fff'],
];

let board = [];
let selectedSquare = null;
let isAnimating = false;
let score = 0;
let gameOver = false;

function initBoard() {
    for (let row = 0; row < boardRows; row++) {
        board[row] = [];
        for (let col = 0; col < boardCols; col++) {
            board[row][col] = Math.floor(Math.random() * colors.length);
        }
    }
    score = 0;
    gameOver = false;
}

function drawGridCell(x, y) {
    ctx.strokeStyle = "#444"; // Color of the grid lines
    ctx.lineWidth = 1;
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols; col++) {
            drawGridCell(row, col);
            const colorIndex = board[row][col];
            if (colorIndex !== -1) {
                ctx.fillStyle = colors[colorIndex][1];
                ctx.fillRect(col * squareSize + 24, row * squareSize + 24, squareSize - 48, squareSize - 48);
                ctx.strokeStyle = colors[colorIndex][0];
                ctx.lineWidth = 8;
                ctx.strokeRect(col * squareSize + 18, row * squareSize + 18, squareSize - 36, squareSize - 36);
                ctx.strokeStyle = colors[colorIndex][1];
                ctx.lineWidth = 8;
                ctx.strokeRect(col * squareSize + 8, row * squareSize + 8, squareSize - 16, squareSize - 16);
            }
        }
    }

    if (selectedSquare) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(selectedSquare.col * squareSize, selectedSquare.row * squareSize, squareSize, squareSize);
    }

    // Display the score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    // ctx.fillText(`Score: ${score}`, 10, canvas.height - 20);
    document.getElementById('score-display').innerText = 'Score: ' + score;

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    }
}

function isGameOver() {
    for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols; col++) {
            // Try horizontal swap
            if (col < boardCols - 1) {
                [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
                if (checkForMatchesWithoutClearing()) {
                    [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
                    return false;
                }
                [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
            }
            // Try vertical swap
            if (row < boardRows - 1) {
                [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
                if (checkForMatchesWithoutClearing()) {
                    [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
                    return false;
                }
                [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
            }
        }
    }
    return true;
}


function selectSquare(x, y) {
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);

    if (selectedSquare === null) {
        selectedSquare = { row, col };
    } else {
        const { row: prevRow, col: prevCol } = selectedSquare;
        if (Math.abs(prevRow - row) + Math.abs(prevCol - col) === 1) {
            swapSquares(prevRow, prevCol, row, col);
            selectedSquare = null;
        } else {
            selectedSquare = { row, col };
        }
    }
    drawBoard();
}

function getScoreIncrement(matchLength) {
    let scoreIncrement = 0;
    // Determine the score increment based on lines cleared
    switch (matchLength) {
        case 3:
            scoreIncrement = 100;
            break;
        case 4:
            scoreIncrement = 300;
            break;
        case 5:
            scoreIncrement = 600;
            break;
        case 6:
            scoreIncrement = 1000;
            break;
        case 7:
            scoreIncrement = 1500;
            break;
        case 8:
            scoreIncrement = 2100;
            break;
        case 9:
            scoreIncrement = 2800;
            break;
        case 10:
            scoreIncrement = 3600;
            break;
        default:
            scoreIncrement = 0;
    }

    return scoreIncrement;
}

function checkForMatches() {
    let matches = false;

    // Check horizontal matches
    for (let row = 0; row < boardRows; row++) {
        let matchLength = 1;
        for (let col = 0; col < boardCols - 1; col++) {
            if (board[row][col] !== -1 && board[row][col] === board[row][col + 1]) {
                matchLength++;
            } else {
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        board[row][col - i] = -1;
                    }
                    matches = true;
                    score += getScoreIncrement(matchLength); // Increase score based on match length
                }
                matchLength = 1;
            }
        }
        if (matchLength >= 3) {
            for (let i = 0; i < matchLength; i++) {
                board[row][boardCols - 1 - i] = -1;
            }
            matches = true;
            score += getScoreIncrement(matchLength);
        }
    }

    // Check vertical matches
    for (let col = 0; col < boardCols; col++) {
        let matchLength = 1;
        for (let row = 0; row < boardRows - 1; row++) {
            if (board[row][col] !== -1 && board[row][col] === board[row + 1][col]) {
                matchLength++;
            } else {
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        board[row - i][col] = -1;
                    }
                    matches = true;
                    score += getScoreIncrement(matchLength); // Increase score based on match length
                }
                matchLength = 1;
            }
        }
        if (matchLength >= 3) {
            for (let i = 0; i < matchLength; i++) {
                board[boardRows - 1 - i][col] = -1;
            }
            matches = true;
            score += getScoreIncrement(matchLength);
        }
    }

    return matches;
}

function handleMatches() {
    if (isAnimating) return;
    isAnimating = true;

    // Clear matches and drop new squares
    let interval = setInterval(() => {
        for (let col = 0; col < boardCols; col++) {
            for (let row = boardRows - 1; row >= 0; row--) {
                if (board[row][col] === -1) {
                    for (let r = row - 1; r >= 0; r--) {
                        if (board[r][col] !== -1) {
                            board[row][col] = board[r][col];
                            board[r][col] = -1;
                            break;
                        }
                    }
                    if (board[row][col] === -1) {
                        board[row][col] = Math.floor(Math.random() * colors.length);
                    }
                }
            }
        }

        drawBoard();

        if (!checkForMatches()) {
            clearInterval(interval);
            isAnimating = false;

            // Check if the game is over
            if (isGameOver()) {
                gameOver = true;
                drawBoard();
            }
        }
    }, 400);
}


function swapSquares(row1, col1, row2, col2) {
    if (gameOver) return; // Prevent actions after game is over

    [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];

    if (!checkForMatches()) {
        [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
    } else {
        handleMatches();

        // Check if the game is over
        if (isGameOver()) {
            gameOver = true;
            drawBoard();
        }
    }
    drawBoard();
}


function findPotentialMoves() {
    for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols; col++) {
            if (col < boardCols - 1) {
                // Check horizontal swap
                [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
                if (checkForMatchesWithoutClearing()) {
                    [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
                    return [{ row, col }, { row, col: col + 1 }];
                }
                [board[row][col], board[row][col + 1]] = [board[row][col + 1], board[row][col]];
            }
            if (row < boardRows - 1) {
                // Check vertical swap
                [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
                if (checkForMatchesWithoutClearing()) {
                    [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
                    return [{ row, col }, { row: row + 1, col }];
                }
                [board[row][col], board[row + 1][col]] = [board[row + 1][col], board[row][col]];
            }
        }
    }
    return null;
}

function checkForMatchesWithoutClearing() {
    for (let row = 0; row < boardRows; row++) {
        for (let col = 0; col < boardCols - 2; col++) {
            const color = board[row][col];
            if (color !== -1 && color === board[row][col + 1] && color === board[row][col + 2]) {
                return true;
            }
        }
    }
    for (let col = 0; col < boardCols; col++) {
        for (let row = 0; row < boardRows - 2; row++) {
            const color = board[row][col];
            if (color !== -1 && color === board[row + 1][col] && color === board[row + 2][col]) {
                return true;
            }
        }
    }
    return false;
}


function highlightHint(squares) {
    squares.forEach(square => {
        ctx.strokeStyle = '#0f0'; // Highlight color
        ctx.lineWidth = 4;
        ctx.strokeRect(square.col * squareSize, square.row * squareSize, squareSize, squareSize);
    });
}

function drawHint() {
    const hint = findPotentialMoves();
    if (hint) {
        highlightHint(hint);
    } else {
        console.log('No moves available'); // Handle case when no moves are found
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'h' || event.key === 'H') {
        drawHint();
    }
});

canvas.addEventListener('mousedown', event => {
    if (gameOver) return;
    const x = event.offsetX;
    const y = event.offsetY;
    selectSquare(x, y);
});

canvas.addEventListener('touchstart', event => {
    if (gameOver) return;
    event.preventDefault();
    const x = event.touches[0].clientX - canvas.offsetLeft;
    const y = event.touches[0].clientY - canvas.offsetTop;
    selectSquare(x, y);
});

initBoard();
drawBoard();
