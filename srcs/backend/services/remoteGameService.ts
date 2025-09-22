import { GameRoom } from '../types/webSocket.js'; // Use webSocket.js

const canvasWidth = 1280;
const canvasHeight = 680;
const ballRadius = 10;
const paddleWidth = 12;
const paddleXLeft = 30;
const paddleXRight = canvasWidth - 30 - paddleWidth;

// Constants for improved game physics matching frontend
const SPEED_INCREMENT = 0.05; // Much smaller increment for time-based movement
const MAX_SPEED = 2.0; // Reasonable max speed multiplier for time-based movement
const PIXELS_PER_SECOND = 300; // Base movement speed in pixels per second

export function startGameLoop(gameRoom: GameRoom) {
	if (!gameRoom) 
		return;

	// Initialize timing
	gameRoom.lastUpdateTime = performance.now();

	gameRoom.intervalId = setInterval(() => {
		const r = gameRoom;
		if (!r) 
			return;

		// Calculate delta time for time-based movement
		const currentTime = performance.now();
		const deltaTime = currentTime - (r.lastUpdateTime || currentTime);
		r.lastUpdateTime = currentTime;

		// Move ball with time-based physics
		moveBall(r, deltaTime);

		// Bounce off top/bottom walls with advanced collision detection
		bounceBallOffWalls(r, deltaTime);

		// Handle paddle collisions with continuous collision detection
		handlePaddleCollisions(r, deltaTime);

		// Handle scoring
		checkScoring(r);

		// Move paddles with time-based movement
		movePaddles(r, deltaTime);

		// Send updates to players
		sendGameUpdates(r);
	}, 1000 / 60); // 60 FPS
}

// Move the ball using time-based physics matching frontend
function moveBall(r: GameRoom, deltaTime: number = 16.67) {
	// Convert deltaTime from milliseconds to seconds
	const deltaSeconds = deltaTime / 1000;
	
	// Calculate the movement distance for this frame using frontend constants
	const moveDistance = PIXELS_PER_SECOND * r.ballSpeed * deltaSeconds;
	const moveX = r.ballDX * moveDistance;
	const moveY = r.ballDY * moveDistance;
	
	// Move the ball using time-based calculation
	r.ballX += moveX;
	r.ballY += moveY;
	
	// Update legacy velocity for backward compatibility
	r.ballVX = r.ballDX * PIXELS_PER_SECOND * r.ballSpeed;
	r.ballVY = r.ballDY * PIXELS_PER_SECOND * r.ballSpeed;
}

// Bounce the ball off the top and bottom walls with continuous collision detection
function bounceBallOffWalls(r: GameRoom, deltaTime: number = 16.67) {
	// Convert deltaTime from milliseconds to seconds
	const deltaSeconds = deltaTime / 1000;
	const moveDistance = PIXELS_PER_SECOND * r.ballSpeed * deltaSeconds;
	const moveY = r.ballDY * moveDistance;
	
	// Calculate previous position for collision detection
	const prevY = r.ballY - moveY;

	// Continuous collision detection for top/bottom walls
	if (r.ballDY < 0) { // Ball moving up
		// Check if ball crossed the top wall this frame
		if (prevY - ballRadius > 0 && r.ballY - ballRadius <= 0) {
			// Calculate where the ball would be when it hits the top wall
			const timeToCollision = (prevY - ballRadius) / Math.abs(moveY);
			const collisionX = (r.ballX - r.ballDX * moveDistance) + r.ballDX * moveDistance * timeToCollision;
			
			r.ballDY = -r.ballDY;
			r.ballY = ballRadius; // Position ball correctly at top wall
			r.ballX = collisionX; // Use collision X position
			
			if (r.ballSpeed < MAX_SPEED) {
				r.ballSpeed += SPEED_INCREMENT;
			}
		}
	} else if (r.ballDY > 0) { // Ball moving down
		// Check if ball crossed the bottom wall this frame
		if (prevY + ballRadius < canvasHeight && r.ballY + ballRadius >= canvasHeight) {
			// Calculate where the ball would be when it hits the bottom wall
			const timeToCollision = (canvasHeight - prevY - ballRadius) / Math.abs(moveY);
			const collisionX = (r.ballX - r.ballDX * moveDistance) + r.ballDX * moveDistance * timeToCollision;
			
			r.ballDY = -r.ballDY;
			r.ballY = canvasHeight - ballRadius; // Position ball correctly at bottom wall
			r.ballX = collisionX; // Use collision X position
			
			if (r.ballSpeed < MAX_SPEED) {
				r.ballSpeed += SPEED_INCREMENT;
			}
		}
	}
}

// Handle paddle collisions with continuous collision detection and spin
function handlePaddleCollisions(r: GameRoom, deltaTime: number = 16.67) {
	// Convert deltaTime from milliseconds to seconds
	const deltaSeconds = deltaTime / 1000;
	const moveDistance = PIXELS_PER_SECOND * r.ballSpeed * deltaSeconds;
	const moveX = r.ballDX * moveDistance;
	const moveY = r.ballDY * moveDistance;
	
	// Calculate previous position for collision detection
	const prevX = r.ballX - moveX;
	const prevY = r.ballY - moveY;

	// Continuous collision detection for left paddle
	if (r.ballDX < 0) { // Ball moving left
		const leftPaddleRight = paddleXLeft + paddleWidth;
		// Check if ball crossed the paddle's right edge this frame
		if (prevX - ballRadius > leftPaddleRight && r.ballX - ballRadius <= leftPaddleRight) {
			// Calculate where the ball would be when it hits the paddle edge
			const timeToCollision = (prevX - ballRadius - leftPaddleRight) / Math.abs(moveX);
			const collisionY = prevY + moveY * timeToCollision;
			
			// Check if collision point is within paddle bounds
			if (collisionY + ballRadius > r.leftY && 
				collisionY - ballRadius < r.leftY + r.paddleHeight) {
				
				r.ballDX = -r.ballDX;
				r.ballX = leftPaddleRight + ballRadius; // Position ball correctly
				r.ballY = collisionY; // Use collision Y position
				
				// Add spin based on where the ball hits the paddle
				const hitPos = (collisionY - r.leftY) / r.paddleHeight;
				r.ballDY += (hitPos - 0.5) * 0.3; // Reduced spin for stability
				
				if (r.ballSpeed < MAX_SPEED) {
					r.ballSpeed += SPEED_INCREMENT;
				}
			}
		}
	}

	// Continuous collision detection for right paddle
	if (r.ballDX > 0) { // Ball moving right
		const rightPaddleLeft = paddleXRight;
		// Check if ball crossed the paddle's left edge this frame
		if (prevX + ballRadius < rightPaddleLeft && r.ballX + ballRadius >= rightPaddleLeft) {
			// Calculate where the ball would be when it hits the paddle edge
			const timeToCollision = (rightPaddleLeft - prevX - ballRadius) / Math.abs(moveX);
			const collisionY = prevY + moveY * timeToCollision;
			
			// Check if collision point is within paddle bounds
			if (collisionY + ballRadius > r.rightY && 
				collisionY - ballRadius < r.rightY + r.paddleHeight) {
				
				r.ballDX = -r.ballDX;
				r.ballX = rightPaddleLeft - ballRadius; // Position ball correctly
				r.ballY = collisionY; // Use collision Y position
				
				// Add spin based on where the ball hits the paddle
				const hitPos = (collisionY - r.rightY) / r.paddleHeight;
				r.ballDY += (hitPos - 0.5) * 0.3; // Reduced spin for stability
				
				if (r.ballSpeed < MAX_SPEED) {
					r.ballSpeed += SPEED_INCREMENT;
				}
			}
		}
	}
}

// Check if the ball is out of bounds and update scores
function checkScoring(r: GameRoom) {
	if (r.ballX + ballRadius < 0) {
		// Ball went off left side - Right player scores (left player missed)
		r.rightScore++;
		handleScoreUpdate(r);
	} else if (r.ballX - ballRadius > canvasWidth) {
		// Ball went off right side - Left player scores (right player missed)
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

// Reset the ball position after scoring - matching frontend logic
function resetBallPosition(r: GameRoom) {
	r.ballX = canvasWidth / 2;
	r.ballY = canvasHeight / 2;
	r.ballSpeed = r.ballInitialSpeed;
	r.ballDX = Math.random() > 0.5 ? 1 : -1;  // Direction normalized (-1 or 1)
	r.ballDY = (Math.random() * 2 - 1);      // Direction normalized (-1 to 1)
	
	// Update legacy velocity for backward compatibility
	r.ballVX = r.ballDX * PIXELS_PER_SECOND * r.ballSpeed;
	r.ballVY = r.ballDY * PIXELS_PER_SECOND * r.ballSpeed;
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

// Move paddles based on user input with time-based movement
function movePaddles(r: GameRoom, deltaTime: number = 16.67) {
	// Convert deltaTime from milliseconds to seconds for smooth movement
	const deltaSeconds = deltaTime / 1000;
	
	// Time-based paddle movement (speed is now in pixels per second)
	const paddleSpeed = 400; // pixels per second to match frontend
	
	if (r.leftMovingUp) {
		r.leftY = Math.max(r.leftY - paddleSpeed * deltaSeconds, 0);
	}
	if (r.leftMovingDown) {
		r.leftY = Math.min(r.leftY + paddleSpeed * deltaSeconds, canvasHeight - r.paddleHeight);
	}

	if (r.rightMovingUp) {
		r.rightY = Math.max(r.rightY - paddleSpeed * deltaSeconds, 0);
	}
	if (r.rightMovingDown) {
		r.rightY = Math.min(r.rightY + paddleSpeed * deltaSeconds, canvasHeight - r.paddleHeight);
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
