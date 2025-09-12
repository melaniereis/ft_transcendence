//renderGame/renderGame.ts

import { createBall, createPaddles } from './setupGame.js';
import { Ball } from './types.js';
import { startGameLoop } from './gameLoop.js';
import { setupControls, cleanupControls } from './gameControls.js';
import { renderGameLayout } from './layout.js';
import { renderPauseModal, renderAchievementsModal, renderSettingsModal } from './modals.js';
import { state } from './state.js';
import { setupGameEvents, cleanupGameEvents, triggerScoreAnimation } from './events.js';
import { GRIS_COLORS, GRIS_TYPOGRAPHY, PERFORMANCE } from './constants.js';
import { setOptimizedCanvasSize } from './gameCanvas.js';

/**
 * Optimized GRIS-inspired game renderer
 * - Beautiful GRIS aesthetic with excellent performance
 * - Responsive design that works on all devices
 * - Efficient particle system and animations
 * - Proper cleanup to prevent memory leaks
 */


// Persistente para garantir que sempre cancelemos o loop anterior
let stopGameLoop: (() => void) | null = null;
let gameCleanupFunction: (() => void) | null = null;

export function renderGame(
	container: HTMLElement,
	player1Name: string,
	player2Name: string,
	maxGames: number,
	difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal',
	onGameEnd?: (canvas: HTMLCanvasElement, score1: number, score2: number) => void,
	mode: 'single' | 'tournament' | 'quick' = 'single',
	gameId?: number,
	avatar1?: string,
	avatar2?: string
) {
	console.log('🎮 Initializing GRIS-inspired game...');

	// Clean up any existing game
	if (gameCleanupFunction) {
		gameCleanupFunction();
	}

	// Initialize game state
	initializeGameState(player1Name, player2Name, maxGames, mode, gameId, avatar1, avatar2);

	// Render the layout
	container.innerHTML = renderGameLayout({
		player1: state.player1!,
		player2: state.player2!,
		score1: state.score1,
		score2: state.score2,
		round: state.round,
		mode: state.mode,
		avatar1: state.player1?.avatarUrl,
		avatar2: state.player2?.avatarUrl,
		canvasId: 'pong',
		showControls: true,
		modalsHtml: renderModals()
	});

	// Store container reference for cleanup
	state.container = container;

	// Initialize background effects (lightweight)
	setTimeout(() => initializeOptimizedEffects(), 100);

	// Setup canvas and game mechanics
	const canvas = document.getElementById('pong') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;

	// Make canvas responsive
	setOptimizedCanvasSize(canvas);

	// Create game entities (agora persistentes)
	// Se já existirem, apenas atualize propriedades
	let leftPaddle, rightPaddle, ball;
	if (state.player1 && state.player2 && state.ball) {
		leftPaddle = state.player1;
		rightPaddle = state.player2;
		ball = state.ball;
	} else {
		[leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
		ball = createBall(canvas, difficulty);
		state.player1 = leftPaddle;
		state.player2 = rightPaddle;
		state.ball = ball;
	}

	let resizeTimeout: number | null = null;
	const resizeHandler = () => {
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
		resizeTimeout = window.setTimeout(() => {
			// Store old dimensions
			const oldWidth = canvas.width;
			const oldHeight = canvas.height;

			// Update canvas size
			setOptimizedCanvasSize(canvas);

			const newWidth = canvas.width;
			const newHeight = canvas.height;

			if (newWidth === 0 || newHeight === 0 || oldWidth === 0 || oldHeight === 0) {
				resizeTimeout = null;
				return;
			}

			// Scale factors
			const scaleX = newWidth / oldWidth;
			const scaleY = newHeight / oldHeight;

			// Responsive paddle margin
			const paddleMargin = Math.max(5, newWidth * 0.02);

			// Only update if all entities exist
			if (state.player1 && state.player2 && state.ball) {
				// Update left paddle
				state.player1.x = paddleMargin;
				state.player1.width = Math.max(5, newWidth * 0.012);
				state.player1.height = Math.max(30, newHeight * 0.15);
				state.player1.y = Math.max(0, Math.min(state.player1.y * scaleY, newHeight - state.player1.height));

				// Update right paddle
				state.player2.width = state.player1.width;
				state.player2.height = state.player1.height;
				state.player2.x = newWidth - state.player2.width - paddleMargin;
				state.player2.y = Math.max(0, Math.min(state.player2.y * scaleY, newHeight - state.player2.height));

				// Update ball
				state.ball.radius = Math.max(4, newWidth * 0.01);
				state.ball.x = Math.max(state.ball.radius + paddleMargin, Math.min(state.ball.x * scaleX, newWidth - state.ball.radius - paddleMargin));
				state.ball.y = Math.max(state.ball.radius, Math.min(state.ball.y * scaleY, newHeight - state.ball.radius));

				// Scale speeds to maintain relative feel
				state.ball.dx *= scaleX;
				state.ball.dy *= scaleY;

				// Re-attach controls to paddles after resize
				cleanupControls();
				setupControls(state.player1, state.player2, 6);
			}

			// Clear and let game loop redraw
			ctx.clearRect(0, 0, newWidth, newHeight);

			resizeTimeout = null;
		}, 150);
	};
	window.addEventListener('resize', resizeHandler);

	// Setup controls and events
	if (state.player1 && state.player2) {
		setupControls(state.player1, state.player2, 6);
	}
	setupGameEvents(container);

	// Pause/Resume centralizado via events.ts

	// Setup cleanup function
	gameCleanupFunction = () => {
		cleanupControls();
		cleanupGameEvents();
		window.removeEventListener('resize', resizeHandler);
		if (typeof stopGameLoop === 'function') stopGameLoop();

		// Remove background canvas
		const bgCanvas = document.getElementById('gris-bg-particles');
		if (bgCanvas) bgCanvas.remove();

		// Remove any remaining UI elements
		const feedback = document.getElementById('gris-emotional-feedback');
		if (feedback) feedback.remove();

		const confetti = document.getElementById('gris-confetti-canvas');
		if (confetti) confetti.remove();

		console.log('🧹 Game cleanup completed');
	};

	// Start the countdown and game
	startOptimizedCountdown(canvas, ctx, leftPaddle, rightPaddle, ball, maxGames, onGameEnd, mode, gameId);
}

function initializeGameState(
	player1Name: string,
	player2Name: string,
	maxGames: number,
	mode: any,
	gameId?: number,
	avatar1?: string,
	avatar2?: string
) {
	// Initialize player entities
	state.player1 = {
		nickname: player1Name,
		avatarUrl: avatar1 || '/assets/avatar/default.png',
		x: 0, y: 0, width: 10, height: 80, dy: 0, score: 0,
		upKey: 'w', downKey: 's'
	};

	state.player2 = {
		nickname: player2Name,
		avatarUrl: avatar2 || '/assets/avatar/default.png',
		x: 0, y: 0, width: 10, height: 80, dy: 0, score: 0,
		upKey: 'ArrowUp', downKey: 'ArrowDown'
	};

	// Reset game state
	state.score1 = 0;
	state.score2 = 0;
	state.round = 1;
	state.maxRounds = maxGames;
	state.mode = mode;
	state.gameId = gameId;
	state.isPaused = false;
	state.isGameOver = false;
	state.showModals = false;

	// Initialize animation flags
	state.animationFlags = {
		headerFadeIn: true,
		canvasEntry: true,
		scoreUpdate: false,
	};

	console.log('✅ Game state initialized');
}

function renderModals(): string {
	return [
		renderPauseModal(),
		renderAchievementsModal([]),
		renderSettingsModal(renderSettingsContent())
	].join('');
}

function renderSettingsContent(): string {
	return `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label for="volume-setting" style="display: block; margin-bottom: 0.5rem; color: ${GRIS_COLORS.primary};">Audio Volume</label>
                <input type="range" id="volume-setting" min="0" max="100" value="30" style="
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: ${GRIS_COLORS.gradients.ocean};
                    outline: none;
                    cursor: pointer;
                ">
            </div>

            <div>
                <label for="effects-setting" style="display: block; margin-bottom: 0.5rem; color: ${GRIS_COLORS.primary};">Visual Effects</label>
                <select id="effects-setting" style="
                    width: 100%;
                    padding: 0.5rem;
                    border: 2px solid ${GRIS_COLORS.secondary};
                    border-radius: 0.5rem;
                    background: white;
                    color: ${GRIS_COLORS.primary};
                ">
                    <option value="minimal">Minimal</option>
                    <option value="balanced" selected>Balanced</option>
                    <option value="full">Full Effects</option>
                </select>
            </div>

            <div>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" id="haptics-setting" checked style="
                        width: 16px;
                        height: 16px;
                        accent-color: ${GRIS_COLORS.acceptance};
                    ">
                    <span style="color: ${GRIS_COLORS.primary};">Haptic Feedback</span>
                </label>
            </div>
        </div>
    `;
}

function initializeOptimizedEffects() {
	console.log('🌟 Initializing background effects...');

	let atmosphereCanvas = document.getElementById('gris-bg-particles') as HTMLCanvasElement;
	if (!atmosphereCanvas) {
		// Retry after short delay if canvas not found
		setTimeout(initializeOptimizedEffects, 100);
		console.log('⏳ Waiting for atmosphere canvas...');
		return;
	}

	const atmosphereCtx = atmosphereCanvas.getContext('2d');
	if (!atmosphereCtx) {
		setTimeout(initializeOptimizedEffects, 100);
		console.log('⏳ Waiting for atmosphere canvas context...');
		return;
	}

	// Set to window size, but consider clipping or making it container-bound if needed
	atmosphereCanvas.width = window.innerWidth;
	atmosphereCanvas.height = window.innerHeight;


	// Celestial color palette
	const CELESTIAL_COLORS = [
		'#b6a6ca', // lavender
		'#7fc7d9', // blue
		'#e6c79c', // gold
		'#f7b267', // peach
		'#fffbe6', // white
		'#dab883', // gold
		'#a3d9b1', // green
		'#f4f6fa', // pale
		'#faaca8', // pink
	];

	// Particle layers
	class CelestialParticle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		color: string;
		radius: number;
		opacity: number;
		glow: boolean;
		life: number;
		maxLife: number;
		shape: 'circle' | 'star' | 'moon';

		constructor(layer: 'soft' | 'sharp') {
			this.x = Math.random() * atmosphereCanvas.width;
			this.y = Math.random() * atmosphereCanvas.height;
			this.vx = (Math.random() - 0.5) * (layer === 'soft' ? 0.2 : 0.6);
			this.vy = (Math.random() - 0.5) * (layer === 'soft' ? 0.2 : 0.6);
			this.color = CELESTIAL_COLORS[Math.floor(Math.random() * CELESTIAL_COLORS.length)];
			this.radius = layer === 'soft' ? Math.random() * 60 + 30 : Math.random() * 18 + 8;
			this.opacity = layer === 'soft' ? Math.random() * 0.18 + 0.08 : Math.random() * 0.3 + 0.2;
			this.glow = layer === 'soft';
			this.life = 0;
			this.maxLife = Math.random() * 4000 + 2000;
			// Occasionally spawn a star or moon
			if (layer === 'sharp' && Math.random() < 0.08) {
				this.shape = Math.random() < 0.5 ? 'star' : 'moon';
			} else {
				this.shape = 'circle';
			}
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
			this.life++;
			// Wrap around screen
			if (this.x < -this.radius) this.x = atmosphereCanvas.width + this.radius;
			if (this.x > atmosphereCanvas.width + this.radius) this.x = -this.radius;
			if (this.y < -this.radius) this.y = atmosphereCanvas.height + this.radius;
			if (this.y > atmosphereCanvas.height + this.radius) this.y = -this.radius;
			// Fade with age
			const ageRatio = this.life / this.maxLife;
			this.opacity = Math.max(0, (this.glow ? 0.18 : 0.3) * (1 - ageRatio));
			return this.life < this.maxLife;
		}

		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.globalAlpha = this.opacity;
			if (this.glow) {
				ctx.shadowColor = this.color;
				ctx.shadowBlur = 32;
			} else {
				ctx.shadowBlur = 0;
			}
			if (this.shape === 'circle') {
				const gradient = ctx.createRadialGradient(
					this.x, this.y, 0,
					this.x, this.y, this.radius
				);
				gradient.addColorStop(0, this.color);
				gradient.addColorStop(0.7, this.color + '66');
				gradient.addColorStop(1, 'transparent');
				ctx.globalCompositeOperation = this.glow ? 'lighter' : 'screen';
				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
				ctx.fill();
			} else if (this.shape === 'star') {
				ctx.globalCompositeOperation = 'screen';
				ctx.fillStyle = this.color;
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (Math.PI * 2 * i) / 5;
					const x = this.x + Math.cos(angle) * this.radius;
					const y = this.y + Math.sin(angle) * this.radius;
					ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fill();
			} else if (this.shape === 'moon') {
				ctx.globalCompositeOperation = 'screen';
				ctx.fillStyle = this.color;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, Math.PI * 0.25, Math.PI * 1.75);
				ctx.arc(this.x + this.radius * 0.4, this.y, this.radius * 0.7, Math.PI * 1.75, Math.PI * 0.25, true);
				ctx.closePath();
				ctx.fill();
			}
			ctx.restore();
		}
	}

	// Two layers: soft (glow, slow, big), sharp (no glow, fast, small)
	const softParticles: CelestialParticle[] = [];
	const sharpParticles: CelestialParticle[] = [];
	for (let i = 0; i < Math.floor(PERFORMANCE.maxParticles * 0.6); i++) {
		softParticles.push(new CelestialParticle('soft'));
	}
	for (let i = 0; i < Math.floor(PERFORMANCE.maxParticles * 0.7); i++) {
		sharpParticles.push(new CelestialParticle('sharp'));
	}

	let animationId: number;

	function animateParticles() {
		atmosphereCtx!.clearRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);


		// Celestial multi-stop gradient background
		const gradient = atmosphereCtx!.createRadialGradient(
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, 0,
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, Math.max(atmosphereCanvas.width, atmosphereCanvas.height) / 2
		);
		gradient.addColorStop(0, '#fffbe6'); // white
		gradient.addColorStop(0.25, '#b6a6ca'); // lavender
		gradient.addColorStop(0.45, '#7fc7d9'); // blue
		gradient.addColorStop(0.65, '#e6c79c'); // gold
		gradient.addColorStop(0.85, '#faaca8'); // pink
		gradient.addColorStop(1, '#f4f6fa'); // pale
		atmosphereCtx!.fillStyle = gradient;
		atmosphereCtx!.fillRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);




		// Draw particles behind everything
		atmosphereCtx!.globalCompositeOperation = 'destination-over';
		// Animate soft particles
		for (let i = softParticles.length - 1; i >= 0; i--) {
			const particle = softParticles[i];
			if (!particle.update()) {
				softParticles.splice(i, 1);
				softParticles.push(new CelestialParticle('soft'));
			} else {
				particle.draw(atmosphereCtx!);
			}
		}
		// Animate sharp particles
		for (let i = sharpParticles.length - 1; i >= 0; i--) {
			const particle = sharpParticles[i];
			if (!particle.update()) {
				sharpParticles.splice(i, 1);
				sharpParticles.push(new CelestialParticle('sharp'));
			} else {
				particle.draw(atmosphereCtx!);
			}
		}

		// Occasionally animate a faint light ray
		if (Math.random() < 0.03) {
			atmosphereCtx!.save();
			atmosphereCtx!.globalAlpha = 0.12;
			atmosphereCtx!.globalCompositeOperation = 'lighter';
			const rayX = Math.random() * atmosphereCanvas.width;
			const rayY = Math.random() * atmosphereCanvas.height;
			const rayLength = Math.random() * 180 + 120;
			const rayAngle = Math.random() * Math.PI * 2;
			atmosphereCtx!.translate(rayX, rayY);
			atmosphereCtx!.rotate(rayAngle);
			const rayGradient = atmosphereCtx!.createLinearGradient(0, 0, rayLength, 0);
			rayGradient.addColorStop(0, '#fffbe6');
			rayGradient.addColorStop(0.5, '#e6c79c');
			rayGradient.addColorStop(1, 'transparent');
			atmosphereCtx!.fillStyle = rayGradient;
			atmosphereCtx!.fillRect(0, -6, rayLength, 12);
			atmosphereCtx!.restore();
		}


		animationId = requestAnimationFrame(animateParticles);
	}

	animateParticles();
	console.log('✨ Background effects initialized');

	// Update on resize
	const resizeBg = () => {
		atmosphereCanvas.width = window.innerWidth;
		atmosphereCanvas.height = window.innerHeight;
	};
	window.addEventListener('resize', resizeBg);

	// Add to existing cleanup
	const originalCleanup = gameCleanupFunction;
	gameCleanupFunction = () => {
		cancelAnimationFrame(animationId);
		window.removeEventListener('resize', resizeBg);
		if (originalCleanup) originalCleanup();
	};
}

function startOptimizedCountdown(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	leftPaddle: any,
	rightPaddle: any,
	ball: any,
	maxGames: number,
	onGameEnd: any,
	mode: any,
	gameId?: number
) {
	console.log('⏰ Starting countdown...');

	let countdown = 3;
	const countdownMessages = ['Ready?', 'Set...', 'Go!'];

	function drawCountdown() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Dark background
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, '#1a1a2e');
		gradient.addColorStop(1, '#16213e');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Countdown number
		ctx.save();
		ctx.fillStyle = '#ffffff';
		ctx.shadowColor = GRIS_COLORS.acceptance;
		ctx.shadowBlur = 30;
		ctx.font = `bold ${Math.min(canvas.width / 8, 120)}px ${GRIS_TYPOGRAPHY.fonts.display}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const numberY = canvas.height / 2 - 20;
		ctx.fillText(countdown.toString(), canvas.width / 2, numberY);

		// Message
		ctx.font = `${Math.min(canvas.width / 20, 32)}px ${GRIS_TYPOGRAPHY.fonts.body}`;
		ctx.fillStyle = GRIS_COLORS.acceptance;
		ctx.shadowBlur = 20;
		const messageY = canvas.height / 2 + 60;
		ctx.fillText(countdownMessages[3 - countdown] || 'Ready?', canvas.width / 2, messageY);

		ctx.restore();
	}

	function startCountdown() {
		drawCountdown();

		const interval = setInterval(() => {
			countdown--;
			if (countdown > 0) {
				drawCountdown();
			} else {
				clearInterval(interval);
				console.log('🚀 Starting game loop...');

				// Start the game
				stopGameLoop = startGameLoop(
					canvas,
					ctx,
					leftPaddle,
					rightPaddle,
					ball as Ball,
					maxGames,
					(score1: number, score2: number) => {
						state.score1 = score1;
						state.score2 = score2;
						triggerScoreAnimation();
						if (onGameEnd) onGameEnd(canvas, score1, score2);
					},
					mode,
					gameId
				);
			}
		}, 1000);
	}

	startCountdown();
}

// Export cleanup function for external use
export function cleanupGame() {
	if (gameCleanupFunction) {
		gameCleanupFunction();
		gameCleanupFunction = null;
	}
}

console.log('🎨 GRIS-inspired game renderer loaded with optimizations!');
