export async function updateMatch(tournamentId: number, round: string, winnerId: number) {
	const authToken = localStorage.getItem('authToken') || '';

	const res = await fetch(`/api/tournaments/${tournamentId}/match`, {
		method: 'PUT',
		headers: { 
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${authToken}`
		},
		body: JSON.stringify({ round, winnerId })
	});

	if (!res.ok) {
		throw new Error(`Failed to update match: ${res.status} ${res.statusText}`);
	}
}
