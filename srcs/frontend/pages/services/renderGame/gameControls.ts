//renderGame/gameControls.ts

import { Paddle } from './types.js';

const controlState = {
	keys: {} as Record<string, boolean>,
	touchActive: false,
	eventListeners: [] as Array<{ element: Element | Window, event: string, handler: EventListener }>
};

export function setupControls(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number) {
	// Clean up any existing controls
	cleanupControls();

	const keyDownHandler = (e: KeyboardEvent) => {
		controlState.keys[e.key] = true;
		updatePaddleMovement(leftPaddle, rightPaddle, paddleSpeed);

		// Prevent default for paddle control keys
		if ([leftPaddle.upKey, leftPaddle.downKey, rightPaddle.upKey, rightPaddle.downKey].includes(e.key)) {
			e.preventDefault();
		}
	};

	const keyUpHandler = (e: KeyboardEvent) => {
		controlState.keys[e.key] = false;
		updatePaddleMovement(leftPaddle, rightPaddle, paddleSpeed);
	};

	// Add event listeners with cleanup tracking
	addEventListenerWithCleanup(window, 'keydown', keyDownHandler as EventListener);
	addEventListenerWithCleanup(window, 'keyup', keyUpHandler as EventListener);

	// Mobile touch controls
	setupTouchControls(leftPaddle, rightPaddle, paddleSpeed);
}

function addEventListenerWithCleanup(element: Element | Window, event: string, handler: EventListener) {
	element.addEventListener(event, handler);
	controlState.eventListeners.push({ element, event, handler });
}

function updatePaddleMovement(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number) {
	// Left paddle movement
	if (controlState.keys[leftPaddle.upKey]) {
		leftPaddle.dy = -paddleSpeed;
	} else if (controlState.keys[leftPaddle.downKey]) {
		leftPaddle.dy = paddleSpeed;
	} else {
		leftPaddle.dy = 0;
	}

	// Right paddle movement
	if (controlState.keys[rightPaddle.upKey]) {
		rightPaddle.dy = -paddleSpeed;
	} else if (controlState.keys[rightPaddle.downKey]) {
		rightPaddle.dy = paddleSpeed;
	} else {
		rightPaddle.dy = 0;
	}
}

function setupTouchControls(leftPaddle: Paddle, rightPaddle: Paddle, paddleSpeed: number) {
	// Create touch control overlay for mobile
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

	// Show on mobile devices
	if ('ontouchstart' in window) {
		touchOverlay.style.opacity = '1';
	}

	// Player 1 controls
	const leftControls = createTouchControl('Player 1', (direction) => {
		if (direction === 'up') {
			leftPaddle.dy = -paddleSpeed;
		} else if (direction === 'down') {
			leftPaddle.dy = paddleSpeed;
		} else {
			leftPaddle.dy = 0;
		}
	});

	// Player 2 controls
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

	// Touch event handlers
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
	// Remove all event listeners
	controlState.eventListeners.forEach(({ element, event, handler }) => {
		element.removeEventListener(event, handler);
	});
	controlState.eventListeners = [];

	// Clear key state
	controlState.keys = {};

	// Remove touch controls
	const touchControls = document.getElementById('gris-touch-controls');
	if (touchControls) {
		touchControls.remove();
	}
}

// Utility to update score display in DOM
export function updateScoreDisplay(score1: number, score2: number) {
	const leftScoreEl = document.querySelector('.mystical-score.left-score');
	const rightScoreEl = document.querySelector('.mystical-score.right-score');

	if (leftScoreEl) {
		leftScoreEl.textContent = score1.toString();
		// Add score update animation
		leftScoreEl.classList.add('score-update');
		setTimeout(() => leftScoreEl.classList.remove('score-update'), 300);
	}

	if (rightScoreEl) {
		rightScoreEl.textContent = score2.toString();
		// Add score update animation
		rightScoreEl.classList.add('score-update');
		setTimeout(() => rightScoreEl.classList.remove('score-update'), 300);
	}
}
