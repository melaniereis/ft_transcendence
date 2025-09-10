export async function waitForWinner(gameId: number, maxAttempts = 10, delay = 200): Promise<number | null> {
	for (let i = 0; i < maxAttempts; i++) {
		const res = await fetch(`/games/${gameId}`);
		const data = await res.json();
		if (typeof data.winner_id === 'number') return data.winner_id;
		await new Promise(resolve => setTimeout(resolve, delay));
	}
	console.warn(`No winner found for game ${gameId} after ${maxAttempts} attempts.`);
	return null;
}