export async function updateMatch(tournamentId: number, round: string, winnerId: number) {
  await fetch(`https://localhost:3000/api/tournaments/${tournamentId}/match`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ round, winnerId })
  });
}
