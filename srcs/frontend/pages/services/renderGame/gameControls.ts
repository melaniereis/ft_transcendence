//renderGame/gameControls.ts

import { Paddle } from './types.js';
import { state } from './state.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];


const controlState = {
	keys: {} as Record<string, boolean>,
	touchActive: false,
	eventListeners: [] as Array<{ element: Element | Window | Document, event: string, handler: EventListener, options?: AddEventListenerOptions | boolean }>
};

export function setupControls(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number, isAI: boolean = false) {
	const keysPressed: Record<string, boolean> = {};

	const keyDownHandler = (e: KeyboardEvent) => {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault();  // Prevent page scrolling when arrow keys pressed
		}
		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		controlState.keys[key] = true;
		updatePaddleMovement(leftPaddle, rightPaddle, paddleSpeed);
	};

	const keyUpHandler = (e: KeyboardEvent) => {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault();
		}
		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		controlState.keys[key] = false;
		updatePaddleMovement(leftPaddle, rightPaddle, paddleSpeed, isAI);
	};

	const addListener = (element: Element | Window, event: string, handler: EventListener, options?: AddEventListenerOptions | boolean) => {
		element.addEventListener(event, handler, options);
		controlState.eventListeners.push({ element, event, handler, options });
	};

	// Add listeners with passive: false to enable preventDefault
	addListener(window, 'keydown', keyDownHandler as EventListener, { passive: false });
	addListener(window, 'keyup', keyUpHandler as EventListener, { passive: false });

	// Global fallback to prevent arrow key scrolling everywhere
	const globalArrowKeyPreventer: EventListener = function (e) {
		const evt = e as KeyboardEvent;
		if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evt.key)) {
			evt.preventDefault();
		}
	};
	window.addEventListener('keydown', globalArrowKeyPreventer, { passive: false });
	document.addEventListener('keydown', globalArrowKeyPreventer, { passive: false });
	controlState.eventListeners.push({ element: window, event: 'keydown', handler: globalArrowKeyPreventer, options: { passive: false } });
	controlState.eventListeners.push({ element: document, event: 'keydown', handler: globalArrowKeyPreventer, options: { passive: false } });

	// Hide page scrollbars during active game controls
	document.body.style.overflow = 'hidden';
	document.documentElement.style.overflow = 'hidden';

	// Focus the game canvas if present
	setTimeout(() => {
		const canvas = document.getElementById('pong');
		if (canvas) {
			(canvas as HTMLCanvasElement).focus();
		}
	}, 100);

	setupTouchControls(leftPaddle, rightPaddle, paddleSpeed);
}

function updatePaddleMovement(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number, isAI?: boolean) {
	if (controlState.keys[leftPaddle.upKey.toLowerCase()]) {
		leftPaddle.dy = -paddleSpeed;
	} else if (controlState.keys[leftPaddle.downKey.toLowerCase()]) {
		leftPaddle.dy = paddleSpeed;
	} else {
		leftPaddle.dy = 0;
	}

	if (controlState.keys[rightPaddle.upKey]) {
		rightPaddle.dy = -paddleSpeed;
	} else if (controlState.keys[rightPaddle.downKey]) {
		rightPaddle.dy = paddleSpeed;
	} else {
		rightPaddle.dy = 0;
	}

	if (!isAI) {
		rightPaddle.dy = controlState.keys[rightPaddle.upKey] ? -paddleSpeed : controlState.keys[rightPaddle.downKey]
			? paddleSpeed : 0;
	}

	if (!isAI) {
		rightPaddle.dy = controlState.keys[rightPaddle.upKey] ? -paddleSpeed : controlState.keys[rightPaddle.downKey]
			? paddleSpeed : 0;
	}
}

function setupTouchControls(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number) {
	const touchOverlay = document.createElement('div');
	touchOverlay.id = 'gris-touch-controls';
	touchOverlay.style.cssText = `
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 20px;
		z-index: 1000;
		opacity: 0;
		transition: opacity 0.3s ease;
	`;

	if ('ontouchstart' in window) {
		touchOverlay.style.opacity = '1';
	}

	const leftControls = createTouchControl('Player 1', (direction) => {
		if (direction === 'up') {
			leftPaddle.dy = -paddleSpeed;
		} else if (direction === 'down') {
			leftPaddle.dy = paddleSpeed;
		} else {
			leftPaddle.dy = 0;
		}
	});

	const rightControls = createTouchControl('Player 2', (direction) => {
		if (direction === 'up') {
			rightPaddle.dy = -paddleSpeed;
		} else if (direction === 'down') {
			rightPaddle.dy = paddleSpeed;
		} else {
			rightPaddle.dy = 0;
		}
	});

	touchOverlay.appendChild(leftControls);
	touchOverlay.appendChild(rightControls);
	document.body.appendChild(touchOverlay);
}

function createTouchControl(label: string, onControl: (direction: 'up' | 'down' | 'stop') => void) {
	const container = document.createElement('div');
	container.style.cssText = `
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	`;

	const labelEl = document.createElement('div');
	labelEl.textContent = label;
	labelEl.style.cssText = `
		font-size: 14px;
		color: #6b7a8f;
		font-weight: 500;
	`;

	const controls = document.createElement('div');
	controls.style.cssText = `
		display: flex;
		flex-direction: column;
		gap: 5px;
	`;

	const upBtn = document.createElement('button');
	upBtn.textContent = '↑';
	upBtn.style.cssText = `
		width: 50px;
		height: 40px;
		border: none;
		border-radius: 8px;
		background: #7fc7d9;
		color: white;
		font-size: 20px;
		font-weight: bold;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
	`;

	const downBtn = document.createElement('button');
	downBtn.textContent = '↓';
	downBtn.style.cssText = upBtn.style.cssText;

	const startUp = () => onControl('up');
	const startDown = () => onControl('down');
	const stop = () => onControl('stop');

	upBtn.addEventListener('touchstart', startUp, { passive: true });
	upBtn.addEventListener('touchend', stop, { passive: true });
	upBtn.addEventListener('mousedown', startUp);
	upBtn.addEventListener('mouseup', stop);

	downBtn.addEventListener('touchstart', startDown, { passive: true });
	downBtn.addEventListener('touchend', stop, { passive: true });
	downBtn.addEventListener('mousedown', startDown);
	downBtn.addEventListener('mouseup', stop);

	controls.appendChild(upBtn);
	controls.appendChild(downBtn);
	container.appendChild(labelEl);
	container.appendChild(controls);

	return container;
}

export function cleanupControls() {
	controlState.eventListeners.forEach(({ element, event, handler, options }) => {
		element.removeEventListener(event, handler, options);
	});
	controlState.eventListeners = [];

	document.body.style.overflow = '';
	document.documentElement.style.overflow = '';

	controlState.keys = {};

	const touchControls = document.getElementById('gris-touch-controls');
	if (touchControls) {
		touchControls.remove();
	}
}

export function updateScoreDisplay(score1: number, score2: number) {
	// Update round number in top bar
	const roundEl = document.querySelector('.game-oracle');
	if (roundEl && typeof state.round === 'number' && state.mode) {
		roundEl.textContent = `${t.round} ${state.round} • ${state.mode.charAt(0).toUpperCase() + state.mode.slice(1)}`;
	}

	// Update player section scores (top bar)
	const leftPlayerScore = document.querySelector('.player-sanctuary.left-sanctuary span:last-child');
	const rightPlayerScore = document.querySelector('.player-sanctuary.right-sanctuary span:last-child');
	if (leftPlayerScore) leftPlayerScore.textContent = score1.toString();
	if (rightPlayerScore) rightPlayerScore.textContent = score2.toString();

	// Canvas scores (legacy, if used)
	const leftScoreEl = document.querySelector('.mystical-score.left-score');
	const rightScoreEl = document.querySelector('.mystical-score.right-score');

	if (leftScoreEl) {
		leftScoreEl.textContent = score1.toString();
		leftScoreEl.classList.add('score-update');
		setTimeout(() => leftScoreEl.classList.remove('score-update'), 300);
	}
	if (rightScoreEl) {
		rightScoreEl.textContent = score2.toString();
		rightScoreEl.classList.add('score-update');
		setTimeout(() => rightScoreEl.classList.remove('score-update'), 300);
	}

}
