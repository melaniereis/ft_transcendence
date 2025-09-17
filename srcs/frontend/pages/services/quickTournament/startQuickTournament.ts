import { renderGame } from '../renderGame/renderGame.js';
import { state } from '../renderGame/state.js';
import { renderTournamentBracket } from '../tournament/renderTournamentBracket.js';
import { endGame } from '../renderGame/endGame.js';
import { translations } from '../language/translations.js';
import {renderLocalTournamentPage} from './quickTournament.js'

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

// Fake game id generator for local usage
let fakeGameIdCounter = 1;
function generateFakeGameId() {
	return fakeGameIdCounter++;
}

export async function startTournament(container: HTMLElement, tournament: any, selectedPlayers: any[]) {
	const { id } = tournament;

	const shuffled = shuffleArray(selectedPlayers);
	const [player1, player2, player3, player4] = shuffled;

	const player1_id = player1.id;
	const player2_id = player2.id;
	const player3_id = player3.id;
	const player4_id = player4.id;

	// Since no backend, getUserName just returns the name from selectedPlayers directly
	const getUserName = (userId: number): string => {
		const user = selectedPlayers.find((u: any) => u.id === userId);
		return user ? user.name : `User ${userId}`;
	};

	const difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal';
	const maxGames = 3;

	// Setup UI containers
	if (!document.getElementById('start-tournament-bg')) {
		const bg = document.createElement('div');
		bg.id = 'start-tournament-bg';
		bg.style.position = 'fixed';
		bg.style.inset = '0';
		bg.style.width = '100vw';
		bg.style.height = '100vh';
		bg.style.zIndex = '0';
		bg.style.pointerEvents = 'none';
		bg.style.background = "url('Background3.jpg') center center / cover no-repeat fixed";
		document.body.appendChild(bg);
	}
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
	function resizeCanvas(redraw = true) {
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
	if (!ctx) return;

	const players = [
		{ id: player1_id, name: getUserName(player1_id) },
		{ id: player2_id, name: getUserName(player2_id) },
		{ id: player3_id, name: getUserName(player3_id) },
		{ id: player4_id, name: getUserName(player4_id) }
	];

	const winners: { semifinal1?: number; semifinal2?: number; final?: number } = {};

	// Since no backend, just simulate game creation locally
	const createFakeGame = (playerA: number, playerB: number) => {
		return {
			game_id: generateFakeGameId(),
			player1_id: playerA,
			player2_id: playerB,
			max_games: maxGames,
			time_started: new Date().toISOString()
		};
	};

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
					<button id="start-match-btn" style="width:100%;background:linear-gradient(135deg, #fffbe6 0%, #f0d6b3 30%, #e6c79c 100%);border:2px solid #6b7a8f;color:#6b7a8f;font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">
						${t.startMatchButton}
					</button>
				</div>
			`;
			document.body.appendChild(modal);
			modal.querySelector('#start-match-btn')!.addEventListener('click', () => {
				modal.remove();
				resolve();
			});
		});
	}

	// Start tournament flow
	renderTournamentBracket(canvas, ctx, players, winners, async () => {
		await showMatchModal(getUserName(player1_id), getUserName(player2_id));
		bracketWrapper.style.display = 'none';
		gameWrapper.innerHTML = '';

		setTimeout(() => {
			const pongCanvas = gameWrapper.querySelector('canvas');
			if (pongCanvas) {
				pongCanvas.width = 1280;
				pongCanvas.height = 680;
			}
		}, 0);

		const game1 = createFakeGame(player1_id, player2_id);

		state.player1 = null;
		state.player2 = null;
		state.ball = null;

		renderGame(gameWrapper, getUserName(player1_id), getUserName(player2_id), maxGames,
			difficulty, async (gameCanvas, score1, score2) => {
				await endGame(
					score1,
					score2,
					gameCanvas,
					async (winner1Id) => {
						if (!winner1Id) return alert(t.semifinal1Undetermined);
						winners.semifinal1 = winner1Id;

						bracketWrapper.style.display = 'flex';
						gameWrapper.style.display = 'none';

						renderTournamentBracket(canvas, ctx, players, winners, async () => {
							await showMatchModal(getUserName(player3_id), getUserName(player4_id));
							bracketWrapper.style.display = 'none';
							gameWrapper.innerHTML = '';
							gameWrapper.style.display = 'block';

							const game2 = createFakeGame(player3_id, player4_id);

							state.player1 = null;
							state.player2 = null;
							state.ball = null;

							renderGame(gameWrapper, getUserName(player3_id), getUserName(player4_id), maxGames,
								difficulty, async (gameCanvas2, score3, score4) => {
									await endGame(
										score3,
										score4,
										gameCanvas2,
										async (winner2Id) => {
											if (!winner2Id) return alert(t.semifinal2Undetermined);
											winners.semifinal2 = winner2Id;

											bracketWrapper.style.display = 'flex';
											gameWrapper.style.display = 'none';

											const leftFinalId = winners.semifinal1!;
											const rightFinalId = winners.semifinal2!;

											renderTournamentBracket(canvas, ctx, players, winners, async () => {
												await showMatchModal(getUserName(leftFinalId), getUserName(rightFinalId));
												bracketWrapper.style.display = 'none';
												gameWrapper.innerHTML = '';
												gameWrapper.style.display = 'block';

												const finalGame = createFakeGame(leftFinalId, rightFinalId);

												state.player1 = null;
												state.player2 = null;
												state.ball = null;

												renderGame(gameWrapper, getUserName(leftFinalId), getUserName(rightFinalId), maxGames,
													difficulty, async (finalCanvas, scoreF1, scoreF2) => {
														await endGame(
															scoreF1,
															scoreF2,
															finalCanvas,
															async (finalWinnerId) => {
																if (!finalWinnerId) {
																	alert(t.finalUndetermined);
																	return;
																}
																winners.final = finalWinnerId;

																bracketWrapper.style.display = 'flex';
																gameWrapper.style.display = 'none';

																renderTournamentBracket(canvas, ctx, players, winners, () => {
																	renderLocalTournamentPage(container as HTMLDivElement);
																});
															},
															getUserName(leftFinalId),
															getUserName(rightFinalId),
															'tournament',
															finalGame.game_id
														);
													});
											});
										},
										getUserName(player3_id),
										getUserName(player4_id),
										'tournament',
										game2.game_id
									);
								});
						});
					},
					getUserName(player1_id),
					getUserName(player2_id),
					'tournament',
					game1.game_id
				);
			});
	});
}
