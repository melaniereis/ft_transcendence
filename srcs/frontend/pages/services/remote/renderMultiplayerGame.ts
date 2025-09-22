import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';
import { drawRect, drawCircle, drawNet, setOptimizedCanvasSize } from '../renderGame/gameCanvas.js';
import { GRIS_COLORS, GRIS_SPACING, GRIS_SHADOWS, GRIS_TYPOGRAPHY } from '../renderGame/constants.js'
import { translations } from '../language/translations.js';;

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
	// Detect user navigation or click outside game controls
	function handleUserLeave(reason = t.connectionLost) {
		if (!gameInSession) return;
		gameInSession = false;
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
		hideAllModals();
		// Assign scores: leaver loses, stayer wins
		let winnerScore = maxGames;
		let loserScore = 0;
		let winnerName, loserName;
		if (assignedSide === 'left') {
			gameState.leftScore = loserScore;
			gameState.rightScore = winnerScore;
			winnerName = gameState.rightPlayerName;
			loserName = gameState.leftPlayerName;
		} else {
			gameState.leftScore = winnerScore;
			gameState.rightScore = loserScore;
			winnerName = gameState.leftPlayerName;
			loserName = gameState.rightPlayerName;
		}
		// Show correct message for the leaver (loser)
		showOpponentLeftModal(t.youLostByLeaving);
		// Do not update backend here; only the stayer should update the score
		if (ws && ws.readyState === WebSocket.OPEN) ws.close();
	}

	// Event listeners will be defined per game session


	const { container, playerName, opponentName, maxGames, difficulty, playerAvatarUrl = 'default.png', opponentAvatarUrl = 'default.png' } = options;

	let currentGameId = options.gameId;
	createBeautifulMultiplayerUI(container, playerName, opponentName, maxGames, playerAvatarUrl, opponentAvatarUrl);

	let ws: WebSocket | undefined;
	let protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	let updatedb = 0;
	let assignedSide: 'left' | 'right' | null = null;
	let gameInSession = false;
	let animationId: number | null = null;

	let gameState = {
		ball: { x: 640, y: 340 },
		leftPaddle: { y: 290 },
		rightPaddle: { y: 290 },
		leftScore: 0,
		rightScore: 0,
		leftPlayerName: playerName,
		rightPlayerName: opponentName
	};

	function startGameSession(gameId: string) {
		// Clean up previous ws and listeners
		if (ws && ws.readyState === WebSocket.OPEN) ws.close();
		window.removeEventListener('beforeunload', (window as any)._leaveListener);
		document.removeEventListener('visibilitychange', (document as any)._visibilityListener);
		document.body.removeEventListener('click', (document as any)._clickListener, true);
		document.removeEventListener('keydown', (document as any)._keydownListener);

		ws = new WebSocket(`${protocol}://${location.host}/game/${gameId}`);

		// Define listeners for this game session so they reference the correct state
		const leaveListener = function (e: Event) {
			if (gameInSession) handleUserLeave(t.connectionLost);
		};
		(window as any)._leaveListener = leaveListener;
		window.addEventListener('beforeunload', leaveListener);

		const visibilityListener = function () {
			if (document.visibilityState === 'hidden' && gameInSession) {
				handleUserLeave(t.connectionLost);
			}
		};
		(document as any)._visibilityListener = visibilityListener;
		document.addEventListener('visibilitychange', visibilityListener);

		const clickListener = function (e: Event) {
			const target = e.target as HTMLElement;
			// Prevent triggering on main menu or return buttons
			if (
				target.tagName === 'BUTTON' &&
				gameInSession &&
				!target.closest('#main-menu-btn') &&
				!target.closest('#return-main-btn')
			) {
				handleUserLeave(t.connectionLost);
			}
		};
		(document as any)._clickListener = clickListener;
		document.body.addEventListener('click', clickListener, true);

		const keydownListener = function (e: KeyboardEvent) {
			if (!gameInSession) return;
			if (e.key === 'h' || e.key === 'Escape') {
				handleUserLeave(t.connectionLost);
			}
		};
		(document as any)._keydownListener = keydownListener;
		document.addEventListener('keydown', keydownListener);

		// ...existing ws.onopen and ws.onmessage logic...
	}

	// Start first game session
	startGameSession(currentGameId);

	if (ws) {
		ws.onopen = () => {
			ws!.send(JSON.stringify({
				type: 'join',
				playerName: playerName,
				maxScore: maxGames
			}));
		};
	}

	if (!ws) return;
	ws.onmessage = (ev: MessageEvent) => {
		const data = JSON.parse(ev.data);

		if (data.type === 'assignSide') {
			assignedSide = data.side;
			if (assignedSide !== null)
				updatePlayerDisplay(assignedSide, playerName, opponentName);
		}

		if (data.type === 'startCountdown') {
			gameInSession = true;
			showCountdown(() => startRenderLoop());
		}

		if (data.type === 'update') {
			gameState.ball = data.ball;
			gameState.leftPaddle = { y: data.paddles.leftY };
			gameState.rightPaddle = { y: data.paddles.rightY };
		}

		if (data.type === 'scoreUpdate') {
			if (assignedSide === 'left') {
				gameState.leftScore = data.leftScore;
				gameState.rightScore = data.rightScore;
				gameState.leftPlayerName = playerName;
				gameState.rightPlayerName = opponentName;
				updateScoreDisplay(data.leftScore, data.rightScore);
			} else if (assignedSide === 'right') {
				gameState.leftScore = data.rightScore;
				gameState.rightScore = data.leftScore;
				gameState.leftPlayerName = playerName;
				gameState.rightPlayerName = opponentName;
				updateScoreDisplay(data.rightScore, data.leftScore);
			} else {
				// fallback if side not assigned
				gameState.leftScore = data.leftScore;
				gameState.rightScore = data.rightScore;
				gameState.leftPlayerName = data.leftPlayerName || playerName;
				gameState.rightPlayerName = data.rightPlayerName || opponentName;
				updateScoreDisplay(data.leftScore, data.rightScore);
			}
		}

		if (data.type === 'end') {
			gameInSession = false;
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			showRemoteEndGameModal(data.leftScore, data.rightScore, data.leftPlayerName, data.rightPlayerName);
			// Only the winner sends backend update for normal game end
			const winnerName = data.leftScore > data.rightScore ? data.leftPlayerName : data.rightPlayerName;
			if (playerName === winnerName) {
				(async () => {
					try {
						const res = await fetch(`/games/${currentGameId}/end`, {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
							},
							body: JSON.stringify({
								score_player1: data.leftScore,
								score_player2: data.rightScore,
								winner_id: winnerName,
								loser_id: data.leftScore > data.rightScore ? data.rightPlayerName : data.leftPlayerName,
								reason: 'game-ended'
							})
						});
						if (res.ok) {
							const result = await res.json();
							console.log('Game ended and result updated in DB:', result);
						} else {
							console.error('Failed to update game result in DB');
						}
					} catch (err) {
						console.error('Error while updating game result:', err);
					}
				})();
			}
		}

		if (data.type === 'nextGameInvite')
			showNextGameInviteModal(data.from);

		if (data.type === 'waitingForResponse')
			showWaitingModal(data.message);
		if (data.type === 'nextGameStarted') {
			hideAllModals();
			if (data.gameId) {
				currentGameId = data.gameId;
				startGameSession(currentGameId);
			}
			gameInSession = true;
			gameState.leftScore = 0;
			gameState.rightScore = 0;
			updateScoreDisplay(0, 0);
		}

		if (data.type === 'nextGameDeclined')
			showDeclinedModal(data.message);

		if (data.type === 'opponentLeft') {
			gameInSession = false;
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			hideAllModals();
			// Show correct message for the winner
			showOpponentLeftModal(t.opponentLeftYouWin);

			// Only the stayer (not the leaver) should update the backend
			if (!data.leaverName || playerName !== data.leaverName) {
				let winnerScore = maxGames;
				let loserScore = 0;
				let winnerName = playerName;
				let loserName = opponentName;
				let score_player1, score_player2;
				// Pair scores with correct player IDs
				if (winnerName === gameState.leftPlayerName) {
					score_player1 = winnerScore;
					score_player2 = loserScore;
				} else {
					score_player1 = loserScore;
					score_player2 = winnerScore;
				}
				gameState.leftScore = score_player1;
				gameState.rightScore = score_player2;

				(async () => {
					try {
						const res = await fetch(`/games/${currentGameId}/end`, {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
							},
							body: JSON.stringify({
								score_player1,
								score_player2,
								winner_id: winnerName,
								loser_id: loserName,
								reason: 'left-game'
							})
						});

						if (res.ok) {
							const result = await res.json();
							console.log('Game ended and winner updated in DB:', result);
						}
						else
							console.error('Failed to update game result in DB');
					} catch (err) {
						console.error('Error while updating game result:', err);
					}
				})();
			}
		}
	};

	// Handle opponent disconnect
	function showOpponentLeftModal(message: string) {
		const modal = document.createElement('div');
		modal.id = 'opponent-left-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0; left: 0;
			width: 100vw; height: 100vh;
			background: rgba(182, 166, 202, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
			backdrop-filter: blur(16px);
			animation: fadeInModal 0.4s cubic-bezier(.4,.2,.3,1) both;
		`;

		modal.innerHTML = `
			<div style="
				background: rgba(255,255,255,0.98);
				border-radius: 2rem;
				box-shadow: ${GRIS_SHADOWS.xl};
				padding: 2.5rem 2rem;
				text-align: center;
				min-width: 320px;
				max-width: 96vw;
			">
				<div style="
					font-size: 3rem;
					margin-bottom: 1rem;
					color: ${GRIS_COLORS.anger};
				">⚠️</div>
				<h2 style="
					margin-bottom: 1rem;
					color: ${GRIS_COLORS.anger};
					font-size: ${GRIS_TYPOGRAPHY.scale.xl};
					font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
				">${t.connectionLost}</h2>
				<p style="
					margin-bottom: 2rem;
					color: ${GRIS_COLORS.secondary};
					font-size: ${GRIS_TYPOGRAPHY.scale.base};
					line-height: 1.5;
				">${message}</p>
				<button id="return-main-btn" style="
					padding: 0.85rem 2.2rem;
					font-size: 1.15rem;
					border-radius: 1rem;
					border: none;
					background: linear-gradient(90deg, ${GRIS_COLORS.secondary} 60%, ${GRIS_COLORS.primary} 100%);
					color: #fff;
					font-weight: 600;
					box-shadow: ${GRIS_SHADOWS.base};
					cursor: pointer;
					transition: all 0.2s ease;
				">${t.goBackToMainMenu}</button>
			</div>
		`;

		modal.querySelector('#return-main-btn')!.addEventListener('click', () => {
			if (ws) ws.close();
			window.location.href = '/';
		});

		document.body.appendChild(modal);
	}

	function showRemoteEndGameModal(score1: number, score2: number, player1Name: string, player2Name: string) {
		const modal = document.createElement('div');
		modal.id = 'remote-end-game-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0; left: 0;
			width: 100vw; height: 100vh;
			background: rgba(182, 166, 202, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
			backdrop-filter: blur(16px);
			animation: fadeInModal 0.4s cubic-bezier(.4,.2,.3,1) both;
		`;

		modal.innerHTML = `
			<div style="
				background: rgba(255,255,255,0.98);
				border-radius: 2rem;
				box-shadow: ${GRIS_SHADOWS.xl};
				padding: 2.5rem 2rem;
				text-align: center;
				min-width: 320px;
				max-width: 96vw;
				backdrop-filter: blur(2px);
			">
				<h2 style="
					font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
					margin-bottom: 1.5rem;
					color: ${GRIS_COLORS.primary};
					font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
					letter-spacing: 0.03em;
					text-shadow: 0 2px 8px rgba(44,34,84,0.08);
				">Game Over!</h2>
				<div style="
					margin-bottom: 2.2rem;
					font-size: ${GRIS_TYPOGRAPHY.scale.lg};
					color: ${GRIS_COLORS.secondary};
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
					align-items: center;
				">
					<div style="color: ${score1 > score2 ? GRIS_COLORS.acceptance : GRIS_COLORS.secondary}; font-weight: bold;">
						${player1Name}: ${score1}
					</div>
					<div style="color: ${score2 > score1 ? GRIS_COLORS.acceptance : GRIS_COLORS.secondary}; font-weight: bold;">
						${player2Name}: ${score2}
					</div>
				</div>
				<div style="
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 1.2rem;
					margin-top: 2.2rem;
				">
					<button id="next-game-btn" style="
						padding: 0.85rem 2.2rem;
						font-size: 1.15rem;
						border-radius: 1rem;
						border: none;
						background: linear-gradient(90deg, ${GRIS_COLORS.acceptance} 60%, ${GRIS_COLORS.acceptanceGold} 100%);
						color: #fff;
						font-weight: 600;
						box-shadow: ${GRIS_SHADOWS.base};
						cursor: pointer;
						transition: all 0.2s ease;
					">${t.nextMatch}</button>
					<button id="main-menu-btn" style="
						padding: 0.85rem 2.2rem;
						font-size: 1.15rem;
						border-radius: 1rem;
						border: none;
						background: linear-gradient(90deg, ${GRIS_COLORS.secondary} 60%, ${GRIS_COLORS.primary} 100%);
						color: #fff;
						font-weight: 600;
						box-shadow: ${GRIS_SHADOWS.base};
						cursor: pointer;
						transition: all 0.2s ease;
					">${t.mainMenu}</button>
				</div>
			</div>
		`;

		modal.querySelector('#next-game-btn')!.addEventListener('click', () => {
			if (ws) ws.send(JSON.stringify({ type: 'inviteNext' }));
			modal.remove();
		});

		modal.querySelector('#main-menu-btn')!.addEventListener('click', () => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'playerLeaving' }));
			}
			if (ws) ws.close();
			window.location.href = '/';
		});

		document.body.appendChild(modal);
	}

	function hideAllModals() {
		const modals = [
			'remote-end-game-modal',
			'next-game-invite-modal',
			'waiting-modal',
			'declined-modal',
			'opponent-left-modal'
		];
		modals.forEach(id => {
			const modal = document.getElementById(id);
			if (modal) modal.remove();
		});
	}

	function createBeautifulMultiplayerUI(container: HTMLElement, player1: string, player2: string, maxGames: number, playerAvatarUrl: string, opponentAvatarUrl: string) {
		container.innerHTML = `
			<div class="gris-game-universe" style="
				min-height: 100vh;
				background: transparent;
				padding: ${GRIS_SPACING[3]};
				position: relative;
				overflow: hidden;
			">
				<div class="gris-atmosphere" style="
					position: fixed;
					inset: 0;
					pointer-events: none;
					z-index: 0;
				">
					<canvas id="gris-bg-particles" width="100" height="100" style="
						position: absolute;
						inset: 0;
						opacity: 0.5;
						background: transparent;
					"></canvas>
				</div>

				<div class="ethereal-header" style="
					text-align: center;
					margin-bottom: ${GRIS_SPACING[4]};
					position: relative;
					z-index: 2;
				">
					<div class="game-oracle" style="
						color: ${GRIS_COLORS.secondary};
						font-size: ${GRIS_TYPOGRAPHY.scale.base};
						font-weight: ${GRIS_TYPOGRAPHY.weights.medium};
					">
						${t.remotePongBestOf} ${maxGames}
					</div>
				</div>

                <div class="gris-players-topbar" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    max-width: 900px;
                    margin: 0 auto 18px auto;
                    gap: 18px;
                ">
                    <div id="left-player-section" class="player-sanctuary left-sanctuary" style="
                        background: linear-gradient(120deg, #7fc7d9 0%, #b6a6ca 100%);
                        border-radius: 20px;
                        padding: 16px 18px;
                        min-width: 140px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        box-shadow: ${GRIS_SHADOWS.base};
                        border: 1.5px solid #b6a6ca;
                        transition: all 0.3s ease;
                    ">
						<div class="player-avatar" style="
							width: 44px;
							height: 44px;
							border-radius: 50%;
							background: #fff;
							border: 2.5px solid ${GRIS_COLORS.depression};
							box-shadow: ${GRIS_SHADOWS.sm};
							background-image: url('${playerAvatarUrl}');
							background-size: cover;
							background-position: center;
						"></div>
                        <span style="
                            color: #2c2254;
                            font-size: 1.08rem;
                            font-weight: 700;
                            margin-right: 10px;
                            letter-spacing: 0.02em;
                        ">${player1}</span>
                        <span id="left-score" style="
                            font-size: 1.32rem;
                            font-weight: bold;
                            color: #2c2254;
                            margin-left: auto;
                            text-shadow: ${GRIS_SHADOWS.sm};
                        ">0</span>
                    </div>

					<div style="
						display: flex;
						align-items: center;
						font-size: 1.5rem;
						color: ${GRIS_COLORS.primary};
						font-weight: bold;
					">VS</div>

                    <div id="right-player-section" class="player-sanctuary right-sanctuary" style="
                        background: linear-gradient(120deg, #f7b267 0%, #b6a6ca 100%);
                        border-radius: 20px;
                        padding: 16px 18px;
                        min-width: 140px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        box-shadow: ${GRIS_SHADOWS.base};
                        border: 1.5px solid #f7b267;
                        transition: all 0.3s ease;
                    ">
						<div class="player-avatar" style="
							width: 44px;
							height: 44px;
							border-radius: 50%;
							background: #fff;
							border: 2.5px solid ${GRIS_COLORS.acceptance};
							box-shadow: ${GRIS_SHADOWS.sm};
							background-image: url('${opponentAvatarUrl}');
							background-size: cover;
							background-position: center;
						"></div>
                        <span style="
                            color: #2c2254;
                            font-size: 1.08rem;
                            font-weight: 700;
                            margin-right: 10px;
                            letter-spacing: 0.02em;
                        ">${player2}</span>
                        <span id="right-score" style="
                            font-size: 1.32rem;
                            font-weight: bold;
                            color: #2c2254;
                            margin-left: auto;
                            text-shadow: ${GRIS_SHADOWS.sm};
                        ">0</span>
                    </div>
                </div>

				<div class="gris-game-arena" style="
					width: 100%;
					max-width: 900px;
					margin: 0 auto;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					background: linear-gradient(120deg, #fffbe6 0%, #e9e4f0 100%);
					border-radius: 24px;
					box-shadow: ${GRIS_SHADOWS.lg};
					padding: 28px 18px;
				">
					<div class="canvas-container" style="
						position: relative;
						border-radius: 16px;
						overflow: hidden;
						box-shadow: ${GRIS_SHADOWS.base};
						background: transparent;
						width: 100%;
						aspect-ratio: 5/3;
						max-width: 900px;
						min-width: 400px;
						min-height: 240px;
						display: flex;
						align-items: center;
						justify-content: center;
					">
						<canvas id="pong" width="1280" height="680" style="
							display: block;
							width: 100%;
							height: 100%;
							max-width: 100%;
							max-height: 100%;
						"></canvas>
						<div id="game-status" style="
							position: absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							color: white;
							font-size: 2rem;
							text-align: center;
							font-weight: bold;
							text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
							display: none;
						">${t.waitingForOpponent}</div>
					</div>
				</div>

				<div id="controls-info" style="
					margin-top: 2rem;
					text-align: center;
					color: ${GRIS_COLORS.primary};
					background: rgba(255, 255, 255, 0.8);
					padding: 1rem 2rem;
					border-radius: 1rem;
					box-shadow: ${GRIS_SHADOWS.sm};
					max-width: 600px;
					margin-left: auto;
					margin-right: auto;
				">
					<div id="controls-text" style="
						font-size: ${GRIS_TYPOGRAPHY.scale.base};
						font-weight: ${GRIS_TYPOGRAPHY.weights.medium};
					">${t.connectingToGame}</div>
				</div>
			</div>

			<style>
				.player-sanctuary:hover {
					transform: translateY(-2px);
					box-shadow: ${GRIS_SHADOWS.lg};
				}
				.canvas-container canvas {
					background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				}
			</style>
		`;

		// Initialize background effects
		setTimeout(initializeBackgroundEffects, 100);
	}

	function initializeBackgroundEffects() {
		const bgCanvas = document.getElementById('gris-bg-particles') as HTMLCanvasElement;
		if (!bgCanvas) return;

		bgCanvas.width = window.innerWidth;
		bgCanvas.height = window.innerHeight;
		const ctx = bgCanvas.getContext('2d');
		if (!ctx) return;

		const particles: Array<{ x: number, y: number, vx: number, vy: number, opacity: number }> = [];
		for (let i = 0; i < 30; i++) {
			particles.push({
				x: Math.random() * bgCanvas.width,
				y: Math.random() * bgCanvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				opacity: Math.random() * 0.3 + 0.1
			});
		}

		function animateBackground() {
			if (!ctx) return;
			ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;

				if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
				if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

				ctx.save();
				ctx.globalAlpha = p.opacity;
				ctx.fillStyle = GRIS_COLORS.secondary;
				ctx.beginPath();
				ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			});

			requestAnimationFrame(animateBackground);
		}
		animateBackground();
	}

	function showCountdown(onComplete: () => void) {
		const canvas = document.getElementById('pong') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d')!;
		const statusDiv = document.getElementById('game-status')!;

		let countdown = 3;
		const messages = ['Ready', 'Set', 'Go!'];

		statusDiv.style.display = 'block';

		function drawCountdown() {
			// Clear canvas with background
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, '#1a1a2e');
			gradient.addColorStop(1, '#16213e');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Update status text
			statusDiv.textContent = countdown > 0 ? countdown.toString() : messages[2];
		}

		function tick() {
			drawCountdown();
			countdown--;

			if (countdown >= 0) {
				setTimeout(tick, 1000);
			} else {
				statusDiv.style.display = 'none';
				onComplete();
			}
		}

		tick();
	}

	function updatePlayerDisplay(side: 'left' | 'right', localPlayer: string, remotePlayer: string) {
		const controlsText = document.getElementById('controls-text');
		const leftSection = document.getElementById('left-player-section');
		const rightSection = document.getElementById('right-player-section');

		if (controlsText) {
			controlsText.innerHTML = `
				<strong>${t.yourControls}</strong>: ${t.WUp} / ${t.SDown}<br>
				<small>${t.youAreControlling} <strong>${t.leftPaddle}</strong></small>
				`;
			if (leftSection)
				leftSection.style.border = '3px solid #7fc7d9';
			if (rightSection)
				rightSection.style.border = '1.5px solid #f7b267';
		}
	}

	function updateScoreDisplay(leftScore: number, rightScore: number) {
		const leftScoreEl = document.getElementById('left-score');
		const rightScoreEl = document.getElementById('right-score');

		// Flip scores for right player due to canvas flip
		const displayLeftScore = assignedSide === 'right' ? rightScore : leftScore;
		const displayRightScore = assignedSide === 'right' ? leftScore : rightScore;

		if (leftScoreEl) {
			leftScoreEl.textContent = displayLeftScore.toString();
			leftScoreEl.style.transform = 'scale(1.1)';
			setTimeout(() => {
				leftScoreEl.style.transform = 'scale(1)';
			}, 300);
		}
		if (rightScoreEl) {
			rightScoreEl.textContent = displayRightScore.toString();
			rightScoreEl.style.transform = 'scale(1.1)';
			setTimeout(() => {
				rightScoreEl.style.transform = 'scale(1)';
			}, 300);
		}
	}

	function startRenderLoop() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}

		const canvas = document.getElementById('pong') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d')!;

		setOptimizedCanvasSize(canvas);

		function render() {
			if (!gameInSession) return;

			ctx.save();

			if (assignedSide === 'right') {
				ctx.translate(canvas.width, 0);
				ctx.scale(-1, 1);
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw background gradient
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, 'rgba(26,26,46,0.9)');
			gradient.addColorStop(1, 'rgba(22,33,62,0.9)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			drawNet(ctx, canvas);

			const scaleX = canvas.width / 1280;
			const scaleY = canvas.height / 680;

			drawRect(ctx,
				30 * scaleX,
				gameState.leftPaddle.y * scaleY,
				12 * scaleX,
				100 * scaleY,
				GRIS_COLORS.depression
			);

			drawRect(ctx,
				(1280 - 30 - 12) * scaleX,
				gameState.rightPaddle.y * scaleY,
				12 * scaleX,
				100 * scaleY,
				GRIS_COLORS.acceptance
			);

			drawCircle(ctx,
				gameState.ball.x * scaleX,
				gameState.ball.y * scaleY,
				10 * Math.min(scaleX, scaleY),
				'#ffffff'
			);

			ctx.restore();

			animationId = requestAnimationFrame(render);
		}

		render();
	}

	function showNextGameInviteModal(fromPlayer: string) {
		const modal = document.createElement('div');
		modal.id = 'next-game-invite-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0; left: 0;
			width: 100vw; height: 100vh;
			background: rgba(182, 166, 202, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
			backdrop-filter: blur(16px);
			animation: fadeInModal 0.4s cubic-bezier(.4,.2,.3,1) both;
		`;

		modal.innerHTML = `
			<div style="
				background: rgba(255,255,255,0.98);
				border-radius: 2rem;
				box-shadow: ${GRIS_SHADOWS.xl};
				padding: 2.5rem 2rem;
				text-align: center;
				min-width: 320px;
				max-width: 96vw;
			">
				<h2 style="margin-bottom: 1rem; color: ${GRIS_COLORS.primary}; font-size: ${GRIS_TYPOGRAPHY.scale.xl};">
					${t.nextGameInvitation}
				</h2>
				<p style="margin-bottom: 2rem; color: ${GRIS_COLORS.secondary}; font-size: ${GRIS_TYPOGRAPHY.scale.base};">
					${fromPlayer} ${t.wantsToPlay}
				</p>
				<div style="display: flex; gap: 1rem; justify-content: center;">
					<button id="accept-btn" style="
						padding: 0.75rem 1.5rem;
						background: ${GRIS_COLORS.bargaining};
						color: white;
						border: none;
						border-radius: 0.5rem;
						cursor: pointer;
						font-weight: 600;
						transition: all 0.2s ease;
					">${t.accept}</button>
					<button id="decline-btn" style="
						padding: 0.75rem 1.5rem;
						background: ${GRIS_COLORS.anger};
						color: white;
						border: none;
						border-radius: 0.5rem;
						cursor: pointer;
						font-weight: 600;
						transition: all 0.2s ease;
					">${t.reject}</button>
				</div>
			</div>
		`;

		modal.querySelector('#accept-btn')!.addEventListener('click', () => {
			if (ws) ws.send(JSON.stringify({ type: 'acceptNext' }));
			modal.remove();
		});

		modal.querySelector('#decline-btn')!.addEventListener('click', () => {
			if (ws) ws.send(JSON.stringify({ type: 'declineNext' }));
			modal.remove();
			window.location.href = '/';
		});

		document.body.appendChild(modal);
	}

	function showWaitingModal(message: string) {
		const modal = document.createElement('div');
		modal.id = 'waiting-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0; left: 0;
			width: 100vw; height: 100vh;
			background: rgba(182, 166, 202, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
			backdrop-filter: blur(16px);
		`;

		modal.innerHTML = `
			<div style="
				background: rgba(255,255,255,0.98);
				border-radius: 2rem;
				box-shadow: ${GRIS_SHADOWS.xl};
				padding: 2rem;
				text-align: center;
				min-width: 320px;
			">
				<h2 style="margin-bottom: 1rem; color: ${GRIS_COLORS.primary};">{${t.PleaseWait}}</h2>
				<p style="margin-bottom: 1.5rem; color: ${GRIS_COLORS.secondary};">${message}</p>
				<div style="
					width: 40px;
					height: 40px;
					border: 4px solid ${GRIS_COLORS.surface};
					border-top: 4px solid ${GRIS_COLORS.primary};
					border-radius: 50%;
					animation: spin 1s linear infinite;
					margin: 0 auto;
				"></div>
			</div>
			<style>
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			</style>
		`;

		document.body.appendChild(modal);
	}

	function showDeclinedModal(message: string) {
		const modal = document.createElement('div');
		modal.id = 'declined-modal';
		modal.style.cssText = `
			position: fixed;
			top: 0; left: 0;
			width: 100vw; height: 100vh;
			background: rgba(182, 166, 202, 0.7);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
			backdrop-filter: blur(16px);
		`;

		modal.innerHTML = `
			<div style="
				background: rgba(255,255,255,0.98);
				border-radius: 2rem;
				box-shadow: ${GRIS_SHADOWS.xl};
				padding: 2rem;
				text-align: center;
				min-width: 320px;
			">
				<h2 style="margin-bottom: 1rem; color: ${GRIS_COLORS.anger};">Game Declined</h2>
				<p style="margin-bottom: 2rem; color: ${GRIS_COLORS.secondary};">${message}</p>
				<button id="ok-btn" style="
					padding: 0.75rem 1.5rem;
					background: ${GRIS_COLORS.secondary};
					color: white;
					border: none;
					border-radius: 0.5rem;
					cursor: pointer;
					font-weight: 600;
				">OK</button>
			</div>
		`;

		modal.querySelector('#ok-btn')!.addEventListener('click', () => {
			modal.remove();
			window.location.href = '/';
		});

		document.body.appendChild(modal);
	}
	document.addEventListener('keydown', e => {
		if (!assignedSide || !gameInSession) return;

		if ((assignedSide === 'left' || assignedSide === 'right') && (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
			const direction = (e.key === 'w' || e.key === 'W') ? 'ArrowUp' : 'ArrowDown';
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'start', direction }));
		}
	});

	document.addEventListener('keyup', e => {
		if (!assignedSide || !gameInSession) return;

		if ((assignedSide === 'left' || assignedSide === 'right') && (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
			const direction = (e.key === 'w' || e.key === 'W') ? 'ArrowUp' : 'ArrowDown';
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction }));
		}
	});

	window.addEventListener('blur', () => {
		if (!assignedSide || !gameInSession) return;
		if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
		if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
	});

	document.addEventListener('visibilitychange', () => {
		if (document.hidden && assignedSide && gameInSession) {
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
		}
	});

	// Track if mouse is inside the window
	let mouseInWindow = true;
	let lastMouseLeaveTime = 0;

	document.addEventListener('mouseenter', () => {
		mouseInWindow = true;
	});

	document.addEventListener('mouseleave', () => {
		mouseInWindow = false;
		lastMouseLeaveTime = Date.now();
	});

	// Only stop paddle if window loses focus AND mouse was recently outside
	window.addEventListener('blur', () => {
		if (!assignedSide || !gameInSession) return;

		// Check if mouse left the window recently (within 100ms) before focus loss
		// This indicates a click outside the window
		const timeSinceMouseLeave = Date.now() - lastMouseLeaveTime;
		if (!mouseInWindow && timeSinceMouseLeave < 100) {
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
			if (ws) ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
		}
	});

}
