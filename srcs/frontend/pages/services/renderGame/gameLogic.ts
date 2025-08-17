export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    score: number;
    upKey: string;
    downKey: string;
    nickname: string;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    initialSpeed: number;
    dx: number;
    dy: number;
}

export function resetBall(ball: Ball, canvas: HTMLCanvasElement, speed: number) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = speed;
    ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = speed * (Math.random() * 2 - 1);
}

export function updatePaddle(paddle: Paddle, canvas: HTMLCanvasElement, gameEnded: boolean) {
    if (gameEnded) 
        return;
    paddle.y += paddle.dy;
    if (paddle.y < 0) 
        paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) 
        paddle.y = canvas.height - paddle.height;
}

export function updateBall(ball: Ball, leftPaddle: Paddle, rightPaddle: Paddle, canvas: HTMLCanvasElement,
    maxGames: number, gameId: number, onGameEnd: () => void) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height)
        ball.dy = -ball.dy;

    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
    ball.x - ball.radius > leftPaddle.x && ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + leftPaddle.height)
        ball.dx = -ball.dx;

    if (ball.x + ball.radius > rightPaddle.x &&
    ball.x + ball.radius < rightPaddle.x + rightPaddle.width &&
    ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height)
        ball.dx = -ball.dx;

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
