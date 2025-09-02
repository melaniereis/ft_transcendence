import { renderGame } from '../renderGame/renderGame.js';
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

export async function startTournament(container: HTMLElement, tournament: any, selectedPlayers: any[]) {
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

	const bracketWrapper = document.createElement('div');
	bracketWrapper.id = 'bracket-wrapper';
	container.appendChild(bracketWrapper);

	const gameWrapper = document.createElement('div');
	gameWrapper.id = 'game-wrapper';
	container.appendChild(gameWrapper);

	const canvas = document.createElement('canvas');
	canvas.id = 'tournament-canvas';
	canvas.width = 500;
	canvas.height = 180;
	canvas.style.display = 'block';
	canvas.style.margin = '2px auto';
	canvas.style.border = '1px solid #ccc';
	canvas.style.backgroundColor = '#fff';
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

	// Semifinal 1
	renderTournamentBracket(canvas, ctx, players, winners, async () => {
		gameWrapper.innerHTML = '';
		const game1Res = await fetch('/games', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				player1_id,
				player2_id,
				max_games: maxGames,
				time_started: new Date().toISOString()
			})
		});
		const game1 = await game1Res.json();

		renderGame(gameWrapper, getUserName(player1_id), getUserName(player2_id), maxGames,
		difficulty, async (gameCanvas, score1, score2) => {
				await endGame(
					score1,
					score2,
					gameCanvas,
					async (winner1Id) => {
						if (!winner1Id) return alert('❌ Could not determine winner for Semifinal 1.');
						await updateMatch(id, 'semifinal1', winner1Id);
						winners.semifinal1 = winner1Id;

						// Semifinal 2
						renderTournamentBracket(canvas, ctx, players, winners, async () => {
							gameWrapper.innerHTML = '';
							const game2Res = await fetch('/games', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									player1_id: player3_id,
									player2_id: player4_id,
									max_games: maxGames,
									time_started: new Date().toISOString()
								})
							});
							const game2 = await game2Res.json();

							renderGame(gameWrapper, getUserName(player3_id), getUserName(player4_id), maxGames,
							difficulty,async (gameCanvas2, score3, score4) => {
									await endGame(
										score3,
										score4,
										gameCanvas2,
										async (winner2Id) => {
											if (!winner2Id) return alert('❌ Could not determine winner for Semifinal 2.');
											await updateMatch(id, 'semifinal2', winner2Id);
											winners.semifinal2 = winner2Id;

											// Final
											renderTournamentBracket(canvas, ctx, players, winners, async () => {
												gameWrapper.innerHTML = '';
												const finalGameRes = await fetch('/games', {
													method: 'POST',
													headers: { 'Content-Type': 'application/json' },
													body: JSON.stringify({
														player1_id: winner1Id,
														player2_id: winner2Id,
														max_games: maxGames,
														time_started: new Date().toISOString()
													})
												});
												const finalGame = await finalGameRes.json();

												renderGame(
													gameWrapper,
													getUserName(winner1Id),
													getUserName(winner2Id),
													maxGames,
													difficulty,
													async (finalCanvas, scoreF1, scoreF2) => {
														await endGame(
															scoreF1,
															scoreF2,
															finalCanvas,
															async (finalWinnerId) => {
																if (!finalWinnerId) {
																	alert('❌ Could not determine winner for Final match. Tournament incomplete.');
																	return;
																}
																await updateMatch(id, 'final', finalWinnerId);
																winners.final = finalWinnerId;

																renderTournamentBracket(canvas, ctx, players, winners, () => {
																	renderTournamentsPage(container as HTMLDivElement);
																});
															},
															getUserName(winner1Id),
															getUserName(winner2Id),
															'tournament',
															finalGame.game_id 
														);
													},
													'tournament',
													finalGame.game_id
												);
											});
										},
										getUserName(player3_id),
										getUserName(player4_id),
										'tournament',
										game2.game_id 
									);
								},
								'tournament',
								game2.game_id
							);
						});
					},
					getUserName(player1_id),
					getUserName(player2_id),
					'tournament',
					game1.game_id 
				);
			},
			'tournament',
			game1.game_id
		);
	});
}
