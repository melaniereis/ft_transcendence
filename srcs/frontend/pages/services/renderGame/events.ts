import { state } from './state.js';
import { GRIS_COLORS, GRIS_ANIMATIONS, GRIS_TYPOGRAPHY, GRIS_SHADOWS, PERFORMANCE } from './constants.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '') 
  ? localStorage.getItem('preferredLanguage') 
  : 'en') as keyof typeof translations;

const t = translations[lang];

let eventListeners: Array<{ element: Element | Window, event: string, handler: EventListener }> = [];

export function setupGameEvents(container: HTMLElement) {
	setupPerformanceMonitoring();
	setupOptimizedKeyboardControls();
	setupOptimizedTouchEvents(container);
	setupOptimizedClickEvents(container);
	setupThrottledWindowEvents();
	setupLightweightAccessibility(container);
}

export function cleanupGameEvents() {
	eventListeners.forEach(({ element, event, handler }) => {
		element.removeEventListener(event, handler);
	});
	eventListeners = [];

	const feedback = document.getElementById('gris-emotional-feedback');
	if (feedback) feedback.remove();

	const announcer = document.getElementById('gris-announcer');
	if (announcer) announcer.remove();
}

function addEventListenerWithCleanup(element: Element | Window, event: string, handler: EventListener, options?: any) {
	element.addEventListener(event, handler, options);
	eventListeners.push({ element, event, handler });
}

function setupPerformanceMonitoring() {
	let frameCount = 0;
	let lastTime = performance.now();
	let fps = 60;

	function checkFPS() {
		const now = performance.now();
		frameCount++;

		if (now - lastTime >= 1000) {
			fps = frameCount;
			frameCount = 0;
			lastTime = now;

			if (fps < PERFORMANCE.lowFPSThreshold) {
				document.body.classList.add('performance-mode');
			} else {
				document.body.classList.remove('performance-mode');
			}
		}

		requestAnimationFrame(checkFPS);
	}
	checkFPS();
}

function setupOptimizedKeyboardControls() {
	const keyHandler = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			state.isPaused = !state.isPaused;
			updatePauseUI();
			showOptimizedFeedback(
				state.isPaused ? t['feedback.paused'] : t['feedback.resumed'],
				state.isPaused ? GRIS_COLORS.depression : GRIS_COLORS.acceptance
			);
		}

		if (e.key === 'h' || e.key === 'H') {
			e.preventDefault();
			if (!state.isPaused) {
				state.isPaused = true;
				updatePauseUI();
			}
			toggleHelpOverlay();
		}
	
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault();

			if (state.isPaused) return; // Don't move player if paused
		}
	};
	addEventListenerWithCleanup(window, 'keydown', keyHandler as EventListener);
}

function setupOptimizedTouchEvents(container: HTMLElement) {
	let touchStartTime = 0;

	const touchStartHandler = (e: TouchEvent) => {
		touchStartTime = Date.now();
		const target = e.target as HTMLElement;

		if (target.classList.contains('gris-game-pause-btn')) {
			state.isPaused = !state.isPaused;
			updatePauseUI();
			showOptimizedFeedback(
				state.isPaused ? t['feedback.paused'] : t['feedback.resumed'],
				state.isPaused ? GRIS_COLORS.depression : GRIS_COLORS.acceptance
			);
			if (navigator.vibrate) {
				navigator.vibrate(25);
			}
		}
	};

	addEventListenerWithCleanup(container, 'touchstart', touchStartHandler as EventListener, { passive: true });
}

let clickTimeout: number | null = null;
function setupOptimizedClickEvents(container: HTMLElement) {
	const clickHandler = (e: MouseEvent) => {
		if (clickTimeout) return;

		clickTimeout = window.setTimeout(() => {
			clickTimeout = null;
		}, 150);

		const target = e.target as HTMLElement;

		if (target.classList.contains('gris-game-pause-btn')) {
			state.isPaused = !state.isPaused;
			updatePauseUI();
			showOptimizedFeedback(
				state.isPaused ? t['feedback.paused'] : t['feedback.resumed'],
				state.isPaused ? GRIS_COLORS.depression : GRIS_COLORS.acceptance
			);
		}

		if (target.classList.contains('gris-game-modal-close')) {
			state.showModals = false;
			updateModalsUI();
		}
	};

	addEventListenerWithCleanup(container, 'click', clickHandler as EventListener);
}

let resizeTimeout: number | null = null;
function setupThrottledWindowEvents() {
	const resizeHandler = () => {
		if (resizeTimeout) return;

		resizeTimeout = window.setTimeout(() => {
			updateResponsiveLayout();
			resizeTimeout = null;
		}, 100);
	};

	addEventListenerWithCleanup(window, 'resize', resizeHandler);

	const visibilityHandler = () => {
		if (document.hidden && !state.isPaused && !state.isGameOver) {
			state.isPaused = true;
			updatePauseUI();
			showOptimizedFeedback(t['feedback.pausedTabHidden'], GRIS_COLORS.muted);
		}
	};

	addEventListenerWithCleanup(window, 'visibilitychange', visibilityHandler);
}

function setupLightweightAccessibility(container: HTMLElement) {
	const focusableElements = container.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);

	focusableElements.forEach((element) => {
		const focusHandler = () => {
			(element as HTMLElement).style.outline = `2px solid ${GRIS_COLORS.acceptance}`;
			(element as HTMLElement).style.outlineOffset = '2px';
		};

		const blurHandler = () => {
			(element as HTMLElement).style.outline = 'none';
		};

		addEventListenerWithCleanup(element, 'focus', focusHandler);
		addEventListenerWithCleanup(element, 'blur', blurHandler);
	});

	const announcer = document.createElement('div');
	announcer.id = 'gris-announcer';
	announcer.setAttribute('aria-live', 'polite');
	announcer.setAttribute('aria-atomic', 'true');
	announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
	document.body.appendChild(announcer);
}

function updatePauseUI() {
	const pauseOverlay = document.getElementById('gris-game-pause-overlay');
	if (pauseOverlay) {
		if (state.isPaused) {
			pauseOverlay.style.display = 'flex';
			pauseOverlay.style.opacity = '0';

			requestAnimationFrame(() => {
				pauseOverlay.style.transition = `opacity ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
				pauseOverlay.style.opacity = '1';
			});
		} else {
			pauseOverlay.style.transition = `opacity ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
			pauseOverlay.style.opacity = '0';

			setTimeout(() => {
				pauseOverlay.style.display = 'none';
			}, GRIS_ANIMATIONS.duration.swift);
		}
	}
}

function updateModalsUI() {
	const modals = document.querySelectorAll('.gris-game-modal');
	modals.forEach(modal => {
		const modalEl = modal as HTMLElement;
		if (state.showModals) {
			modalEl.style.display = 'flex';
			modalEl.style.opacity = '0';

			requestAnimationFrame(() => {
				modalEl.style.transition = `opacity ${GRIS_ANIMATIONS.duration.gentle}ms ${GRIS_ANIMATIONS.curves.organic}`;
				modalEl.style.opacity = '1';
			});
		} else {
			modalEl.style.transition = `opacity ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
			modalEl.style.opacity = '0';

			setTimeout(() => {
				modalEl.style.display = 'none';
			}, GRIS_ANIMATIONS.duration.swift);
		}
	});
}

export function showOptimizedFeedback(message: string, color: string) {
	let feedbackEl = document.getElementById('gris-emotional-feedback');

	if (!feedbackEl) {
		feedbackEl = document.createElement('div');
		feedbackEl.id = 'gris-emotional-feedback';
		feedbackEl.setAttribute('role', 'status');
		feedbackEl.setAttribute('aria-live', 'polite');

		feedbackEl.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 1rem 2rem;
            border-radius: 1rem;
            z-index: 4000;
            font-size: ${GRIS_TYPOGRAPHY.scale.base};
            font-weight: ${GRIS_TYPOGRAPHY.weights.medium};
            box-shadow: ${GRIS_SHADOWS.lg};
            max-width: 300px;
            text-align: center;
            pointer-events: none;
        `;

		document.body.appendChild(feedbackEl);
	}

	feedbackEl.textContent = message;
	feedbackEl.style.background = color;
	feedbackEl.style.display = 'block';
	feedbackEl.style.opacity = '0';

	requestAnimationFrame(() => {
		feedbackEl!.style.transition = `opacity ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
		feedbackEl!.style.opacity = '1';
	});

	setTimeout(() => {
		if (feedbackEl) {
			feedbackEl.style.transition = `opacity ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
			feedbackEl.style.opacity = '0';

			setTimeout(() => {
				if (feedbackEl) feedbackEl.style.display = 'none';
			}, GRIS_ANIMATIONS.duration.swift);
		}
	}, 2000);
}

export function triggerScoreAnimation() {
	const scoreDisplays = document.querySelectorAll('.mystical-score');
	scoreDisplays.forEach((display) => {
		const element = display as HTMLElement;
		element.style.transition = `transform ${GRIS_ANIMATIONS.duration.swift}ms ${GRIS_ANIMATIONS.curves.organic}`;
		element.style.transform = 'scale(1.1)';

		setTimeout(() => {
			element.style.transform = 'scale(1)';
		}, GRIS_ANIMATIONS.duration.swift);
	});
}

function updateResponsiveLayout() {
	const canvas = document.getElementById('pong') as HTMLCanvasElement;
	if (canvas) {
		const container = canvas.parentElement;
		if (container) {
			const containerWidth = container.clientWidth - 40;
			const aspectRatio = 5 / 3;
			const maxWidth = 800;

			const width = Math.min(containerWidth, maxWidth);
			const height = width / aspectRatio;

			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';

			canvas.width = width;
			canvas.height = height;
		}
	}
}

function toggleHelpOverlay() {
	let helpOverlay = document.getElementById('gris-help-overlay');

	if (!helpOverlay) {
		helpOverlay = document.createElement('div');
		helpOverlay.id = 'gris-help-overlay';
		helpOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(244, 246, 250, 0.95);
            backdrop-filter: blur(10px);
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;

		helpOverlay.innerHTML = `
            <div style="
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 400px;
                box-shadow: ${GRIS_SHADOWS.lg};
                font-family: ${GRIS_TYPOGRAPHY.fonts.body};
            ">
                <h2 style="
                    color: ${GRIS_COLORS.primary};
                    font-size: ${GRIS_TYPOGRAPHY.scale.xl};
                    margin-bottom: 1rem;
                    text-align: center;
                ">${t['help.title']}</h2>
                <div style="
                    display: grid;
                    gap: 0.5rem;
                    color: ${GRIS_COLORS.secondary};
                    font-size: ${GRIS_TYPOGRAPHY.scale.base};
                ">
                    <div><kbd>${t['help.keys.esc']}</kbd> - ${t['help.keys.pauseResume']}</div>
                    <div><kbd>${t['help.keys.h']}</kbd> - ${t['help.keys.toggleHelp']}</div>
                    <div><kbd>${t['help.keys.ws']}</kbd> - ${t['help.keys.player1Controls']}</div>
                    <div><kbd>${t['help.keys.arrowUpDown']}</kbd> - ${t['help.keys.player2Controls']}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    margin-top: 1rem;
                    width: 100%;
                    padding: 0.75rem;
                    background: ${GRIS_COLORS.acceptance};
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-size: ${GRIS_TYPOGRAPHY.scale.base};
                    cursor: pointer;
                ">${t['help.closeButton']}</button>
            </div>
        `;

		document.body.appendChild(helpOverlay);
	} else {
		helpOverlay.remove();
		if (state.isPaused && !state.isGameOver) {
			state.isPaused = false;
			updatePauseUI();
		}
	}
}

// Add optimized CSS animations
const optimizedStyles = document.createElement('style');
optimizedStyles.textContent = `
    /* Performance mode styles */
    .performance-mode * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }

    .performance-mode .gris-atmosphere {
        display: none !important;
    }

    /* Efficient animations */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .gris-game-universe {
            padding: 1rem !important;
        }

        .game-constellation {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
        }

        .player-sanctuary {
            display: flex !important;
            align-items: center !important;
            gap: 1rem !important;
            padding: 1rem !important;
        }

        .player-avatar {
            width: 50px !important;
            height: 50px !important;
            margin: 0 !important;
        }
    }

    @media (max-width: 480px) {
        .ethereal-header h1 {
            font-size: 1.5rem !important;
        }

        .mystical-score {
            font-size: 1.5rem !important;
        }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast support */
    @media (prefers-contrast: high) {
        .player-sanctuary,
        .game-arena {
            border-width: 2px !important;
            border-color: #000 !important;
        }
    }
`;

document.head.appendChild(optimizedStyles);
