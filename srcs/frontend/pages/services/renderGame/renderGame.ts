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

	let resizeTimeout: number | null = null;
	const resizeHandler = () => {
		if (resizeTimeout) return;
		resizeTimeout = window.setTimeout(() => {
			setOptimizedCanvasSize(canvas);
			resizeTimeout = null;
		}, 100);
	};
	window.addEventListener('resize', resizeHandler);

	// Create game entities
	const [leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
	const ball = createBall(canvas, difficulty);
	state.ball = ball;

	// Setup controls and events
	setupControls(leftPaddle, rightPaddle, 6);
	setupGameEvents(container);

	// Setup cleanup function
	gameCleanupFunction = () => {
		cleanupControls();
		cleanupGameEvents();
		window.removeEventListener('resize', resizeHandler);

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

	const atmosphereCanvas = document.getElementById('gris-bg-particles') as HTMLCanvasElement;
	if (!atmosphereCanvas) {
		console.log('⚠️ Atmosphere canvas not found');
		return;
	}

	const atmosphereCtx = atmosphereCanvas.getContext('2d');
	if (!atmosphereCtx) return;

	// Set canvas size
	atmosphereCanvas.width = window.innerWidth;
	atmosphereCanvas.height = window.innerHeight;

	// Lightweight particle system
	class OptimizedParticle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		color: string;
		radius: number;
		opacity: number;
		life: number;
		maxLife: number;

		constructor() {
			this.x = Math.random() * atmosphereCanvas.width;
			this.y = Math.random() * atmosphereCanvas.height;
			this.vx = (Math.random() - 0.5) * 0.5;
			this.vy = (Math.random() - 0.5) * 0.5;

			const colors = [GRIS_COLORS.acceptance, GRIS_COLORS.depression, GRIS_COLORS.bargaining];
			this.color = colors[Math.floor(Math.random() * colors.length)];

			this.radius = Math.random() * 40 + 20;
			this.opacity = Math.random() * 0.3 + 0.1;
			this.life = 0;
			this.maxLife = Math.random() * 3000 + 2000;
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
			this.opacity = Math.max(0, 0.4 * (1 - ageRatio));

			return this.life < this.maxLife;
		}

		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.globalAlpha = this.opacity;
			ctx.globalCompositeOperation = 'multiply';

			const gradient = ctx.createRadialGradient(
				this.x, this.y, 0,
				this.x, this.y, this.radius
			);
			gradient.addColorStop(0, this.color);
			gradient.addColorStop(0.7, this.color + '66');
			gradient.addColorStop(1, 'transparent');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}

	// Reduced particle count for performance
	const particles: OptimizedParticle[] = [];
	for (let i = 0; i < PERFORMANCE.maxParticles; i++) {
		particles.push(new OptimizedParticle());
	}

	let animationId: number;
	function animateParticles() {
		atmosphereCtx!.clearRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);

		// Subtle background gradient
		const gradient = atmosphereCtx!.createRadialGradient(
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, 0,
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, Math.max(atmosphereCanvas.width, atmosphereCanvas.height) / 2
		);
		gradient.addColorStop(0, GRIS_COLORS.background + 'CC');
		gradient.addColorStop(1, GRIS_COLORS.surface + '99');

		atmosphereCtx!.fillStyle = gradient;
		atmosphereCtx!.fillRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);

		// Update and draw particles
		for (let i = particles.length - 1; i >= 0; i--) {
			const particle = particles[i];
			if (!particle.update()) {
				particles.splice(i, 1);
				particles.push(new OptimizedParticle());
			} else {
				particle.draw(atmosphereCtx!);
			}
		}

		animationId = requestAnimationFrame(animateParticles);
	}

	animateParticles();
	console.log('✨ Background effects initialized');

	// Cleanup on resize
	window.addEventListener('resize', () => {
		atmosphereCanvas.width = window.innerWidth;
		atmosphereCanvas.height = window.innerHeight;
	});
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
				const gameLoopCleanup = startGameLoop(
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

				// Add game loop cleanup to main cleanup
				const originalCleanup = gameCleanupFunction;
				gameCleanupFunction = () => {
					if (gameLoopCleanup) gameLoopCleanup();
					if (originalCleanup) originalCleanup();
				};
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
