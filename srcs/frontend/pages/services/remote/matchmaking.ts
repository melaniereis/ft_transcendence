// matchmaking.ts
import { renderMultiplayerGame } from './renderMultiplayerGame.js';
import { renderMatchReadyScreen } from './renderMatchReadyScreen.js';
import { translations } from '../language/translations.js';

let socket: WebSocket | null = null;
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function startMatchmaking(appDiv: HTMLDivElement, playerId: number,
	playerName: string, difficulty: 'easy' | 'normal' | 'hard' | 'crazy'): void {
	const token = localStorage.getItem('authToken');
	if (!token) {
		appDiv.innerHTML = `<p style="position:relative;z-index:1;">${t.loginRequired}</p><div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>`;
		return;
	}

	function openNewSocket() {
		const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		const wsUrl = `${protocol}://${location.host}/matchmaking?token=${encodeURIComponent(token ?? '')}`;

		console.log('🌐 Connecting WebSocket to:', wsUrl);

		socket = new WebSocket(wsUrl);

		socket.onopen = () => handleSocketOpen(playerId, playerName, difficulty);
		socket.onmessage = (event) => handleSocketMessage(event, appDiv, playerName, difficulty);
		socket.onclose = () => handleSocketClose(appDiv);
		socket.onerror = (err) => handleSocketError(err, appDiv);
	}

	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('🟠 Existing socket — closing and reconnecting to prevent stale state...');
		socket.onclose = () => {
			socket = null;
			openNewSocket();
		};
		socket.close();
	} else {
		openNewSocket();
	}
}


function handleSocketOpen(playerId: number, playerName: string, difficulty: string) {
	console.log('✅ Connected to matchmaking server. Waiting for opponent...');
	const token = localStorage.getItem('authToken');
	const payload = {
		type: 'join',
		id: playerId,
		username: playerName,
		difficulty,
		token
	};
	console.log('Sending join payload:', payload);
	socket!.send(JSON.stringify(payload));
}

function handleSocketMessage(event: MessageEvent, appDiv: HTMLDivElement, playerName: string, difficulty: string) {
	console.log('[Matchmaking] handleSocketMessage called. Raw event:', event);
	console.log('[Matchmaking] handleSocketMessage called with data:', event.data);
	const data = JSON.parse(event.data);
	console.log('Received WS message:', data);

	switch (data.type) {
		case 'chooseMaxGames':
			renderGameSelectionUI(appDiv);
			break;

		case 'waitingForGameSelection':
		case 'waitingForOpponent':
			renderWaitingMessage(appDiv, `${t.matchmaking}: ${t.waitingForOpponent}`);
			break;

		case 'ready':
			renderMatchReadyScreen(appDiv, playerName, data.opponent, data.maxGames, () => {
				console.log('Confirm ready clicked');
				socket!.send(JSON.stringify({ type: 'confirmReady' }));
			});
			break;

		case 'start': {
			appDiv.innerHTML = '';
			let opponentAvatarUrl = '/default.png';
			const token = localStorage.getItem('authToken');
			const currentUsername = playerName;
			const startGameWithAvatars = (playerAvatar: string, opponentAvatar: string) => {
				console.log('[Matchmaking] playerAvatarUrl:', playerAvatar);
				console.log('[Matchmaking] opponentAvatarUrl:', opponentAvatar);
				renderMultiplayerGame({
					container: appDiv,
					playerName,
					opponentName: data.opponent,
					gameId: data.game_id,
					maxGames: data.maxGames,
					difficulty: difficulty as 'easy' | 'normal' | 'hard' | 'crazy',
					playerAvatarUrl: playerAvatar,
					opponentAvatarUrl: opponentAvatar
				});
			};
			// Fetch both avatars in parallel
			Promise.all([
				fetch(`/api/users/${currentUsername}`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(res => {
						console.log('[Matchmaking] Player avatar fetch response status:', res.status);
						if (!res.ok) {
							console.error('[Matchmaking] Failed to fetch player avatar, using default.');
							return { avatar_url: '/default.png' };
						}
						return res.json();
					})
					.catch((err) => {
						console.error('[Matchmaking] Error fetching player avatar:', err);
						return { avatar_url: '/default.png' };
					}),
				fetch(`/api/users/${data.opponent}`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(res => {
						console.log('[Matchmaking] Opponent avatar fetch response status:', res.status);
						if (!res.ok) {
							console.error('[Matchmaking] Failed to fetch opponent avatar, using default.');
							return { avatar_url: '/default.png' };
						}
						return res.json();
					})
					.catch((err) => {
						console.error('[Matchmaking] Error fetching opponent avatar:', err);
						return { avatar_url: '/default.png' };
					})
			]).then(([playerUser, opponentUser]) => {
				console.log('[Matchmaking] Player user object:', playerUser);
				console.log('[Matchmaking] Opponent user object:', opponentUser);
				startGameWithAvatars(playerUser.avatar_url || '/default.png', opponentUser.avatar_url || '/default.png');
			});
			break;
		}

		case 'error':
			console.error('⚠️ Server error:', data.message);
			appDiv.innerHTML = `<p>${t.errorLoading}: ${data.message}</p>`;
			break;

		default:
			showGoBackToMainMenu(appDiv);
			break;
	}
}

function renderGameSelectionUI(appDiv: HTMLDivElement) {
	appDiv.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.5rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${t.maxGamesLabel} (3–11)</h2>
					<select id="gameCountSelect" style="width:100%;padding:1rem;margin-bottom:2rem;border-radius:1rem;border:1.5px solid #6c4fa3;font-size:1.3rem;color:#2d1b4e;background:rgba(255,255,255,0.85);">
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="7">7</option>
						<option value="9">9</option>
						<option value="11">11</option>
					</select>
					<button id="confirmMaxGames" style="width:100%;padding:1rem 0;font-size:1.5rem;font-weight:700;color:#2c2254;background:linear-gradient(90deg,#e8d5ff 0%,#6c4fa3 100%);border:none;border-radius:1.5rem;box-shadow:0 2px 16px rgba(44,34,84,0.18),0 1px 4px rgba(44,34,84,0.12);transition:background 0.3s,box-shadow 0.3s,color 0.3s,transform 0.2s;cursor:pointer;margin-top:1rem;">
						${t.confirm}
					</button>
				</div>
			</div>
		</div>
	`;
	document.getElementById('confirmMaxGames')?.addEventListener('click', () => {
		const select = document.getElementById('gameCountSelect') as HTMLSelectElement;
		const selected = parseInt(select.value);
		socket!.send(JSON.stringify({ type: 'selectMaxGames', maxGames: selected }));
	});
}

function renderWaitingMessage(appDiv: HTMLDivElement, message: string) {
	appDiv.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.5rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${message}</h2>
					<div class="loader mx-auto"></div>
				</div>
			</div>
		</div>
	`;
}

function showGoBackToMainMenu(appDiv: HTMLDivElement) {
	appDiv.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.5rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${t.unknownError}</h2>
					<p style="font-size:1.5rem;color:#6c4fa3;margin-bottom:2rem;">${t.goBackToMainMenu}</p>
					<button onclick="window.location.href='/'" style="width:100%;padding:1rem 0;font-size:1.5rem;font-weight:700;color:#2c2254;background:linear-gradient(90deg,#e8d5ff 0%,#6c4fa3 100%);border:none;border-radius:1.5rem;box-shadow:0 2px 16px rgba(44,34,84,0.18),0 1px 4px rgba(44,34,84,0.12);transition:background 0.3s,box-shadow 0.3s,color 0.3s,transform 0.2s;cursor:pointer;">
						${t.goBack}
					</button>
				</div>
			</div>
		</div>
	`;
}

function handleSocketClose(appDiv: HTMLDivElement) {
	appDiv.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.2rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${t.matchmaking}: Disconnected.</h2>
				</div>
			</div>
		</div>
	`;
	socket = null;
}

function handleSocketError(err: Event, appDiv: HTMLDivElement) {
	appDiv.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.2rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${t.connectionError}</h2>
				</div>
			</div>
		</div>
	`;
	socket?.close();
	socket = null;
}
