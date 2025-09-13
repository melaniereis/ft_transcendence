import { renderGame } from '../renderGame/renderGame.js';
import { state } from '../renderGame/state.js';
import { updateMatch } from './updateMatch.js';
import { renderTournamentsPage } from './tournaments.js';
import { renderTournamentBracket } from './renderTournamentBracket.js';
import { endGame } from '../renderGame/endGame.js';

function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export async function startTournament(container: HTMLElement, tournament: any,
	selectedPlayers: any[],
	authToken: string  // <-- Auth token parameter added here
) {
	const { id } = tournament;

	const shuffled = shuffleArray(selectedPlayers);
	const [player1, player2, player3, player4] = shuffled;

	const player1_id = player1.id;
	const player2_id = player2.id;
	const player3_id = player3.id;
	const player4_id = player4.id;

	const getUserName = (userId: number): string => {
		const user = selectedPlayers.find((u: any) => u.id === userId);
		return user?.username || `User ${userId}`;
	};

	const difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal';
	const maxGames = 3;

	// GRIS-inspired bracket and game wrappers
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

	// Responsive tournament canvas
	const canvas = document.createElement('canvas');
	canvas.id = 'tournament-canvas';
	function resizeCanvas(redraw = true) {
		// Minimum size for smallest smartphone (e.g. iPhone SE)
		const minWidth = 340;
		const minHeight = 480;
		const parentWidth = Math.max(minWidth, Math.min(window.innerWidth * 0.95, 700));
		const parentHeight = Math.max(minHeight, Math.min(window.innerHeight * 0.7, 520));
		canvas.width = parentWidth;
		canvas.height = parentHeight;
		if (redraw && typeof renderTournamentBracket === 'function' && ctx) {
			renderTournamentBracket(canvas, ctx, players, winners);
		}
	}
	resizeCanvas(false);
	window.addEventListener('resize', () => resizeCanvas(true));
	canvas.style.display = 'block';
	canvas.style.margin = '0 auto';
	canvas.style.border = 'none';
	canvas.style.background = 'transparent';
	canvas.style.borderRadius = '1.5rem';
	canvas.style.maxWidth = '100%';
	bracketWrapper.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;

	const players = [
		{ id: player1_id, name: getUserName(player1_id) },
		{ id: player2_id, name: getUserName(player2_id) },
		{ id: player3_id, name: getUserName(player3_id) },
		{ id: player4_id, name: getUserName(player4_id) }
	];

	const winners: { semifinal1?: number; semifinal2?: number; final?: number } = {};

	const fetchGame = async (playerA: number, playerB: number) => {
		console.log('authToken:', authToken);  // Add this line to debug
		if (!authToken)
			authToken = localStorage.getItem('authToken') || '';
		const res = await fetch('/games', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${authToken}`
			},
			body: JSON.stringify({
				player1_id: playerA,
				player2_id: playerB,
				max_games: maxGames,
				time_started: new Date().toISOString()
			})
		});
		return res.json();
	};

	// Semifinal 1
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
					<h2 style="font-size:1.6rem;font-weight:700;color:#6b7a8f;margin-bottom:1.2rem;font-family:'Poppins',sans-serif;">
						${playerA} <span style="color:#b6a6ca;">vs</span> ${playerB}
					</h2>
					<button id="start-match-btn" style="width:100%;background:linear-gradient(135deg, #fffbe6 0%, #f0d6b3 30%, #e6c79c 100%);border:2px solid #6b7a8f;color:#6b7a8f;font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">Start Match</button>
				</div>
			`;
			document.body.appendChild(modal);
			modal.querySelector('#start-match-btn')!.addEventListener('click', () => {
				modal.remove();
				resolve();
			});
		});
	}

	// Semifinal 1
	renderTournamentBracket(canvas, ctx, players, winners, async () => {
		await showMatchModal(getUserName(player1_id), getUserName(player2_id));
		// Hide the tournament bracket background before game starts
		bracketWrapper.style.display = 'none';
		gameWrapper.innerHTML = '';
		// Ensure paddles are reset with correct positions before each game
		setTimeout(() => {
			const pongCanvas = gameWrapper.querySelector('canvas');
			if (pongCanvas) {
				pongCanvas.width = 1280;
				pongCanvas.height = 680;
			}
		}, 0);
		const game1 = await fetchGame(player1_id, player2_id);

		// Always create new paddles for each game by clearing state
		state.player1 = null;
		state.player2 = null;
		state.ball = null;
		renderGame(gameWrapper, getUserName(player1_id), getUserName(player2_id), maxGames,
			difficulty, async (gameCanvas, score1, score2) => {
				await endGame(score1, score2, gameCanvas, async (winner1Id) => {
					if (!winner1Id)
						return alert('❌ Could not determine winner for Semifinal 1.');
					await updateMatch(id, 'semifinal1', winner1Id);
					winners.semifinal1 = winner1Id;

					bracketWrapper.style.display = 'flex';

					// Semifinal 2
					// Hide previous game canvas when showing bracket
					gameWrapper.style.display = 'none';
					renderTournamentBracket(canvas, ctx, players, winners, async () => {
						await showMatchModal(getUserName(player3_id), getUserName(player4_id));
						// Hide the tournament bracket background before game starts
						bracketWrapper.style.display = 'none';
						gameWrapper.innerHTML = '';
						gameWrapper.style.display = 'block';
						const game2 = await fetchGame(player3_id, player4_id);

						// Always create new paddles for each game by clearing state
						state.player1 = null;
						state.player2 = null;
						state.ball = null;
						renderGame(gameWrapper, getUserName(player3_id), getUserName(player4_id), maxGames,
							difficulty, async (gameCanvas2, score3, score4) => {
								await endGame(score3, score4, gameCanvas2, async (winner2Id) => {
									if (!winner2Id)
										return alert('❌ Could not determine winner for Semifinal 2.');
									await updateMatch(id, 'semifinal2', winner2Id);
									winners.semifinal2 = winner2Id;

									bracketWrapper.style.display = 'flex';

									// Final
									// Hide previous game canvas when showing bracket
									gameWrapper.style.display = 'none';
									const leftFinalId = winners.semifinal1!;
									const rightFinalId = winners.semifinal2!;
									renderTournamentBracket(canvas, ctx, players, winners, async () => {
										await showMatchModal(getUserName(leftFinalId), getUserName(rightFinalId));
										// Hide the tournament bracket background before game starts
										bracketWrapper.style.display = 'none';
										gameWrapper.innerHTML = '';
										gameWrapper.style.display = 'block';
										const finalGame = await fetchGame(leftFinalId, rightFinalId);

										// Always create new paddles for each game by clearing state
										state.player1 = null;
										state.player2 = null;
										state.ball = null;
										renderGame(gameWrapper, getUserName(leftFinalId), getUserName(rightFinalId), maxGames, difficulty,
											async (finalCanvas, scoreF1, scoreF2) => {
												await endGame(scoreF1, scoreF2, finalCanvas, async (finalWinnerId) => {
													if (!finalWinnerId) {
														alert('❌ Could not determine winner for Final match. Tournament incomplete.');
														return;
													}
													await updateMatch(id, 'final', finalWinnerId);
													winners.final = finalWinnerId;

													bracketWrapper.style.display = 'flex';

													// Hide the game canvas when showing the bracket
													gameWrapper.style.display = 'none';
													renderTournamentBracket(canvas, ctx, players, winners, () => {
														renderTournamentsPage(container as HTMLDivElement);
													});
												},
													getUserName(winners.semifinal1!),
													getUserName(winners.semifinal2!),
													'tournament',
													finalGame.game_id);
											},
											'tournament',
											finalGame.game_id);
									});
								},
									getUserName(player3_id),
									getUserName(player4_id),
									'tournament',
									game2.game_id);
							},
							'tournament',
							game2.game_id);
					});
				},
					getUserName(player1_id),
					getUserName(player2_id),
					'tournament',
					game1.game_id);
			},
			'tournament',
			game1.game_id);
	});
}
