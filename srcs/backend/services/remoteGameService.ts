import { GameRoom } from '../types/gameRoom';

export function startGameLoop(gameRoom: GameRoom) {
	if (!gameRoom) return;

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
	}, 1000 / 60);
}

// Move the ball based on velocity
function moveBall(r: GameRoom) {
	r.ballX += r.ballVX;
	r.ballY += r.ballVY;
}

// Bounce the ball off the top and bottom walls
function bounceBallOffWalls(r: GameRoom) {
	if (r.ballY <= 10 || r.ballY >= 390) {
		r.ballVY = -r.ballVY;
	}
}

// Handle paddle collisions
function handlePaddleCollisions(r: GameRoom) {
// Left paddle collision
	if (r.ballX <= 30 && r.ballY >= r.leftY && r.ballY <= r.leftY + r.paddleHeight) {
		r.ballVX = -r.ballVX;
		r.ballX = 30;
	}

// Right paddle collision
	if (r.ballX >= 770 && r.ballY >= r.rightY && r.ballY <= r.rightY + r.paddleHeight) {
		r.ballVX = -r.ballVX;
		r.ballX = 770;
	}
}

// Check if the ball is out of bounds and update scores
function checkScoring(r: GameRoom) {
	if (r.ballX < 0 || r.ballX > 800) {
		if (r.ballX < 0)
			r.rightScore++;
		else
		r.leftScore++;

		// Check if max score has been reached
		if (r.leftScore + r.rightScore >= r.maxScore) {
			const winnerName = r.leftScore > r.rightScore ? r.left?.username : r.right?.username;
			[r.left, r.right].forEach((player) => {
				if (player && player.readyState === player.OPEN) {
				player.send(JSON.stringify({
					type: 'end',
					message: `${winnerName} wins!`,
					leftScore: r.leftScore,
					rightScore: r.rightScore,
					leftPlayerName: r.left?.username,
					rightPlayerName: r.right?.username,
				}));
				}
			});

			if (r.intervalId) clearInterval(r.intervalId);
				return;
		} 
		else {
			resetBallPosition(r);
			sendScoreUpdate(r);
		}
	}
}

// Reset the ball position after scoring
function resetBallPosition(r: GameRoom) {
	r.ballX = 400;
	r.ballY = 200;
	r.ballVX = r.ballVX > 0 ? 7 : -5;
	r.ballVY = 5;
}

// Send score update to players
function sendScoreUpdate(r: GameRoom) {
	const scoreUpdateMessage = JSON.stringify({
		type: 'scoreUpdate',
		leftScore: r.leftScore,
		rightScore: r.rightScore,
		message: `Score update: ${r.leftScore} - ${r.rightScore}`,
		leftPlayerName: r.left?.username,
		rightPlayerName: r.right?.username,
	});

	[r.left, r.right].forEach((player) => {
		if (player && player.readyState === player.OPEN)
			player.send(scoreUpdateMessage);
	});
}

// Move paddles based on user input
function movePaddles(r: GameRoom) {
	const speed = 5;
	if (r.leftMovingUp)
		r.leftY = Math.max(r.leftY - speed, 0);
	if (r.leftMovingDown)
		r.leftY = Math.min(r.leftY + speed, 400 - r.paddleHeight);
	if (r.rightMovingUp)
		r.rightY = Math.max(r.rightY - speed, 0);
	if (r.rightMovingDown)
		r.rightY = Math.min(r.rightY + speed, 400 - r.paddleHeight);
}

// Send the current game state to both players
function sendGameUpdates(r: GameRoom) {
	const gameUpdateMessage = JSON.stringify({
		type: 'update',
		ball: { x: r.ballX, y: r.ballY },
		paddles: { leftY: r.leftY, rightY: r.rightY },
		leftScore: r.leftScore,
		rightScore: r.rightScore,
	});

	[r.left, r.right].forEach((player) => {
		if (player && player.readyState === player.OPEN) {
		player.send(gameUpdateMessage);
		}
	});
}
