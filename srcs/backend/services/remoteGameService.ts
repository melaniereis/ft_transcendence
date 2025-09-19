import { GameRoom } from '../types/webSocket.js'; // Use webSocket.js

const canvasWidth = 1280;
const canvasHeight = 680;
const ballRadius = 10;
const paddleWidth = 12;
const paddleXLeft = 30;
const paddleXRight = canvasWidth - 30 - paddleWidth;

export function startGameLoop(gameRoom: GameRoom) {
	if (!gameRoom) 
		return;

	gameRoom.intervalId = setInterval(() => {
		const r = gameRoom;
		if (!r) return;

		// Move ball
		moveBall(r);

		// Bounce off top/bottom walls
		bounceBallOffWalls(r);

		// Handle paddle collisions
		handlePaddleCollisions(r);

		// Handle scoring
		checkScoring(r);

		// Move paddles
		movePaddles(r);

		// Send updates to players
		sendGameUpdates(r);
	}, 1000 / 60); // 60 FPS
}

// Move the ball based on velocity
function moveBall(r: GameRoom) {
	r.ballX += r.ballVX;
	r.ballY += r.ballVY;
}

// Bounce the ball off the top and bottom walls
function bounceBallOffWalls(r: GameRoom) {
	if (r.ballY - ballRadius <= 0) {
		r.ballVY = -r.ballVY;
		r.ballY = ballRadius;
	} else if (r.ballY + ballRadius >= canvasHeight) {
		r.ballVY = -r.ballVY;
		r.ballY = canvasHeight - ballRadius;
	}
}

// Handle paddle collisions
function handlePaddleCollisions(r: GameRoom) {
	// Left paddle collision
	if (r.ballX - ballRadius <= paddleXLeft + paddleWidth &&
		r.ballX - ballRadius >= paddleXLeft &&
		r.ballY >= r.leftY &&
		r.ballY <= r.leftY + r.paddleHeight) {
		r.ballVX = -r.ballVX;
		r.ballX = paddleXLeft + paddleWidth + ballRadius;
	}

	// Right paddle collision
	if (r.ballX + ballRadius >= paddleXRight &&
		r.ballX + ballRadius <= paddleXRight + paddleWidth &&
		r.ballY >= r.rightY &&
		r.ballY <= r.rightY + r.paddleHeight) {
		r.ballVX = -r.ballVX;
		r.ballX = paddleXRight - ballRadius;
	}
}

// Check if the ball is out of bounds and update scores
function checkScoring(r: GameRoom) {
	if (r.ballX + ballRadius < 0) {
		// Right player scores
		r.rightScore++;
		handleScoreUpdate(r);
	} else if (r.ballX - ballRadius > canvasWidth) {
		// Left player scores
		r.leftScore++;
		handleScoreUpdate(r);
	}
}

function handleScoreUpdate(r: GameRoom) {
	if ((r.leftScore + r.rightScore) >= r.maxScore) {
		const winnerName = r.leftScore > r.rightScore ? r.left?.username : r.right?.username;
		sendScoreUpdate(r);

		[r.left, r.right].forEach((player) => {
			if (player && player.readyState === player.OPEN) {
				player.send(JSON.stringify({
					type: 'end',
					message: `${winnerName} wins!`,
					leftScore: r.leftScore,
					rightScore: r.rightScore,
					leftPlayerName: r.left?.username,
					rightPlayerName: r.right?.username
				}));
			}
		});

		// Stop game loop
		if (r.intervalId) {
			clearInterval(r.intervalId);
			r.intervalId = undefined;
		}
		return;
	}

	// Continue game
	resetBallPosition(r);
	sendScoreUpdate(r);
}

// Reset the ball position after scoring
function resetBallPosition(r: GameRoom) {
	r.ballX = canvasWidth / 2;
	r.ballY = canvasHeight / 2;
	r.ballVX = Math.random() > 0.5 ? 7 : -7;
	r.ballVY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

// Send score update to players
function sendScoreUpdate(r: GameRoom) {
	const scoreUpdateMessage = JSON.stringify({
		type: 'scoreUpdate',
		leftScore: r.leftScore,
		rightScore: r.rightScore,
		message: `Score update: ${r.leftScore} - ${r.rightScore}`,
		leftPlayerName: r.left?.username,
		rightPlayerName: r.right?.username
	});

	[r.left, r.right].forEach((player) => {
		if (player && player.readyState === player.OPEN) {
			player.send(scoreUpdateMessage);
		}
	});
}

// Move paddles based on user input
function movePaddles(r: GameRoom) {
	const speed = 5;

	if (r.leftMovingUp) {
		r.leftY = Math.max(r.leftY - speed, 0);
	}
	if (r.leftMovingDown) {
		r.leftY = Math.min(r.leftY + speed, canvasHeight - r.paddleHeight);
	}

	if (r.rightMovingUp) {
		r.rightY = Math.max(r.rightY - speed, 0);
	}
	if (r.rightMovingDown) {
		r.rightY = Math.min(r.rightY + speed, canvasHeight - r.paddleHeight);
	}
}

// Send the current game state to both players
function sendGameUpdates(r: GameRoom) {
	const gameUpdateMessage = JSON.stringify({
		type: 'update',
		ball: { x: r.ballX, y: r.ballY },
		paddles: { leftY: r.leftY, rightY: r.rightY },
		leftScore: r.leftScore,
		rightScore: r.rightScore
	});

	[r.left, r.right].forEach((player) => {
		if (player && player.readyState === player.OPEN) {
			player.send(gameUpdateMessage);
		}
	});
}
