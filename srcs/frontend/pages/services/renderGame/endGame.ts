//renderGame/endGame.ts

import { GRIS_COLORS, GRIS_SHADOWS, GRIS_TYPOGRAPHY } from './constants.js';
import { showOptimizedFeedback } from './events.js';
import { translations } from '../language/translations.js';

let confettiAnimationId: number | null = null;

function launchOptimizedConfetti(winnerName: string) {
	// Lightweight confetti animation
	const confettiCanvas = document.createElement('canvas');
	confettiCanvas.id = 'gris-confetti-canvas';
	confettiCanvas.style.position = 'fixed';
	confettiCanvas.style.top = '0';
	confettiCanvas.style.left = '0';
	confettiCanvas.style.width = '100vw';
	confettiCanvas.style.height = '100vh';
	confettiCanvas.style.pointerEvents = 'none';
	confettiCanvas.style.zIndex = '10000';
	document.body.appendChild(confettiCanvas);

	confettiCanvas.width = window.innerWidth;
	confettiCanvas.height = window.innerHeight;

	const ctx = confettiCanvas.getContext('2d');
	if (!ctx) return;

	const colors = [GRIS_COLORS.acceptance, GRIS_COLORS.depression, GRIS_COLORS.bargaining];

	// Reduced particle count for performance
	const confetti = Array.from({ length: 30 }, () => ({
		x: Math.random() * confettiCanvas.width,
		y: Math.random() * -confettiCanvas.height,
		r: 4 + Math.random() * 6,
		color: colors[Math.floor(Math.random() * colors.length)],
		speed: 2 + Math.random() * 3,
		dx: Math.random() * 2 - 1
	}));

	let running = true;

	function draw() {
		if (!ctx || !running) return;

		ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

		confetti.forEach(c => {
			ctx.beginPath();
			ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
			ctx.fillStyle = c.color;
			ctx.globalAlpha = 0.7;
			ctx.fill();
			ctx.globalAlpha = 1;

			c.y += c.speed;
			c.x += c.dx;

			if (c.y > confettiCanvas.height) c.y = -10;
			if (c.x < 0) c.x = confettiCanvas.width;
			if (c.x > confettiCanvas.width) c.x = 0;
		});

		confettiAnimationId = requestAnimationFrame(draw);
	}

	draw();

	// Confetti só para manualmente
	(window as any).stopConfetti = () => {
		running = false;
		if (confettiAnimationId) {
			cancelAnimationFrame(confettiAnimationId);
		}
		confettiCanvas.remove();
	};
}

export function renderEndGameModal(score1: number, score2: number, player1Name: string,
player2Name: string, mode: 'single' | 'tournament' | 'quick', onRestart: (winnerId?: number) => void,
winnerId?: number) {

	// Só mostra modal se o jogo ainda está ativo
	const gameContainer = document.getElementById('pong');
	if (!gameContainer || !document.body.contains(gameContainer)) {
		return;
	}

	// Remove any previous modal
	const oldModal = document.getElementById('gris-endgame-modal');
	if (oldModal) oldModal.remove();

	// Clean up any existing confetti
	const oldConfetti = document.getElementById('gris-confetti-canvas');
	if (oldConfetti) oldConfetti.remove();

	// Get translations
	const lang = (localStorage.getItem('preferredLanguage') || 'en') as keyof typeof translations;
	const t = translations[lang];

	// Determine winner
	let winner: string | null = null;
	if (score1 > score2) winner = player1Name;
	else if (score2 > score1) winner = player2Name;

	// Create optimized modal overlay
	const modal = document.createElement('div');
	modal.id = 'gris-endgame-modal';
	modal.className = 'gris-game-modal';
	modal.style.cssText = `
		   position: fixed;
		   top: 0;
		   left: 0;
		   width: 100vw;
		   height: 100vh;
		   background: rgba(182, 166, 202, 0.7);
		   display: flex;
		   align-items: center;
		   justify-content: center;
		   z-index: 9999;
		   backdrop-filter: blur(16px) brightness(0.98);
		   animation: fadeInModal 0.4s cubic-bezier(.4,2,.3,1) both;
	   `;
	// Add fade-in animation
	const style = document.createElement('style');
	style.textContent = `@keyframes fadeInModal { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`;
	document.head.appendChild(style);

	// Modal content
	const content = document.createElement('div');
	content.style.cssText = `
		   background: rgba(255,255,255,0.98);
		   border-radius: 2rem;
		   box-shadow: 0 8px 32px 0 rgba(44, 34, 84, 0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10);
		   padding: 2.5rem 2rem;
		   text-align: center;
		   min-width: 320px;
		   max-width: 96vw;
		   backdrop-filter: blur(2px);
	   `;

	// Title
	const title = document.createElement('h2');
	title.textContent = t.gameOver;
	title.style.cssText = `
		   font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
		   margin-bottom: 1.5rem;
		   color: ${GRIS_COLORS.primary};
		   font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
		   letter-spacing: 0.03em;
		   text-shadow: 0 2px 8px rgba(44,34,84,0.08);
	   `;
	content.appendChild(title);

	// Scores
	const scoreBox = document.createElement('div');
	scoreBox.style.cssText = `
		   margin-bottom: 2.2rem;
		   font-size: ${GRIS_TYPOGRAPHY.scale.lg};
		   color: ${GRIS_COLORS.secondary};
		   display: flex;
		   flex-direction: column;
		   gap: 0.5rem;
		   align-items: center;
	   `;
	scoreBox.innerHTML = `
        <div style="${winner === player1Name ? `color: ${GRIS_COLORS.acceptance}; font-weight: bold;` : ''}">${player1Name}: ${score1}</div>
        <div style="${winner === player2Name ? `color: ${GRIS_COLORS.acceptance}; font-weight: bold;` : ''}">${player2Name}: ${score2}</div>
    `;
	content.appendChild(scoreBox);

	// Winner confetti
	if (winner) launchOptimizedConfetti(winner);

	// Remove confetti when modal is closed or next match starts
	function removeConfetti() {
		if ((window as any).stopConfetti) {
			(window as any).stopConfetti();
		}
	}

	// Remove confetti when any modal button is clicked
	setTimeout(() => {
		const modalButtons = modal.querySelectorAll('button');
		modalButtons.forEach(btn => {
			btn.addEventListener('click', removeConfetti);
		});
	}, 0);

	// Buttons
	const buttonRow = document.createElement('div');
	buttonRow.style.cssText = `
		   display: flex;
		   flex-wrap: wrap;
		   justify-content: center;
		   gap: 1.2rem;
		   margin-top: 2.2rem;
	   `;

	const restartBtn = document.createElement('button');
	restartBtn.textContent = mode === 'tournament' ? t.nextMatch : t.restart;
	restartBtn.className = 'gris-game-modal-close';
	restartBtn.style.cssText = `
		   padding: 0.85rem 2.2rem;
		   font-size: 1.15rem;
		   border-radius: 1rem;
		   border: none;
		   background: linear-gradient(90deg, ${GRIS_COLORS.acceptance} 60%, ${GRIS_COLORS.acceptanceGold} 100%);
		   color: #fff;
		   font-weight: 600;
		   box-shadow: 0 2px 8px rgba(44,34,84,0.10);
		   cursor: pointer;
		   transition: background 0.2s, box-shadow 0.2s;
	   `;

	restartBtn.onmouseover = () => {
		restartBtn.style.background = `linear-gradient(90deg, ${GRIS_COLORS.acceptanceGold} 60%, ${GRIS_COLORS.acceptance} 100%)`;
		restartBtn.style.boxShadow = '0 4px 16px rgba(44,34,84,0.18)';
	};
	restartBtn.onmouseout = () => {
		restartBtn.style.background = `linear-gradient(90deg, ${GRIS_COLORS.acceptance} 60%, ${GRIS_COLORS.acceptanceGold} 100%)`;
		restartBtn.style.boxShadow = '0 2px 8px rgba(44,34,84,0.10)';
	};

	buttonRow.appendChild(restartBtn);

	if (mode !== 'tournament') {
		const menuBtn = document.createElement('button');
		menuBtn.textContent = t.mainMenu;
		menuBtn.className = 'gris-game-modal-close';
		menuBtn.style.cssText = `
			   padding: 0.85rem 2.2rem;
			   font-size: 1.15rem;
			   border-radius: 1rem;
			   border: none;
			   background: linear-gradient(90deg, ${GRIS_COLORS.secondary} 60%, ${GRIS_COLORS.primary} 100%);
			   color: #fff;
			   font-weight: 600;
			   box-shadow: 0 2px 8px rgba(44,34,84,0.10);
			   cursor: pointer;
			   transition: background 0.2s, box-shadow 0.2s;
		   `;

		menuBtn.onmouseover = () => {
			menuBtn.style.background = `linear-gradient(90deg, ${GRIS_COLORS.primary} 60%, ${GRIS_COLORS.secondary} 100%)`;
			menuBtn.style.boxShadow = '0 4px 16px rgba(44,34,84,0.18)';
		};
		menuBtn.onmouseout = () => {
			menuBtn.style.background = `linear-gradient(90deg, ${GRIS_COLORS.secondary} 60%, ${GRIS_COLORS.primary} 100%)`;
			menuBtn.style.boxShadow = '0 2px 8px rgba(44,34,84,0.10)';
		};

		buttonRow.appendChild(menuBtn);

		menuBtn.onclick = () => {
			modal.remove();
			document.body.style.overflow = '';
			if ((window as any).stopConfetti) (window as any).stopConfetti();
			window.location.href = '/';
		};
	}

	restartBtn.onclick = () => {
		modal.remove();
		document.body.style.overflow = '';
		if ((window as any).stopConfetti) (window as any).stopConfetti();
		onRestart(winnerId);
	};

	content.appendChild(buttonRow);
	modal.appendChild(content);
	document.body.appendChild(modal);

	// Prevent scrolling
	document.body.style.overflow = 'hidden';

	// Entrance animation
	modal.style.opacity = '0';
	requestAnimationFrame(() => {
		modal.style.transition = 'opacity 0.3s ease';
		modal.style.opacity = '1';
	});

	// Show feedback
	showOptimizedFeedback(t.gameOver, GRIS_COLORS.primary);
}

export async function endGame(score1: number,score2: number,canvas: HTMLCanvasElement,onRestart: (winnerId?: number) => void,
player1Name: string, player2Name: string, mode: 'single' | 'tournament' | 'quick' = 'single', gameId?: number) {
	let winnerId: number | undefined;

	if (gameId) {
		try {
			const res = await fetch(`/games/${gameId}/end`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
				},
				body: JSON.stringify({ score_player1: score1, score_player2: score2 })
			});

			if (res.ok) {
				const data = await res.json();
				winnerId = data.winner_id;
				console.log('✅ Game ended. Winner:', winnerId);
			}
		} catch (err) {
			console.error('Failed to end game:', err);
		}
	}

	renderEndGameModal(score1, score2, player1Name, player2Name, mode, onRestart, winnerId);
}
