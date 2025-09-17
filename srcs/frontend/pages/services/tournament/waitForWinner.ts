export async function waitForWinner(gameId: number, maxAttempts = 10, delay = 200): Promise<number | null> {
	for (let i = 0; i < maxAttempts; i++) {
		const res = await fetch(`/games/${gameId}`);
		const data = await res.json();
		if (typeof data.winner_id === 'number') return data.winner_id;
		await new Promise(resolve => setTimeout(resolve, delay));
	}
	// GRIS-inspired feedback UI for no winner found
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
	feedback.textContent = `No winner found for game ${gameId} after ${maxAttempts} attempts.`;
	document.body.appendChild(feedback);
	setTimeout(() => feedback.remove(), 3500);
	console.warn(`No winner found for game ${gameId} after ${maxAttempts} attempts.`);
	return null;
}