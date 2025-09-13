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
		// GRIS-inspired error feedback
		const feedback = document.createElement('div');
		feedback.style.position = 'fixed';
		feedback.style.top = '2rem';
		feedback.style.left = '50%';
		feedback.style.transform = 'translateX(-50%)';
		feedback.style.background = 'rgba(255,251,230,0.96)';
		feedback.style.borderRadius = '1.2rem';
		feedback.style.boxShadow = '0 4px 16px rgba(44,34,84,0.10)';
		feedback.style.padding = '1.2rem 2rem';
		feedback.style.color = '#b8002f';
		feedback.style.fontWeight = '700';
		feedback.style.fontFamily = 'Poppins, sans-serif';
		feedback.style.zIndex = '9999';
		feedback.textContent = `Failed to update match: ${res.status} ${res.statusText}`;
		document.body.appendChild(feedback);
		setTimeout(() => feedback.remove(), 3500);
		throw new Error(`Failed to update match: ${res.status} ${res.statusText}`);
	}
}
