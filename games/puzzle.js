const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 600;
        const squareSize = 30;
        const boardRows = canvas.height / squareSize;
        const boardCols = canvas.width / squareSize;

        const colors = [
          ['#ccc', '#fff'],
          ['#cc0', '#ff0'],
          ['#c0c', '#f0f'],
          ['#0c0', '#0f0'],
          ['#c00', '#f00'],
          ['#00c', '#00f'],
          ['#0cc', '#0ff']
        ];

        let board = [];
        let selectedSquare = null;
        let isAnimating = false;

        function initBoard() {
            for (let row = 0; row < boardRows; row++) {
                board[row] = [];
                for (let col = 0; col < boardCols; col++) {
                    board[row][col] = Math.floor(Math.random() * colors.length);
                }
            }
        }

        function drawBoard() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let row = 0; row < boardRows; row++) {
                for (let col = 0; col < boardCols; col++) {
                    const colorIndex = board[row][col];
                    if (colorIndex !== -1) {
                      ctx.fillStyle = colors[colorIndex][0];
                      ctx.fillRect(col * squareSize + 8, row * squareSize + 8, squareSize - 16, squareSize - 16);
                      ctx.strokeStyle = colors[colorIndex][1];
                      ctx.lineWidth = 4;
                      ctx.strokeRect(col * squareSize + 4, row * squareSize + 4, squareSize - 8, squareSize - 8);
                    }
                }
            }

            if (selectedSquare) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(selectedSquare.col * squareSize, selectedSquare.row * squareSize, squareSize, squareSize);
            }
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

        function swapSquares(row1, col1, row2, col2) {
            [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];

            if (!checkForMatches()) {
                [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
            } else {
                handleMatches();
            }
        }

        function checkForMatches() {
            let matches = false;

            // Check horizontal matches
            for (let row = 0; row < boardRows; row++) {
                for (let col = 0; col < boardCols - 2; col++) {
                    const color = board[row][col];
                    if (color !== -1 && color === board[row][col + 1] && color === board[row][col + 2]) {
                        board[row][col] = board[row][col + 1] = board[row][col + 2] = -1;
                        matches = true;
                    }
                }
            }

            // Check vertical matches
            for (let col = 0; col < boardCols; col++) {
                for (let row = 0; row < boardRows - 2; row++) {
                    const color = board[row][col];
                    if (color !== -1 && color === board[row + 1][col] && color === board[row + 2][col]) {
                        board[row][col] = board[row + 1][col] = board[row + 2][col] = -1;
                        matches = true;
                    }
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
                }
            }, 100);
        }

        canvas.addEventListener('mousedown', event => {
            const x = event.offsetX;
            const y = event.offsetY;
            selectSquare(x, y);
        });

        canvas.addEventListener('touchstart', event => {
            event.preventDefault();
            const x = event.touches[0].clientX - canvas.offsetLeft;
            const y = event.touches[0].clientY - canvas.offsetTop;
            selectSquare(x, y);
        });

        initBoard();
        drawBoard();