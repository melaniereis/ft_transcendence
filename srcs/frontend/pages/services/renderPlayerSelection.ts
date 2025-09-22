import { renderGame } from './renderGame/renderGame.js';
import { translations } from './language/translations.js';

const getUserName = async (userId: number, selectedPlayers: any[], token: string | null): Promise<string> => {
	const user = selectedPlayers.find(u => u.id === userId);
	if (!user)
		return `User ${userId}`;

	if (!token)
		return user.name;

	try {
		const response = await fetch(`/users/${userId}/display_name`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const data = await response.json();
			return data.display_name || user.name;
		}
		else {
			return user.name;
		}
	}
	catch (err) {
		console.error('Error fetching display name:', err);
		return user.name;
	}
};

export async function renderPlayerSelection(container: HTMLElement) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">${t.loginRequired}</p>`;
		return;
	}

	// Limpar conteúdo anterior
	container.innerHTML = `
		<div class="cloud-bg" style="position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;z-index:0;background:url('/Background3.jpg') center center / cover no-repeat fixed;">
			<div class="magic-gradient"></div>
			<canvas id="magic-sparkles" style="position:absolute;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;"></canvas>
			<div class="cloud cloud1"></div>
			<div class="cloud cloud2"></div>
			<div class="cloud cloud3"></div>
			<div class="cloud cloud4"></div>
			<div class="cloud cloud5"></div>
			<div class="cloud cloud6"></div>
		</div>
		<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
			<h2 style="font-size:3.2rem;font-weight:700;color:#fff;margin-bottom:2.8rem;letter-spacing:0.04em;text-shadow:0 6px 32px rgba(44,34,84,0.22);">${t.selectOpponentTitle}</h2>
			<div class="selection-panel">
				<label>
					${t.opponentLabel}
					<select id="player1-select"></select>
				</label>
				<label>
					${t.maxGamesLabel}
					<select id="max-games-select">
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="7">7</option>
						<option value="9">9</option>
						<option value="11">11</option>
					</select>
				</label>
				<label>
					${t.difficultyLabel}
					<select id="difficulty-select">
						<option value="easy">Easy</option>
						<option value="normal" selected>Normal</option>
						<option value="hard">Hard</option>
						<option value="crazy">Crazy</option>
					</select>
				</label>
				<button id="start-game-btn">${t.startGame}</button>
				<div id="selection-error"></div>
				<div id="verification-form"></div>
			</div>
		</div>
	`;

	// Inject cloud shapes, overlays, and force top bar above all
	const cloudStyles = document.createElement('style');
	cloudStyles.textContent = `
		.cloud-bg { position: absolute !important; z-index: 0 !important; }
		.magic-gradient { position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 60% 30%,rgba(236,233,244,0.13) 0%,rgba(182,166,202,0.09) 40%,rgba(44,34,84,0.04) 100%);mix-blend-mode:screen;animation:magicGradientMove 12s ease-in-out infinite alternate; }
		@keyframes magicGradientMove { 0%{background-position:60% 30%;} 100%{background-position:40% 70%;} }
		.cloud { position: absolute; border-radius: 50%; filter: blur(18px); opacity: 0.85; z-index: 10; pointer-events: none; animation: floatCloud 22s ease-in-out infinite alternate; }
		.cloud1 { width: 260px; height: 100px; left: 7vw; top: 9vh; animation-delay: 0s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
		.cloud2 { width: 360px; height: 140px; right: 9vw; top: 21vh; animation-delay: 2s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		.cloud3 { width: 220px; height: 80px; left: 54vw; bottom: 13vh; animation-delay: 4s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
		.cloud4 { width: 180px; height: 60px; right: 18vw; bottom: 7vh; animation-delay: 6s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
		.cloud5 { width: 120px; height: 40px; left: 22vw; top: 33vh; animation-delay: 8s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		.cloud6 { width: 90px; height: 30px; right: 28vw; bottom: 23vh; animation-delay: 10s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
		@keyframes floatCloud {
			0% { transform: translateY(0) scale(1); }
			20% { transform: translateY(-18px) scale(1.04); }
			50% { transform: translateY(0) scale(1); }
			80% { transform: translateY(12px) scale(0.98); }
			100% { transform: translateY(0) scale(1); }
		}
		.selection-panel {
			background: rgba(236,233,244,0.22);
			border-radius: 2.8rem;
			box-shadow: 0 0 32px 8px #d6d8e8, 0 16px 64px 0 rgba(44,34,84,0.08), 0 2px 16px 0 rgba(44,34,84,0.04);
			padding: 2.2rem 1.6rem;
			max-width: 480px;
			width: 100%;
			backdrop-filter: blur(22px);
			z-index: 2;
			transition: box-shadow 0.3s, background 0.3s;
		}
		.selection-panel label {
			display: block;
			color: #6b7280;
			font-weight: 500;
			font-size: 1.18rem;
			margin-bottom: 1.1rem;
			letter-spacing: 0.01em;
			transition: color 0.2s;
		}
		.selection-panel label:hover {
			color: #818cf8;
		}
		.selection-panel select {
			width: 100%;
			padding: 1.1rem;
			border: 1.5px solid #d6d8e8;
			border-radius: 1.1rem;
			background: rgba(236,233,244,0.18);
			color: #6b7280;
			font-weight: 500;
			font-size: 1.08rem;
			box-shadow: 0 2px 10px rgba(44,34,84,0.08);
			margin-top: 0.3rem;
			transition: border-color 0.2s, background 0.2s;
		}
		.selection-panel select:hover, .selection-panel select:focus {
			border-color: #818cf8;
			background: rgba(236,233,244,0.28);
		}
		.selection-panel button {
			width: 100%;
			background: linear-gradient(90deg,#d6d8e8 0%,#f8fafc 100%);
			border: 1.5px solid #6b7280;
			color: #6b7280;
			font-weight: 600;
			padding: 1.1rem;
			border-radius: 1.1rem;
			font-size: 1.08rem;
			box-shadow: 0 6px 24px rgba(44,34,84,0.08);
			transition: background 0.2s, color 0.2s, box-shadow 0.2s;
			cursor: pointer;
			margin-top: 1.1rem;
		}
		.selection-panel button:hover {
			background: linear-gradient(90deg,#818cf8 0%,#f8fafc 100%);
			color: #fff;
			box-shadow: 0 10px 32px rgba(44,34,84,0.14);
		}
		#selection-error {
			color: #e11d48;
			font-weight: 500;
			font-size: 1.08rem;
			margin-top: 1.1rem;
		}
		.cloud-bg h2 {
			font-size: 2.2rem;
			font-weight: 600;
			color: #e3e7f1;
			margin-bottom: 2.1rem;
			letter-spacing: 0.03em;
			text-shadow: 0 4px 18px rgba(44,34,84,0.12);
			z-index: 2;
		}
		.selection-panel:hover {
			background: rgba(255,255,255,0.78);
			box-shadow: 0 0 48px 16px #a5b4fc, 0 24px 80px 0 rgba(44,34,84,0.28), 0 2px 24px 0 rgba(44,34,84,0.18);
		}
		.selection-panel label {
			display: block;
			color: #2c2254;
			font-weight: 700;
			font-size: 1.4rem;
			margin-bottom: 1.4rem;
			transition: color 0.2s;
		}
		.selection-panel label:hover {
			color: #4338ca;
		}
		.selection-panel select {
			width: 100%;
			padding: 1.4rem;
			border: 2px solid #a5b4fc;
			border-radius: 1.4rem;
			background: rgba(255,255,255,0.92);
			color: #2c2254;
			font-weight: 700;
			font-size: 1.18rem;
			box-shadow: 0 2px 14px rgba(44,34,84,0.12);
			margin-top: 0.5rem;
			transition: border-color 0.2s, background 0.2s;
		}
		.selection-panel select:hover, .selection-panel select:focus {
			border-color: #4338ca;
			background: rgba(255,255,255,0.98);
		}
		.selection-panel button {
			width: 100%;
			background: linear-gradient(90deg,#a5b4fc 0%,#f8fafc 100%);
			border: 2px solid #2c2254;
			color: #2c2254;
			font-weight: 700;
			padding: 1.4rem;
			border-radius: 1.4rem;
			font-size: 1.28rem;
			box-shadow: 0 8px 32px rgba(44,34,84,0.14);
			transition: background 0.2s, color 0.2s, box-shadow 0.2s;
			cursor: pointer;
			margin-top: 1.4rem;
		}
		.selection-panel button:hover {
			background: linear-gradient(90deg,#818cf8 0%,#f8fafc 100%);
			color: #fff;
			box-shadow: 0 12px 40px rgba(44,34,84,0.22);
		}
		#selection-error {
			color: #e11d48;
			font-weight: 700;
			font-size: 1.18rem;
			margin-top: 1.4rem;
		}
		#top-bar, .top-bar {
			position: fixed !important;
			top: 0; left: 0; right: 0;
			z-index: 100 !important;
		}
	`;
	document.head.appendChild(cloudStyles);

	// Sparkle and star animation (canvas)
	setTimeout(() => {
		const canvas = document.getElementById('magic-sparkles') as HTMLCanvasElement;
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.willChange = 'transform';
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Sparkles (reduced for performance)
		const sparkles = Array.from({ length: 18 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 1.5 + Math.random() * 2.5,
			dx: (Math.random() - 0.5) * 0.4,
			dy: (Math.random() - 0.5) * 0.4,
			alpha: 0.7 + Math.random() * 0.3,
			color: `rgba(${200 + Math.floor(Math.random() * 55)},${180 + Math.floor(Math.random() * 55)},255,`
		}));

		// Stars (reduced for performance)
		const stars = Array.from({ length: 24 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 0.7 + Math.random() * 1.6,
			baseAlpha: 0.5 + Math.random() * 0.5,
			twinkleSpeed: 0.008 + Math.random() * 0.012,
			twinklePhase: Math.random() * Math.PI * 2,
			color: `rgba(255,255,255,`
		}));

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw stars
			const now = performance.now();
			stars.forEach(star => {
				if (!ctx) return;
				const twinkle = star.baseAlpha + 0.4 * Math.sin(now * star.twinkleSpeed + star.twinklePhase);
				ctx.save();
				ctx.globalAlpha = Math.max(0.2, Math.min(1, twinkle));
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
				ctx.fillStyle = star.color + "1)";
				ctx.shadowColor = "rgba(255,255,255,0.8)";
				ctx.shadowBlur = 8;
				ctx.fill();
				ctx.restore();
			});

			// Draw sparkles
			sparkles.forEach(s => {
				if (!ctx) return;
				ctx.save();
				ctx.globalAlpha = s.alpha;
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
				ctx.fillStyle = s.color + "0.8)";
				ctx.shadowColor = s.color + "1)";
				ctx.shadowBlur = 12;
				ctx.fill();
				ctx.restore();
				s.x += s.dx;
				s.y += s.dy;
				if (s.x < 0) s.x = canvas.width;
				if (s.x > canvas.width) s.x = 0;
				if (s.y < 0) s.y = canvas.height;
				if (s.y > canvas.height) s.y = 0;
			});

			requestAnimationFrame(draw);
		}
		draw();
	}, 100);

	const player1Select = document.getElementById('player1-select') as HTMLSelectElement;
	const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
	const errorDiv = document.getElementById('selection-error') as HTMLDivElement;
	const verificationDiv = document.getElementById('verification-form') as HTMLDivElement;

	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	const loggedInPlayerName = localStorage.getItem('playerName') || 'You';

	if (!loggedInPlayerId) {
		errorDiv.textContent = t.mustBeLoggedIn;
		return;
	}

	let users: any[] = [];
	try {
		const token = localStorage.getItem('authToken');
		const response = await fetch('/users', {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!response.ok) throw new Error('Unauthorized or failed request');
		users = await response.json();
		console.log('Fetched users:', users);

		users.forEach((user: any) => {
			if (user.id === loggedInPlayerId) return;
			const option = document.createElement('option');
			option.value = user.id;
			option.textContent = user.username;
			player1Select.appendChild(option);
		});
	} catch {
		errorDiv.textContent = t.failedToLoadUsers;
		return;
	}

	startGameBtn.addEventListener('click', () => {
		const opponentId = Number(player1Select.value);
		const opponentName = player1Select.selectedOptions[0]?.textContent;
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy' | 'normal' | 'hard' | 'crazy';

		if (!opponentId || opponentId === loggedInPlayerId) {
			errorDiv.textContent = t.invalidOpponent;
			return;
		}

		const opponent = users.find(u => u.id === opponentId);
		verificationDiv.innerHTML = `
			<h3 class="text-2xl font-bold text-black mb-4">${t.verifyOpponent}: ${opponent.name} (${opponent.username})</h3>
			<form id="verify-form" class="space-y-4">
				<input type="password" name="password" placeholder="${t.verifyPassword}" class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" required />
				<button type="submit" class="w-full py-4 text-2xl font-bold text-black bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition">${t.verifyStart}</button>
				<div class="result text-red-600 text-xl"></div>
			</form>
		`;

		const verifyForm = document.getElementById('verify-form') as HTMLFormElement;
		const resultDiv = verifyForm.querySelector('.result') as HTMLDivElement;

		verifyForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(verifyForm);
			const password = formData.get('password') as string;

			try {
				const res = await fetch('/api/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: opponentName, password })
				});
				const result = await res.json();

				if (res.ok && result.user.id === opponentId) {
					resultDiv.style.color = 'green';
					resultDiv.textContent = t.verifySuccess;

					const token = localStorage.getItem('authToken');
					const gameRes = await fetch('/games', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							player1_id: loggedInPlayerId,
							player2_id: opponentId,
							max_games: maxGames,
							time_started: new Date().toISOString()
						})
					});

					if (!gameRes.ok) {
						const errorData = await gameRes.json();
						throw new Error(errorData.error || 'Failed to create game');
					}

					const data = await gameRes.json();
					const gameId = data.game_id;
					const player1DisplayName = await getUserName(loggedInPlayerId, users, token);
					const player2DisplayName = await getUserName(opponentId, users, token);
					const player1Avatar = (users.find(u => u.id === loggedInPlayerId)?.avatar_url) || '/default.png';
					const player2Avatar = (users.find(u => u.id === opponentId)?.avatar_url) || '/default.png';
					container.innerHTML = '';
					renderGame(container, player1DisplayName, player2DisplayName, maxGames, difficulty, undefined, 'single', gameId, player1Avatar, player2Avatar);
				}
				else {
					resultDiv.textContent = t.verifyInvalid;
				}
			}
			catch {
				resultDiv.textContent = t.verifyFailed;
			}
		});
	});
}
