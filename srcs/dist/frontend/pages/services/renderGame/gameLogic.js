export function resetBall(ball, canvas, speed) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = speed;
    ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = speed * (Math.random() * 2 - 1);
}
export function updatePaddle(paddle, canvas, gameEnded, deltaTime) {
    if (gameEnded)
        return;
    paddle.y += (paddle.dy / 30) * deltaTime * 1000;
    if (paddle.y < 0)
        paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height)
        paddle.y = canvas.height - paddle.height;
}
export function updateBall(ball, leftPaddle, rightPaddle, canvas, maxGames, gameId, deltaTime, onGameEnd) {
    ball.x += (ball.dx / 60) * deltaTime * 1000 * ball.speed;
    ball.y += (ball.dy / 60) * deltaTime * 1000 * ball.speed;
    console.log(ball.speed);
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height)
        ball.dy = -ball.dy;
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.x - ball.radius > leftPaddle.x && ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height) {
        ball.dx = -ball.dx;
        ball.speed += 0.1;
    }
    if (ball.x + ball.radius > rightPaddle.x &&
        ball.x + ball.radius < rightPaddle.x + rightPaddle.width &&
        ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height) {
        ball.dx = -ball.dx;
        ball.speed += 0.1;
    }
    if (ball.x + ball.radius < 0) {
        rightPaddle.score++;
        resetBall(ball, canvas, ball.speed);
    }
    else if (ball.x - ball.radius > canvas.width) {
        leftPaddle.score++;
        resetBall(ball, canvas, ball.speed);
    }
    const totalGames = leftPaddle.score + rightPaddle.score;
    if (totalGames >= maxGames) {
        onGameEnd();
    }
}
