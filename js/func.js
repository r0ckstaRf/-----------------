document.addEventListener('DOMContentLoaded', function() {
    const playerForm = document.getElementById('playerForm');
    const playerName = document.getElementById('playerName');
    const playerEmail = document.getElementById('playerEmail');
    const agreeRules = document.getElementById('agreeRules');
    const agreeCookies = document.getElementById('agreeCookies');
    const startGameBtn = document.getElementById('startGameBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    const formContainer = document.getElementById('formContainer');
    const gameContainer = document.getElementById('gameContainer');
    const displayPlayerName = document.getElementById('displayPlayerName');
    const gameStartTime = document.getElementById('gameStartTime');
    const gameTimer = document.getElementById('gameTimer');
    const moveCounter = document.getElementById('moveCounter');
    const gameBoard = document.getElementById('gameBoard');
    
    function checkForm() {
        const isFormValid = playerName.value.trim() !== '' && 
                            playerEmail.value.trim() !== '' && 
                            agreeRules.checked && 
                            agreeCookies.checked;
        
        startGameBtn.disabled = !isFormValid;
    }
    
    playerName.addEventListener('input', checkForm);
    playerEmail.addEventListener('input', checkForm);
    agreeRules.addEventListener('change', checkForm);
    agreeCookies.addEventListener('change', checkForm);
    
    playerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(playerEmail.value)) {
            errorMessage.textContent = 'Пожалуйста, введите корректный email';
            errorMessage.style.display = 'block';
            return;
        }
        
        errorMessage.style.display = 'none';
        
        formContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        
        displayPlayerName.textContent = playerName.value.trim();
        
        const now = new Date();
        gameStartTime.textContent = now.toLocaleString();
        
        initGame();
    });
    
    let gameState = {
        shipParts: [],
        hitParts: 0,
        moves: 0,
        startTime: null,
        timerInterval: null,
        shipSize: 4
    };
    
    function initGame() {
        gameState.startTime = new Date();
        gameState.moves = 0;
        gameState.hitParts = 0;
        moveCounter.textContent = gameState.moves;
        
        gameState.timerInterval = setInterval(updateTimer, 1000);
        
        createGameBoard();
        
        placeShip();
    }
    
    function createGameBoard() {
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                gameBoard.appendChild(cell);
            }
        }
    }
    
    function placeShip() {
        gameState.shipParts = [];
        let isValidPlacement = false;

        while (!isValidPlacement) {
            const isHorizontal = Math.random() > 0.5;

            if (isHorizontal) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * (10 - gameState.shipSize + 1));

                isValidPlacement = true;
                for (let i = 0; i < gameState.shipSize; i++) {
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col + i}"]`);
                    if (cell && (cell.classList.contains('hit') || cell.classList.contains('miss'))) {
                        isValidPlacement = false;
                        break;
                    }
                }

                if (isValidPlacement) {
                    for (let i = 0; i < gameState.shipSize; i++) {
                        gameState.shipParts.push({ row, col: col + i, hit: false });
                    }
                }
            } else {
                const col = Math.floor(Math.random() * 10);
                const row = Math.floor(Math.random() * (10 - gameState.shipSize + 1));

                isValidPlacement = true;
                for (let i = 0; i < gameState.shipSize; i++) {
                    const cell = document.querySelector(`.cell[data-row="${row + i}"][data-col="${col}"]`);
                    if (cell && (cell.classList.contains('hit') || cell.classList.contains('miss'))) {
                        isValidPlacement = false;
                        break;
                    }
                }

                if (isValidPlacement) {
                    for (let i = 0; i < gameState.shipSize; i++) {
                        gameState.shipParts.push({ row: row + i, col, hit: false });
                    }
                }
            }
        }
    }
    
    function handleCellClick(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
    
        if (e.target.classList.contains('hit') || e.target.classList.contains('miss')) {
            return;
        }
    
        gameState.moves++;
        moveCounter.textContent = gameState.moves;
    
        let hit = false;
        for (const part of gameState.shipParts) {
            if (part.row === row && part.col === col) {
                hit = true;
                part.hit = true;
                gameState.hitParts++;
                e.target.classList.add('hit');
                e.target.style.backgroundColor = 'red'; // Красный цвет для попадания без чита
                break;
            }
        }
    
        if (!hit) {
            e.target.classList.add('miss');
            moveShip();
        }
    
        if (gameState.hitParts === gameState.shipSize) {
            setTimeout(() => {
                alert(`Поздравляем! Вы победили за ${gameState.moves} ходов и ${gameTimer.textContent} времени!`);
                resetGame();
            }, 100);
        }
    }
    
    function moveShip() {
        const hitParts = gameState.shipParts.filter(part => part.hit);
    
        // Убираем подсветку старого местоположения корабля
        gameState.shipParts.forEach(part => {
            const cell = document.querySelector(`.cell[data-row="${part.row}"][data-col="${part.col}"]`);
            if (cell && !cell.classList.contains('hit')) {
                cell.style.backgroundColor = ''; // Убираем подсветку
            }
        });
    
        // Перемещаем корабль
        placeShip();
    
        // Восстанавливаем подбитые части на новом местоположении
        hitParts.forEach(hitPart => {
            const matchingPart = gameState.shipParts.find(
                part => !part.hit && !hitParts.some(hp => hp.row === part.row && hp.col === part.col)
            );
    
            if (matchingPart) {
                matchingPart.hit = true;
            }
        });
    
        // Проверяем, включен ли режим "Чит"
        const cheatModeButton = document.getElementById('toggleCheatMode');
        const isCheatModeActive = cheatModeButton.textContent === 'Скрыть корабль';
    
        // Обновляем отображение всех частей корабля
        gameState.shipParts.forEach(part => {
            const cell = document.querySelector(`.cell[data-row="${part.row}"][data-col="${part.col}"]`);
            if (cell) {
                if (part.hit) {
                    if (isCheatModeActive) {
                        cell.classList.add('hit');
                        cell.style.backgroundColor = 'orange'; // Оранжевый цвет для подбитых частей в режиме "Чит"
                    } else {
                        cell.style.backgroundColor = ''; // Скрываем подбитую часть, если "Чит" выключен
                    }
                } else {
                    cell.style.backgroundColor = isCheatModeActive ? '#27ae60' : ''; // Зеленый цвет для неповрежденных частей
                }
            }
        });
    }
    
    function updateTimer() {
        const now = new Date();
        const diff = Math.floor((now - gameState.startTime) / 1000);
        
        const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        
        gameTimer.textContent = `${minutes}:${seconds}`;
    }
    
    function resetGame() {
        clearInterval(gameState.timerInterval);
        gameContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        playerForm.reset();
        startGameBtn.disabled = true;
    }

    document.getElementById('toggleCheatMode').addEventListener('click', function () {
        const isCheatModeActive = this.textContent === 'Показать корабль';
        this.textContent = isCheatModeActive ? 'Скрыть корабль' : 'Показать корабль';
    
        gameState.shipParts.forEach(part => {
            const cell = document.querySelector(`.cell[data-row="${part.row}"][data-col="${part.col}"]`);
            if (cell) {
                if (part.hit) {
                    cell.style.backgroundColor = 'orange'; // Оранжевый цвет для подбитых частей
                } else {
                    cell.style.backgroundColor = isCheatModeActive ? '#27ae60' : ''; // Зеленый цвет для неповрежденных частей
                }
            }
        });
    });
});