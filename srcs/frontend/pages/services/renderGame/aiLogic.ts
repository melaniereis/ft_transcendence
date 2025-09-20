import { Paddle, Ball } from './types';

const BASE_PADDLE_SPEED = 5;
const PREDICTION_ERROR_FACTOR = 0.15;

export function updateAIPaddle(
	paddle: Paddle,
	ball: Ball,
	canvas: HTMLCanvasElement,
	currentTime: number,
	lastAIUpdate: number,
	targetY: number,
	difficulty: string = 'normal'
): { updatedTargetY: number; updatedLastAIUpdate: number }
{
	let newTargetY = targetY;
	let newLastAIUpdate = lastAIUpdate;

	const updateInterval = getAIUpdateInterval(difficulty); // Dynamic update interval
	if (currentTime - lastAIUpdate >= updateInterval)
	{
		newTargetY = calculateAITargetY(ball, canvas, paddle, difficulty);
		newLastAIUpdate = currentTime;

    	// TODO: Hook for power-ups
    	handleAIPowerUps(paddle, ball, canvas);
	}

	// Scale paddle speed based on difficulty
	const paddleSpeed = getAIPaddleSpeed(difficulty);
	const paddleCenterY = paddle.y + paddle.height / 2;

	if (paddleCenterY < newTargetY - paddle.height * 0.1)
		paddle.dy = paddleSpeed; // Move down
  	else if (paddleCenterY > newTargetY + paddle.height * 0.1)
    	paddle.dy = -paddleSpeed; // Move up
	else
		paddle.dy = 0; // Stop

	paddle.y += paddle.dy;
	if (paddle.y < 0)
		paddle.y = 0;
	if (paddle.y + paddle.height > canvas.height)
		paddle.y = canvas.height - paddle.height;

	return { updatedTargetY: newTargetY, updatedLastAIUpdate: newLastAIUpdate };
}

function calculateAITargetY(ball: Ball, canvas: HTMLCanvasElement, paddle: Paddle, difficulty: string): number
{
	if (ball.dx <= 0)
		return (canvas.height / 2 - paddle.height / 2); // Center when ball moves away

	let predX = ball.x;
	let predY = ball.y;
	let predDX = ball.dx;
	let predDY = ball.dy;
	const targetX = paddle.x - ball.radius;

	const speedFactor = getSpeedFactor(difficulty);
	const errorMultiplier = getPredictionErrorMultiplier(difficulty);
	let iterations = 0;
	const maxIterations = 1000; // Safety limit

	while (predX < targetX && iterations < maxIterations)
	{
		predX += predDX * speedFactor;
		predY += predDY * speedFactor;

		if (predY - ball.radius < 0 || predY + ball.radius > canvas.height)
			predDY = -predDY;
		iterations++;
	}

	const error = (Math.random() * 2 - 1) * paddle.height * PREDICTION_ERROR_FACTOR * errorMultiplier;
	const predictedY = predY + error;

	return (Math.max(0, Math.min(canvas.height - paddle.height, predictedY)));
}

function getAIUpdateInterval(difficulty: string): number
{
	switch (difficulty)
	{
		case 'easy':
			return (1200);
		case 'normal':
			return (1000); // 1 second
		case 'hard':
			return (600);
		case 'crazy':
			return (500);
		default:
			return (1000);
	}
}

function getAIPaddleSpeed(difficulty: string): number
{
	const baseSpeed = BASE_PADDLE_SPEED;
	switch (difficulty)
	{
		case 'easy':
			return (baseSpeed * 0.7);
		case 'normal':
			return (baseSpeed * 1.0); // Default
		case 'hard':
			return (baseSpeed * 1.4); // 40% faster
		case 'crazy':
			return (baseSpeed * 1.6);
		default:
			return (baseSpeed);
	}
}

function getSpeedFactor(difficulty: string): number
{
	switch (difficulty)
	{
		case 'easy':
			return (0.8); // Slower prediction for easier difficulty
		case 'normal':
			return (1.0);
		case 'hard':
			return (1.4);
		case 'crazy':
			return (1.7); // Faster prediction to match crazy dificulty
		default:
			return (1.0);
	}
}

function getPredictionErrorMultiplier(difficulty: string): number
{
	switch (difficulty)
	{
		case 'easy':
			return (2.0); // Double the error for more misses
		case 'normal':
			return (1.5);
		case 'hard':
			return (1.0); // Standard error
		case 'crazy':
			return (0.8);
		default:
			return (1.0);
	}
}

function handleAIPowerUps(paddle: Paddle, ball: Ball, canvas: HTMLCanvasElement)
{
	// Placeholder for future power-up logic
}