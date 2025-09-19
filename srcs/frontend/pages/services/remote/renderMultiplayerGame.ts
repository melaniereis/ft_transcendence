import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';
import { drawRect, drawCircle, drawNet, setOptimizedCanvasSize } from '../renderGame/gameCanvas.js';
import { GRIS_COLORS, GRIS_SPACING, GRIS_SHADOWS, GRIS_TYPOGRAPHY } from '../renderGame/constants.js';

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
	const { container, playerName, opponentName, gameId, maxGames, difficulty, playerAvatarUrl = 'default.png', opponentAvatarUrl = 'default.png' } = options;
	console.log('[RenderMultiplayerGame] playerAvatarUrl:', playerAvatarUrl);
	console.log('[RenderMultiplayerGame] opponentAvatarUrl:', opponentAvatarUrl);

	// Create beautiful UI like renderGame
	createBeautifulMultiplayerUI(container, playerName, opponentName, maxGames, playerAvatarUrl, opponentAvatarUrl);

	// Setup WebSocket for remote state
	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	const ws = new WebSocket(`${protocol}://${location.host}/game/${gameId}`);

	let assignedSide: 'left' | 'right' | null = null;
	let gameInSession = false;
	let animationId: number | null = null;

	// Game state - receive-only from server
	let gameState = {
		ball: { x: 640, y: 340 },
		leftPaddle: { y: 290 },
		rightPaddle: { y: 290 },
		leftScore: 0,
		rightScore: 0,
		leftPlayerName: playerName,
		rightPlayerName: opponentName
	};

	ws.onopen = () => {
		ws.send(JSON.stringify({
			type: 'join',
			playerName: playerName,
			maxScore: maxGames
		}));
	};

	ws.onmessage = ev => {
		const data = JSON.parse(ev.data);

		if (data.type === 'assignSide') {
			assignedSide = data.side;
			console.log(`Assigned to ${assignedSide} side`);
			if (assignedSide !== null) {
				updatePlayerDisplay(assignedSide, playerName, opponentName);
			}
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
			gameState.leftScore = data.leftScore;
			gameState.rightScore = data.rightScore;
			gameState.leftPlayerName = data.leftPlayerName || playerName;
			gameState.rightPlayerName = data.rightPlayerName || opponentName;
			updateScoreDisplay(gameState.leftScore, gameState.rightScore);
		}

		if (data.type === 'end') {
			gameInSession = false;
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			showRemoteEndGameModal(data.leftScore, data.rightScore, data.leftPlayerName, data.rightPlayerName);
		}

		if (data.type === 'nextGameInvite') {
			showNextGameInviteModal(data.from);
		}

		if (data.type === 'waitingForResponse') {
			showWaitingModal(data.message);
		}

		if (data.type === 'nextGameStarted') {
			hideAllModals();
			gameInSession = true;
			gameState.leftScore = 0;
			gameState.rightScore = 0;
			updateScoreDisplay(0, 0);
			showCountdown(() => startRenderLoop());
		}

		if (data.type === 'nextGameDeclined') {
			showDeclinedModal(data.message);
		}

		if (data.type === 'opponentLeft') {
			gameInSession = false;
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			hideAllModals();
			showOpponentLeftModal(data.message);
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
				">Connection Lost</h2>
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
				">Return to Main Menu</button>
			</div>
		`;

		modal.querySelector('#return-main-btn')!.addEventListener('click', () => {
			ws.close();
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
					">Next Game</button>
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
					">Main Menu</button>
				</div>
			</div>
		`;

		modal.querySelector('#next-game-btn')!.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'inviteNext' }));
			modal.remove();
		});

		modal.querySelector('#main-menu-btn')!.addEventListener('click', () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'playerLeaving' }));
			}
			ws.close();
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
		console.log('[createBeautifulMultiplayerUI] playerAvatarUrl:', playerAvatarUrl);
		console.log('[createBeautifulMultiplayerUI] opponentAvatarUrl:', opponentAvatarUrl);
		container.innerHTML = `
            <div class="gris-game-universe" style="
                min-height: 100vh;
                background: transparent;
                padding: ${GRIS_SPACING[3]};
                position: relative;
                overflow: hidden;
            ">
                <!-- Optimized Background Atmosphere -->
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

                <!-- Game Header -->
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
                        Remote Pong - Best of ${maxGames}
                    </div>
                </div>

                <!-- Players Top Bar (Beautiful like renderGame) -->
                <div class="gris-players-topbar" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    max-width: 900px;
                    margin: 0 auto 18px auto;
                    gap: 18px;
                ">
                    <!-- Left Player -->
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

                    <!-- VS Indicator -->
                    <div style="
                        display: flex;
                        align-items: center;
                        font-size: 1.5rem;
                        color: ${GRIS_COLORS.primary};
                        font-weight: bold;
                    ">VS</div>

                    <!-- Right Player -->
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

                <!-- Game Arena (Beautiful like renderGame) -->
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
                        ">Waiting for opponent...</div>
                    </div>
                </div>

                <!-- Controls Info (Beautiful styling) -->
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
                    ">Connecting to game...</div>
                </div>
            </div>

            <!-- Add CSS for hover effects -->
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
			if (side === 'left') {
				controlsText.innerHTML = `
                    <strong>Your Controls:</strong> W (Up) / S (Down)<br>
                    <small>You are controlling the <strong>LEFT</strong> paddle</small>
                `;
				if (leftSection) leftSection.style.border = '3px solid #7fc7d9';
				if (rightSection) rightSection.style.border = '1.5px solid #f7b267';
			} else {
				controlsText.innerHTML = `
                    <strong>Your Controls:</strong> ↑ (Up) / ↓ (Down)<br>
                    <small>You are controlling the <strong>RIGHT</strong> paddle</small>
                `;
				if (rightSection) rightSection.style.border = '3px solid #f7b267';
				if (leftSection) leftSection.style.border = '1.5px solid #b6a6ca';
			}
		}
	}

	function updateScoreDisplay(leftScore: number, rightScore: number) {
		const leftScoreEl = document.getElementById('left-score');
		const rightScoreEl = document.getElementById('right-score');

		if (leftScoreEl) {
			leftScoreEl.textContent = leftScore.toString();
			leftScoreEl.style.transform = 'scale(1.1)';
			setTimeout(() => {
				leftScoreEl.style.transform = 'scale(1)';
			}, 300);
		}
		if (rightScoreEl) {
			rightScoreEl.textContent = rightScore.toString();
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

			// Clear canvas with beautiful background
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw background gradient
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, 'rgba(26,26,46,0.9)');
			gradient.addColorStop(1, 'rgba(22,33,62,0.9)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw net
			drawNet(ctx, canvas);

			// Draw paddles (scale to canvas size)
			const scaleX = canvas.width / 1280;
			const scaleY = canvas.height / 680;

			// Left paddle
			drawRect(ctx,
				30 * scaleX,
				gameState.leftPaddle.y * scaleY,
				12 * scaleX,
				100 * scaleY,
				GRIS_COLORS.depression
			);

			// Right paddle
			drawRect(ctx,
				(1280 - 30 - 12) * scaleX,
				gameState.rightPaddle.y * scaleY,
				12 * scaleX,
				100 * scaleY,
				GRIS_COLORS.acceptance
			);

			// Draw ball
			drawCircle(ctx,
				gameState.ball.x * scaleX,
				gameState.ball.y * scaleY,
				10 * Math.min(scaleX, scaleY),
				'#ffffff'
			);

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
                    Next Game Invitation
                </h2>
                <p style="margin-bottom: 2rem; color: ${GRIS_COLORS.secondary}; font-size: ${GRIS_TYPOGRAPHY.scale.base};">
                    ${fromPlayer} wants to play another game!
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
                    ">Accept</button>
                    <button id="decline-btn" style="
                        padding: 0.75rem 1.5rem;
                        background: ${GRIS_COLORS.anger};
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    ">Decline</button>
                </div>
            </div>
        `;

		modal.querySelector('#accept-btn')!.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'acceptNext' }));
			modal.remove();
		});

		modal.querySelector('#decline-btn')!.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'declineNext' }));
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
                <h2 style="margin-bottom: 1rem; color: ${GRIS_COLORS.primary};">Please Wait</h2>
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

		if (assignedSide === 'left' && (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
			const direction = (e.key === 'w' || e.key === 'W') ? 'ArrowUp' : 'ArrowDown';
			ws.send(JSON.stringify({ type: 'move', action: 'start', direction }));
		}
		else if (assignedSide === 'right' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			ws.send(JSON.stringify({ type: 'move', action: 'start', direction: e.key }));
		}
	});

	document.addEventListener('keyup', e => {
		if (!assignedSide || !gameInSession) return;

		if (assignedSide === 'left' && (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
			const direction = (e.key === 'w' || e.key === 'W') ? 'ArrowUp' : 'ArrowDown';
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction }));
		}
		else if (assignedSide === 'right' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: e.key }));
		}
	});
}
