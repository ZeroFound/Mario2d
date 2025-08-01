document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const restartButton = document.getElementById("restartButton");
    const scoreElement = document.getElementById("score");
    const finalScoreElement = document.getElementById("finalScore");
    const countdownElement = document.getElementById("countdown");

    // Ukuran kanvas diperbesar
    canvas.width = 1200;
    canvas.height = 600;

    let score = 0;
    let isGameRunning = false;
    let gameLoop;
    let obstacleInterval;
    // Kecepatan awal disesuaikan untuk layar lebih besar
    let obstacleSpeed = 6;
    let obstacleCreationInterval = 1500;

    const assets = {
        mario: new Image(),
        pipe: new Image(),
        jumpSound: new Audio('sound/jump.mp3'),
        gameOverSound: new Audio('sound/gameover.mp3')
    };

    assets.mario.src = 'assets/mario.png';
    assets.pipe.src = 'assets/pipe.png';

    // Properti pemain disesuaikan
    const player = {
        x: 80,
        y: 0,
        width: 75,
        height: 90,
        vy: 0,
        gravity: 0.8,
        jumpPower: -20, // Kekuatan lompat disesuaikan
        isJumping: false,
    };

    let obstacles = [];
    // Ground level disesuaikan dengan tinggi kanvas baru dan tinggi pemain baru
    const groundLevel = canvas.height - player.height - 10;

    function createObstacle() {
        const minHeight = 90;
        const maxHeight = 120;
        const height = minHeight + Math.random() * (maxHeight - minHeight);
        const minWidth = 45;
        const maxWidth = 75;
        const width = minWidth + Math.random() * (maxWidth - minWidth);

        const obstacle = {
            x: canvas.width,
            y: canvas.height - height,
            width: width,
            height: height,
            passed: false
        };
        obstacles.push(obstacle);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (assets.mario.complete) {
            ctx.drawImage(assets.mario, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        obstacles.forEach(obstacle => {
            if (assets.pipe.complete) {
                ctx.drawImage(assets.pipe, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                ctx.fillStyle = "green";
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }

    function update() {
        if (!isGameRunning) return;

        player.vy += player.gravity;
        player.y += player.vy;

        if (player.y >= groundLevel) {
            player.y = groundLevel;
            player.isJumping = false;
            player.vy = 0;
        }

        for (let i = 0; i < obstacles.length; i++) {
            let obstacle = obstacles[i];
            obstacle.x -= obstacleSpeed;

            if (!obstacle.passed && player.x > obstacle.x + obstacle.width) {
                score++;
                scoreElement.textContent = score;
                obstacle.passed = true;
                
                if (score % 5 === 0) {
                    obstacleSpeed += 1.0; // Peningkatan kecepatan lebih signifikan
                    clearInterval(obstacleInterval);
                    obstacleCreationInterval = Math.max(800, obstacleCreationInterval - 150); // Interval lebih pendek
                    obstacleInterval = setInterval(createObstacle, obstacleCreationInterval);
                }
            }

            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                endGame();
                return;
            }
        }
        
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

        draw();
        gameLoop = requestAnimationFrame(update);
    }

    function jump() {
        if (!player.isJumping && isGameRunning) {
            player.isJumping = true;
            player.vy = player.jumpPower;
            assets.jumpSound.currentTime = 0;
            assets.jumpSound.play().catch(e => console.warn("Error playing jump sound. Make sure 'jump.mp3' exists.", e));
        }
    }

    function startGame() {
        if (isGameRunning) return;

        let count = 3;
        countdownElement.textContent = count;
        countdownElement.classList.add('show');
        
        const countdownTimer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
            } else if (count === 0) {
                countdownElement.textContent = 'GO!';
            } else {
                clearInterval(countdownTimer);
                countdownElement.classList.remove('show');
                isGameRunning = true;
                
                score = 0;
                scoreElement.textContent = score;
                obstacles = [];
                player.y = groundLevel;
                player.isJumping = false;
                obstacleSpeed = 6;
                obstacleCreationInterval = 1500;

                startScreen.style.display = 'none';
                gameOverScreen.classList.remove('active');

                createObstacle();
                obstacleInterval = setInterval(createObstacle, obstacleCreationInterval);
                gameLoop = requestAnimationFrame(update);
            }
        }, 1000);
    }

    function endGame() {
        if (!isGameRunning) return;

        isGameRunning = false;
        cancelAnimationFrame(gameLoop);
        clearInterval(obstacleInterval);

        assets.gameOverSound.currentTime = 0;
        assets.gameOverSound.play().catch(e => console.warn("Error playing game over sound. Make sure 'gameover.mp3' exists.", e));

        finalScoreElement.textContent = `Skor Akhir: ${score}`;
        gameOverScreen.classList.add('active');
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp" || event.key === " ") {
            // Mencegah aksi ganda dengan memeriksa apakah game sedang berjalan
            if (!isGameRunning && startScreen.style.display === 'flex') {
                startGame();
            } else if (isGameRunning) {
                jump();
            }
            event.preventDefault(); // Mencegah scrolling saat menekan spasi
        }
    });

    restartButton.addEventListener("click", () => {
        gameOverScreen.classList.remove('active');
        startGame();
    });

    let assetsLoaded = 0;
    const totalAssets = 2;

    const checkAssets = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            startScreen.style.display = 'flex';
        }
    };

    assets.mario.onload = checkAssets;
    assets.pipe.onload = checkAssets;
    
    if (assets.mario.complete) checkAssets();
    if (assets.pipe.complete) checkAssets();
});