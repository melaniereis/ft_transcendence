import { Paddle, Ball } from './types';

const PADDLE_SPEED = 5;
const PREDICTION_ERROR_FACTOR = 0.15;

export function updateAIPaddle(
	paddle: Paddle,
	ball: Ball,
	canvas: HTMLCanvasElement,
	currentTime: number,
	lastAIUpdate: number,
	targetY: number
): { updatedTargetY: number; updatedLastAIUpdate: number } {
	let newTargetY = targetY;
	let newLastAIUpdate = lastAIUpdate;

	if (currentTime - lastAIUpdate >= 1000)
	{
		newTargetY = calculateAITargetY(ball, canvas, paddle);
		newLastAIUpdate = currentTime;

		//TODO: Hook for power-ups: If implemented, check if a power-up is active/collectible and adjust targetY.
		// For example: if (powerUpActive && canCollectPowerUp()) { newTargetY = adjustForPowerUp(newTargetY, powerUpY); }
		handleAIPowerUps(paddle, ball, canvas); // Placeholder
	}

	// Simulate keyboard input
	const paddleCenterY = paddle.y + paddle.height / 2;
	if (paddleCenterY < newTargetY - paddle.height * 0.1)
		paddle.dy = PADDLE_SPEED; // down
	else if (paddleCenterY > newTargetY + paddle.height * 0.1)
		paddle.dy = -PADDLE_SPEED; // up
	else
		paddle.dy = 0; //no key press
	
	paddle.y += paddle.dy;
	if (paddle.y < 0)
		paddle.y = 0;
	if (paddle.y + paddle.height > canvas.height)
		paddle.y = canvas.height - paddle.height;

	return { updatedTargetY: newTargetY, updatedLastAIUpdate: newLastAIUpdate };
}

function calculateAITargetY(ball: Ball, canvas: HTMLCanvasElement, paddle: Paddle): number
{
	if (ball.dx <= 0) // Ball going away repositions to center
		return (canvas.height / 2 - paddle.height /2);

	let predX = ball.x;
	let predY = ball.y;
	let predDX = ball.dx;
	let predDY = ball.dy;
	const targetX = paddle.x - ball.radius;

	let iterations = 0;
	const maxIterations = 1000; // for safety; canvas width / min dx

	while (predX < targetX && iterations < maxIterations)
	{
		predX += predDX;
		predY += predDY;

		//Simulate wall bounce
		if (predY - ball.radius < o || predY + ball.radius > canvas.height)
			predDY = -predDY;
		iterations++;
	}

	const error = (Math.random() * 2 - 1) * paddle.height * PREDICTION_ERROR_FACTOR;
	const predictedY = predY + error;

	return (predictedY - paddle.height / 2);
}

function handleAIPowerUps(paddle: Paddle, ball: Ball, canvas: HTMLCanvasElement)
{

}

