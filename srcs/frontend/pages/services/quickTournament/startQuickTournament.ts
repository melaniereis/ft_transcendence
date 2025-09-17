import { renderGame } from '../renderGame/renderGame.js';
import { state } from '../renderGame/state.js';
import { updateMatch } from './updateMatch.js';
import { renderLocalTournamentPage } from './quickTournament.js';
import { renderTournamentBracket } from '../tournament/renderTournamentBracket.js';
import { endGame } from '../renderGame/endGame.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '') 
? localStorage.getItem('preferredLanguage') 
: 'en') as keyof typeof translations;
const t = translations[lang];

function shuffleArray<T>(array: T[]): T[] {
const result = [...array];
for (let i = result.length -1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[result[i], result[j]] = [result[j], result[i]];
}
return result;
}

export async function startTournament(container: HTMLElement, tournament: any, selectedPlayers: any[], authToken?: string) {
	const { id } = tournament;
	const token = authToken || localStorage.getItem('authToken') || '';

	const shuffled = shuffleArray(selectedPlayers);
	const [player1, player2, player3, player4] = shuffled;

	const cachedNames = new Map<number, string>();
	async function getUserName(userId: number) {
		if (cachedNames.has(userId)) return cachedNames.get(userId)!;
		const user = selectedPlayers.find(u => u.id === userId);
		if (!user) return `User ${userId}`;
		if (!token) return user.name;

		try {
		const response = await fetch(`/users/${userId}/display_name`, {
			method: 'GET',
			headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
		});
		const data = response.ok ? await response.json() : null;
		const nameToUse = data?.display_name || user.name;
		cachedNames.set(userId, nameToUse);
		return nameToUse;
		} catch {
		return user.name;
		}
	}

	const difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal';
	const maxGames = 3;

	const bracketWrapper = document.createElement('div');
	bracketWrapper.id = 'bracket-wrapper';
	bracketWrapper.style.background = 'rgba(255,251,230,0.85)';
	bracketWrapper.style.borderRadius = '2rem';
	bracketWrapper.style.boxShadow = '0 8px 32px 0 rgba(44,34,84,0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10)';
	bracketWrapper.style.padding = '2rem 0 1.5rem 0';
	bracketWrapper.style.margin = '0 auto 2rem auto';
	bracketWrapper.style.display = 'flex';
	bracketWrapper.style.flexDirection = 'column';
	bracketWrapper.style.alignItems = 'center';
	container.appendChild(bracketWrapper);

	const gameWrapper = document.createElement('div');
	gameWrapper.id = 'game-wrapper';
	gameWrapper.style.background = 'transparent';
	gameWrapper.style.borderRadius = '1.5rem';
	gameWrapper.style.boxShadow = 'none';
	gameWrapper.style.padding = '0';
	gameWrapper.style.margin = '0 auto 2rem auto';
	gameWrapper.style.width = '100%';
	gameWrapper.style.maxWidth = '900px';
	container.appendChild(gameWrapper);

	const canvas = document.createElement('canvas');
	canvas.id = 'tournament-canvas';
	bracketWrapper.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('Failed to get 2d context');
		return;
	}

	const players = [
		{ id: player1.id, name: await getUserName(player1.id) },
		{ id: player2.id, name: await getUserName(player2.id) },
		{ id: player3.id, name: await getUserName(player3.id) },
		{ id: player4.id, name: await getUserName(player4.id) }
	];

	const winners: { semifinal1?: number; semifinal2?: number; final?: number } = {};

	function resizeCanvas(redraw = true) {
		const minWidth = 340, minHeight = 480;
		const parentWidth = Math.max(minWidth, Math.min(window.innerWidth * 0.95, 700));
		const parentHeight = Math.max(minHeight, Math.min(window.innerHeight * 0.7, 520));
		canvas.width = parentWidth;
		canvas.height = parentHeight;
		if (redraw && ctx)
		renderTournamentBracket(canvas, ctx, players, winners);
	}
	resizeCanvas(false);
	window.addEventListener('resize', () => resizeCanvas(true));

	async function showMatchModal(playerA: string, playerB: string) {
		return new Promise<void>((resolve) => {
		const modal = document.createElement('div');
		modal.style.position = 'fixed';
		modal.style.top = '0';
		modal.style.left = '0';
		modal.style.width = '100vw';
		modal.style.height = '100vh';
		modal.style.background = 'rgba(182,166,202,0.45)';
		modal.style.display = 'flex';
		modal.style.alignItems = 'center';
		modal.style.justifyContent = 'center';
		modal.style.zIndex = '9999';
		modal.innerHTML = `
			<div style="background:rgba(255,251,230,0.98);border-radius:2rem;box-shadow:0 8px 32px rgba(44,34,84,0.18);padding:2.5rem 2rem;text-align:center;max-width:340px;">
			${playerA} <span style="color:#b6a6ca;">vs</span> ${playerB}
			</h2>
			<button id="start-match-btn" style="width:100%;background:linear-gradient(135deg, #fffbe6 0%, #f0d6b3 30%, #e6c79c 100%);border:2px solid #6b7a8f;color:#6b7a8f;font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);cursor:pointer;">
				${t.startMatchButton}
			</button>
			</div>`;
		document.body.appendChild(modal);
		modal.querySelector('#start-match-btn')!.addEventListener('click', () => {
			modal.remove();
			resolve();
		});
		});
	}

	// Semifinal 1
	renderTournamentBracket(canvas, ctx, players, winners, async () => {
		await showMatchModal(await getUserName(player1.id), await getUserName(player2.id));
		bracketWrapper.style.display = 'none';
		gameWrapper.innerHTML = '';

		state.player1 = null;
		state.player2 = null;
		state.ball = null;

		renderGame(
		gameWrapper,
		await getUserName(player1.id),
		await getUserName(player2.id),
		maxGames,
		difficulty,
		async (gameCanvas, score1, score2) => {
			await endGame(
			score1,
			score2,
			gameCanvas,
			async (winnerId) => {
				if (!winnerId)
				score1 > score2 ? winnerId = player1.id as number : winnerId = player2.id as number;
				await updateMatch(id, 'semifinal1', winnerId);
				winners.semifinal1 = winnerId;

				bracketWrapper.style.display = 'flex';
				gameWrapper.style.display = 'none';

				// Semifinal 2
				renderTournamentBracket(canvas, ctx, players, winners, async () => {
				await showMatchModal(await getUserName(player3.id), await getUserName(player4.id));
				bracketWrapper.style.display = 'none';
				gameWrapper.innerHTML = '';
				gameWrapper.style.display = 'block';

				// const game2 = await fetchGame(player3.id, player4.id);
				state.player1 = null;
				state.player2 = null;
				state.ball = null;

				renderGame(
					gameWrapper,
					await getUserName(player3.id),
					await getUserName(player4.id),
					maxGames,
					difficulty,
					async (gameCanvas2, score3, score4) => {
					await endGame(
						score3,
						score4,
						gameCanvas2,
						async (winner2Id) => {
						if (!winner2Id)
							score3 > score4 ? winner2Id = player3.id as number : winner2Id = player4.id as number;
						await updateMatch(id, 'semifinal2', winner2Id);
						winners.semifinal2 = winner2Id;

						bracketWrapper.style.display = 'flex';
						gameWrapper.style.display = 'none';

						// Final
						const finalLeftId = winners.semifinal1!;
						const finalRightId = winners.semifinal2!;

						renderTournamentBracket(canvas, ctx, players, winners, async () => {
							await showMatchModal(await getUserName(finalLeftId), await getUserName(finalRightId));
							bracketWrapper.style.display = 'none';
							gameWrapper.innerHTML = '';
							gameWrapper.style.display = 'block';

							state.player1 = null;
							state.player2 = null;
							state.ball = null;

							renderGame(
							gameWrapper,
							await getUserName(finalLeftId),
							await getUserName(finalRightId),
							maxGames,
							difficulty,
							async (finalCanvas, scoreF1, scoreF2) => {
								await endGame(
								scoreF1,
								scoreF2,
								finalCanvas,
								async (finalWinnerId) =>{
									if (!finalWinnerId)
									scoreF1 > scoreF2 ? finalWinnerId = finalLeftId as number : finalWinnerId = finalRightId as number;
									await updateMatch(id, 'final', finalWinnerId);
									winners.final = finalWinnerId;

									bracketWrapper.style.display = 'flex';
									gameWrapper.style.display = 'none';

									renderTournamentBracket(canvas, ctx, players, winners, () => {
									renderLocalTournamentPage(container as HTMLDivElement);
									});
								},
								await getUserName(finalLeftId),
								await getUserName(finalRightId),
								'tournament',
								);
							},
							'tournament',
							);
						});
						},
						await getUserName(player3.id),
						await getUserName(player4.id),
						'tournament',
					);
					},
					'tournament',
				);
				});
			},
			await getUserName(player1.id),
			await getUserName(player2.id),
			'tournament',
			);
		},
		'tournament',
		);
	});
}
