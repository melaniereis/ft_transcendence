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
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;

const t = translations[lang];
let stopGameLoop: (() => void) | null = null;
let gameCleanupFunction: (() => void) | null = null;

export function renderGame(container: HTMLElement, player1Name: string, player2Name: string,
	maxGames: number, difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal',
	onGameEnd?: (canvas: HTMLCanvasElement, score1: number, score2: number) => void,
	mode: 'single' | 'tournament' | 'quick' = 'single', gameId?: number, avatar1?: string, avatar2?: string,
	isAI: boolean = false) {

	// Helper to truncate names
	function truncateName(name: string, maxLen: number = 16): string {
		return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
	}

	if (gameCleanupFunction) {
		gameCleanupFunction();
	}

	// Truncate player names before initializing state
	const safePlayer1Name = truncateName(player1Name);
	const safePlayer2Name = truncateName(player2Name);

	// Create basic UI layout first
	container.innerHTML = renderGameLayout({
		player1: { nickname: safePlayer1Name, avatarUrl: avatar1 || '/default.png' } as any, 
		player2: { nickname: safePlayer2Name, avatarUrl: avatar2 || '/default.png' } as any,
		score1: 0, score2: 0, round: 1, mode: mode,
		avatar1: avatar1, avatar2: avatar2, canvasId: 'pong',
		showControls: true, modalsHtml: renderModals()
	});

	setTimeout(() => {
		const gameCanvas = document.getElementById('pong');
		if (gameCanvas) (gameCanvas as HTMLCanvasElement).style.willChange = 'transform';
		const bgCanvas = document.getElementById('gris-bg-particles');
		if (bgCanvas) (bgCanvas as HTMLCanvasElement).style.willChange = 'transform';
	}, 200);

	state.container = container;
	setTimeout(() => initializeOptimizedEffects(), 100);

	const canvas = document.getElementById('pong') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d')!;
	setOptimizedCanvasSize(canvas);

	// Now create the actual game objects with proper canvas dimensions
	const [leftPaddle, rightPaddle] = createPaddles(canvas, safePlayer1Name, safePlayer2Name);
	const ball = createBall(canvas, difficulty);
	
	// Initialize game state with the actual game objects
	state.player1 = leftPaddle;
	state.player2 = rightPaddle;
	state.ball = ball;
	
	// Initialize other state properties
	initializeGameState(safePlayer1Name, safePlayer2Name, maxGames, mode, gameId, avatar1, avatar2);

	let resizeTimeout: number | null = null;
	const resizeHandler = () => {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(() => {
			const oldWidth = canvas.width;
			const oldHeight = canvas.height;
			setOptimizedCanvasSize(canvas);
			const newWidth = canvas.width;
			const newHeight = canvas.height;
			if (newWidth === 0 || newHeight === 0 || oldWidth === 0 || oldHeight === 0) {
				resizeTimeout = null;
				return;
			}
			const scaleX = newWidth / oldWidth;
			const scaleY = newHeight / oldHeight;
			const paddleMargin = Math.max(5, newWidth * 0.02);

			if (state.player1 && state.player2 && state.ball) {
				state.player1.x = paddleMargin;
				state.player1.width = Math.max(5, newWidth * 0.012);
				state.player1.height = Math.max(30, newHeight * 0.15);
				state.player1.y = Math.max(0, Math.min(state.player1.y * scaleY, newHeight - state.player1.height));
				state.player2.width = state.player1.width;
				state.player2.height = state.player1.height;
				state.player2.x = newWidth - state.player2.width - paddleMargin;
				state.player2.y = Math.max(0, Math.min(state.player2.y * scaleY, newHeight - state.player2.height));
				state.ball.radius = Math.max(4, newWidth * 0.01);
				state.ball.x = Math.max(state.ball.radius + paddleMargin, Math.min(state.ball.x * scaleX, newWidth - state.ball.radius - paddleMargin));
				state.ball.y = Math.max(state.ball.radius, Math.min(state.ball.y * scaleY, newHeight - state.ball.radius));
				state.ball.dx *= scaleX;
				state.ball.dy *= scaleY;
				cleanupControls();
				setupControls(state.player1, state.player2, 400, isAI);
			}
			ctx.clearRect(0, 0, newWidth, newHeight);
			resizeTimeout = null;
		}, 150);
	};
	window.addEventListener('resize', resizeHandler);

	if (state.player1 && state.player2) setupControls(state.player1, state.player2, 400, isAI); // 400 pixels per second for time-based movement
	setupGameEvents(container);

	gameCleanupFunction = () => {
		cleanupControls();
		cleanupGameEvents();
		window.removeEventListener('resize', resizeHandler);
		if (typeof stopGameLoop === 'function') stopGameLoop();
		const bgCanvas = document.getElementById('gris-bg-particles');
		if (bgCanvas) bgCanvas.remove();
		const feedback = document.getElementById('gris-emotional-feedback');
		if (feedback) feedback.remove();
		const confetti = document.getElementById('gris-confetti-canvas');
		if (confetti) confetti.remove();
		console.log('🧹 Game cleanup completed');
	};

	startOptimizedCountdown(canvas, ctx, state.player1!, state.player2!, state.ball!, maxGames, onGameEnd, mode, gameId, isAI, difficulty);
}


function initializeGameState(player1Name: string, player2Name: string, maxGames: number, mode: any,
	gameId?: number, avatar1?: string, avatar2?: string) {
	// Only initialize if paddles don't exist, otherwise just update the metadata
	if (!state.player1) {
		state.player1 = {
			nickname: player1Name,
			avatarUrl: avatar1 || '/default.png',
			x: 0, y: 0, width: 10, height: 80, dy: 0, score: 0,
			upKey: 'w', downKey: 's'
		};
	} else {
		// Update existing paddle metadata without replacing the object
		state.player1.nickname = player1Name;
		state.player1.avatarUrl = avatar1 || '/default.png';
	}
	
	if (!state.player2) {
		state.player2 = {
			nickname: player2Name,
			avatarUrl: avatar2 || '/default.png',
			x: 0, y: 0, width: 10, height: 80, dy: 0, score: 0,
			upKey: 'ArrowUp', downKey: 'ArrowDown'
		};
	} else {
		// Update existing paddle metadata without replacing the object
		state.player2.nickname = player2Name;
		state.player2.avatarUrl = avatar2 || '/default.png';
	}
	state.score1 = 0;
	state.score2 = 0;
	state.round = 1;
	state.maxRounds = maxGames;
	state.mode = mode;
	state.gameId = gameId;
	state.isPaused = false;
	state.isGameOver = false;
	state.showModals = false;
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
                <label for="volume-setting" style="display: block; margin-bottom: 0.5rem; color: ${GRIS_COLORS.primary};">${t.volume}</label>
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
                <label for="effects-setting" style="display: block; margin-bottom: 0.5rem; color: ${GRIS_COLORS.primary};">${t.visualEffects}</label>
                <select id="effects-setting" style="
                    width: 100%;
                    padding: 0.5rem;
                    border: 2px solid ${GRIS_COLORS.secondary};
                    border-radius: 0.5rem;
                    background: white;
                    color: ${GRIS_COLORS.primary};
                ">
                    <option value="minimal">${t.effectsMinimal}</option>
                    <option value="balanced" selected>${t.effectsBalanced}</option>
                    <option value="full">${t.effectsFull}</option>
                </select>
            </div>
            <div>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" id="haptics-setting" checked style="
                        width: 16px;
                        height: 16px;
                        accent-color: ${GRIS_COLORS.acceptance};
                    ">
                    <span style="color: ${GRIS_COLORS.primary};">${t.hapticFeedback}</span>
                </label>
            </div>
        </div>
    `;
}

function initializeOptimizedEffects() {
	console.log('🌟 Initializing background effects...');
	// Celestial animation: robust, performant, single loop
	let animationId: number | null = null;
	let softParticles: CelestialParticle[] = [];
	let sharpParticles: CelestialParticle[] = [];
	const CELESTIAL_COLORS = [
		'#b6a6ca', '#7fc7d9', '#e6c79c', '#f7b267',
		'#fffbe6', '#dab883', '#a3d9b1', '#f4f6fa', '#faaca8',
	];

	class CelestialParticle {
		x: number; y: number; vx: number; vy: number; color: string; radius: number;
		opacity: number; glow: boolean; life: number; maxLife: number;
		shape: 'circle' | 'star' | 'moon';
		constructor(layer: 'soft' | 'sharp', width: number, height: number) {
			this.x = Math.random() * width;
			this.y = Math.random() * height;
			this.vx = (Math.random() - 0.5) * (layer === 'soft' ? 0.15 : 0.4);
			this.vy = (Math.random() - 0.5) * (layer === 'soft' ? 0.15 : 0.4);
			this.color = CELESTIAL_COLORS[Math.floor(Math.random() * CELESTIAL_COLORS.length)];
			this.radius = layer === 'soft' ? Math.random() * 30 + 15 : Math.random() * 10 + 4;
			this.opacity = layer === 'soft' ? Math.random() * 0.12 + 0.08 : Math.random() * 0.2 + 0.1;
			this.glow = layer === 'soft';
			this.life = 0;
			this.maxLife = Math.random() * 3000 + 1200;
			if (layer === 'sharp' && Math.random() < 0.08) {
				this.shape = Math.random() < 0.5 ? 'star' : 'moon';
			} else {
				this.shape = 'circle';
			}
		}
		update(width: number, height: number) {
			this.x += this.vx; this.y += this.vy; this.life++;
			if (this.x < -this.radius) this.x = width + this.radius;
			if (this.x > width + this.radius) this.x = -this.radius;
			if (this.y < -this.radius) this.y = height + this.radius;
			if (this.y > height + this.radius) this.y = -this.radius;
			const ageRatio = this.life / this.maxLife;
			this.opacity = Math.max(0, (this.glow ? 0.12 : 0.2) * (1 - ageRatio));
			return this.life < this.maxLife;
		}
		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.globalAlpha = this.opacity;
			if (this.glow) { ctx.shadowColor = this.color; ctx.shadowBlur = 16; }
			if (this.shape === 'circle') {
				const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
				gradient.addColorStop(0, this.color);
				gradient.addColorStop(0.7, this.color + '66');
				gradient.addColorStop(1, 'transparent');
				ctx.globalCompositeOperation = this.glow ? 'lighter' : 'screen';
				ctx.fillStyle = gradient;
				ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
			} else if (this.shape === 'star') {
				ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = this.color; ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (Math.PI * 2 * i) / 5;
					const x = this.x + Math.cos(angle) * this.radius;
					const y = this.y + Math.sin(angle) * this.radius;
					ctx.lineTo(x, y);
				}
				ctx.closePath(); ctx.fill();
			} else if (this.shape === 'moon') {
				ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = this.color; ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, Math.PI * 0.25, Math.PI * 1.75);
				ctx.arc(this.x + this.radius * 0.4, this.y, this.radius * 0.7, Math.PI * 1.75, Math.PI * 0.25, true);
				ctx.closePath(); ctx.fill();
			}
			ctx.restore();
		}
	}

	function setupParticles(width: number, height: number) {
		// Dynamically set particle count based on device performance
		let maxParticles = PERFORMANCE.maxParticles;
		if (window.devicePixelRatio > 1.5 || width * height > 2_000_000) {
			maxParticles = Math.min(maxParticles, 36);
		}
		softParticles = [];
		sharpParticles = [];
		for (let i = 0; i < Math.floor(maxParticles * 0.6); i++) softParticles.push(new CelestialParticle('soft', width, height));
		for (let i = 0; i < Math.floor(maxParticles * 0.7); i++) sharpParticles.push(new CelestialParticle('sharp', width, height));
	}

	function animateParticles() {
		let atmosphereCanvas = document.getElementById('gris-bg-particles') as HTMLCanvasElement;
		if (!atmosphereCanvas) {
			if (animationId) cancelAnimationFrame(animationId);
			setTimeout(animateParticles, 100);
			return;
		}
		const atmosphereCtx = atmosphereCanvas.getContext('2d');
		if (!atmosphereCtx) {
			if (animationId) cancelAnimationFrame(animationId);
			setTimeout(animateParticles, 100);
			return;
		}
		atmosphereCanvas.width = window.innerWidth;
		atmosphereCanvas.height = window.innerHeight;
		// Re-setup particles if needed
		if (softParticles.length === 0 || sharpParticles.length === 0) {
			setupParticles(atmosphereCanvas.width, atmosphereCanvas.height);
		}
		atmosphereCtx.clearRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);
		const gradient = atmosphereCtx.createRadialGradient(
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, 0,
			atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, Math.max(atmosphereCanvas.width, atmosphereCanvas.height) / 2
		);
		gradient.addColorStop(0, '#fffbe6'); gradient.addColorStop(0.25, '#b6a6ca');
		gradient.addColorStop(0.45, '#7fc7d9'); gradient.addColorStop(0.65, '#e6c79c');
		gradient.addColorStop(0.85, '#faaca8'); gradient.addColorStop(1, '#f4f6fa');
		atmosphereCtx.fillStyle = gradient;
		atmosphereCtx.fillRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);

		atmosphereCtx.globalCompositeOperation = 'destination-over';
		for (let i = softParticles.length - 1; i >= 0; i--) {
			const particle = softParticles[i];
			if (!particle.update(atmosphereCanvas.width, atmosphereCanvas.height)) {
				softParticles.splice(i, 1); softParticles.push(new CelestialParticle('soft', atmosphereCanvas.width, atmosphereCanvas.height));
			} else {
				particle.draw(atmosphereCtx);
			}
		}
		for (let i = sharpParticles.length - 1; i >= 0; i--) {
			const particle = sharpParticles[i];
			if (!particle.update(atmosphereCanvas.width, atmosphereCanvas.height)) {
				sharpParticles.splice(i, 1); sharpParticles.push(new CelestialParticle('sharp', atmosphereCanvas.width, atmosphereCanvas.height));
			} else {
				particle.draw(atmosphereCtx);
			}
		}
		if (Math.random() < 0.02) {
			atmosphereCtx.save(); atmosphereCtx.globalAlpha = 0.08;
			atmosphereCtx.globalCompositeOperation = 'lighter';
			const rayX = Math.random() * atmosphereCanvas.width; const rayY = Math.random() * atmosphereCanvas.height;
			const rayLength = Math.random() * 120 + 80; const rayAngle = Math.random() * Math.PI * 2;
			atmosphereCtx.translate(rayX, rayY); atmosphereCtx.rotate(rayAngle);
			const rayGradient = atmosphereCtx.createLinearGradient(0, 0, rayLength, 0);
			rayGradient.addColorStop(0, '#fffbe6');
			rayGradient.addColorStop(0.5, '#e6c79c');
			rayGradient.addColorStop(1, 'transparent');
			atmosphereCtx.fillStyle = rayGradient; atmosphereCtx.fillRect(0, -4, rayLength, 8);
			atmosphereCtx.restore();
		}
		animationId = requestAnimationFrame(animateParticles);
	}

	// Cancel any previous animation loop before starting
	if (animationId) cancelAnimationFrame(animationId);
	setupParticles(window.innerWidth, window.innerHeight);
	animateParticles();
	console.log('✨ Background effects initialized');
	const resizeBg = () => {
		let atmosphereCanvas = document.getElementById('gris-bg-particles') as HTMLCanvasElement;
		if (atmosphereCanvas) {
			atmosphereCanvas.width = window.innerWidth;
			atmosphereCanvas.height = window.innerHeight;
			setupParticles(window.innerWidth, window.innerHeight);
		}
	};
	window.addEventListener('resize', resizeBg);
	const originalCleanup = gameCleanupFunction;
	gameCleanupFunction = () => {
		if (typeof animationId === 'number') cancelAnimationFrame(animationId);
		window.removeEventListener('resize', resizeBg);
		if (originalCleanup) originalCleanup();
	};
}

function startOptimizedCountdown(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
	leftPaddle: any, rightPaddle: any, ball: any, maxGames: number, onGameEnd: any, mode: any,
	gameId?: number, isAI: boolean = false, difficulty: string = 'normal') {
	console.log('⏰ Starting countdown...');
	let countdown = 3;
	const countdownMessages = [t.ready, t.set, t.go];
	function drawCountdown() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Transparent overlay: do not fill with opaque gradient, just clear
		ctx.save(); ctx.fillStyle = '#ffffff'; ctx.shadowColor = GRIS_COLORS.acceptance; ctx.shadowBlur = 30;
		ctx.font = `bold ${Math.min(canvas.width / 8, 120)}px ${GRIS_TYPOGRAPHY.fonts.display}`;
		ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		const numberY = canvas.height / 2 - 20;
		ctx.fillText(countdown.toString(), canvas.width / 2, numberY);
		ctx.font = `${Math.min(canvas.width / 20, 32)}px ${GRIS_TYPOGRAPHY.fonts.body}`;
		ctx.fillStyle = GRIS_COLORS.acceptance; ctx.shadowBlur = 20;
		const messageY = canvas.height / 2 + 60;
		ctx.fillText(countdownMessages[3 - countdown] || t.ready, canvas.width / 2, messageY);
		ctx.restore();
	}
	function startCountdown() {
		drawCountdown();
		const interval = setInterval(() => {
			countdown--;
			if (countdown > 0) { drawCountdown(); }
			else {
				clearInterval(interval);
				console.log('🚀 Starting game loop...');
				stopGameLoop = startGameLoop(
					canvas, ctx, leftPaddle, rightPaddle, ball as Ball, maxGames,
					(score1: number, score2: number) => {
						state.score1 = score1; state.score2 = score2;
						triggerScoreAnimation();
						if (onGameEnd) onGameEnd(canvas, score1, score2);
					}, mode, gameId, isAI, difficulty
				);
			}
		}, 1000);
	}
	startCountdown();
}

export function cleanupGame() {
	if (gameCleanupFunction) {
		gameCleanupFunction();
		gameCleanupFunction = null;
	}
}
