import { renderGame } from '../renderGame/renderGame.js';
import { updateMatch } from './updateMatch.js';
import { renderTournamentsPage } from './tournaments.js';
import { waitForWinner } from './waitForWinner.js';

export async function startTournament(container: HTMLElement, tournament: any, users: any[]) {
  const { id, player1_id, player2_id, player3_id, player4_id } = tournament;

  const getUserName = (userId: number): string => {
    const user = users.find((u: any) => u.id === userId);
    return user?.username || `User ${userId}`;
  };

  const difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal';
  const maxGames = 3;

  // 🥊 Semifinal 1
  const game1Res = await fetch('https://localhost:3000/games', {
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

  renderGame(
    container,
    getUserName(player1_id),
    getUserName(player2_id),
    game1.game_id,
    maxGames,
    difficulty,
    async () => {
      const winner1Id = await waitForWinner(game1.game_id);
      if (!winner1Id) {
        alert('❌ Could not determine winner for Semifinal 1. Tournament aborted.');
        return;
      }

      await updateMatch(id, 'semifinal1', winner1Id);

      // 🥊 Semifinal 2
      const game2Res = await fetch('https://localhost:3000/games', {
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

      renderGame(
        container,
        getUserName(player3_id),
        getUserName(player4_id),
        game2.game_id,
        maxGames,
        difficulty,
        async () => {
          const winner2Id = await waitForWinner(game2.game_id);
          if (!winner2Id) {
            alert('❌ Could not determine winner for Semifinal 2. Tournament aborted.');
            return;
          }

          await updateMatch(id, 'semifinal2', winner2Id);

          // 🏆 Final Match
          const finalGameRes = await fetch('https://localhost:3000/games', {
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
            container,
            getUserName(winner1Id),
            getUserName(winner2Id),
            finalGame.game_id,
            maxGames,
            difficulty,
            async () => {
              const finalWinnerId = await waitForWinner(finalGame.game_id);
              if (!finalWinnerId) {
                alert('❌ Could not determine winner for Final match. Tournament incomplete.');
                return;
              }

              await updateMatch(id, 'final', finalWinnerId);
              alert(`🏆 Tournament complete! Winner: ${getUserName(finalWinnerId)}`);
              renderTournamentsPage(container as HTMLDivElement);
            },
            'tournament'
          );
        },
        'tournament'
      );
    },
    'tournament'
  );
}

