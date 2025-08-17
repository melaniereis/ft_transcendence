import { Paddle } from './gameLogic.js';

export function setupControls(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number) {
const keysPressed: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => {
	keysPressed[e.key] = true;

	leftPaddle.dy = keysPressed[leftPaddle.upKey]
	? -paddleSpeed
	: keysPressed[leftPaddle.downKey]
	? paddleSpeed
	: 0;

	rightPaddle.dy = keysPressed[rightPaddle.upKey]
	? -paddleSpeed
	: keysPressed[rightPaddle.downKey]
	? paddleSpeed
	: 0;
});

window.addEventListener('keyup', (e) => {
	keysPressed[e.key] = false;

	leftPaddle.dy = keysPressed[leftPaddle.upKey]
	? -paddleSpeed
	: keysPressed[leftPaddle.downKey]
	? paddleSpeed
	: 0;

	rightPaddle.dy = keysPressed[rightPaddle.upKey]
	? -paddleSpeed
	: keysPressed[rightPaddle.downKey]
	? paddleSpeed
	: 0;
});
}
