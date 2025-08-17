export async function endGame(
	gameId: number,
	score1: number,
	score2: number,
	canvas: HTMLCanvasElement,
	onRestart: () => void
) {
	// 1. Send scores to backend
	try {
		await fetch(`/games/${gameId}/end`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				score_player1: score1,
				score_player2: score2
			})
		});
		console.log('Game ended and scores saved.');
	} catch (err) {
		console.error('Failed to end game:', err);
	}

	// 2. Render game over screen
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const winner =
		score1 > score2 ? 'Player 1 wins!' :
		score2 > score1 ? 'Player 2 wins!' :
		'It\'s a draw!';

	ctx.fillStyle = 'white';
	ctx.font = '32px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
	ctx.fillText(winner, canvas.width / 2, canvas.height / 2 - 20);
	ctx.fillText(`Final Score: ${score1} - ${score2}`, canvas.width / 2, canvas.height / 2 + 20);

	// 3. Create restart button
	const button = document.createElement('button');
	button.textContent = 'Restart Game';

	const rect = canvas.getBoundingClientRect();
	button.style.position = 'absolute';
	button.style.left = `${rect.left + canvas.width / 2 - 60}px`;
	button.style.top = `${rect.top + canvas.height / 2 + 60}px`;
	button.style.padding = '10px 20px';
	button.style.fontSize = '16px';
	button.style.cursor = 'pointer';
	document.body.appendChild(button);

	button.onclick = () => {
		button.remove(); // Remove button
		onRestart();     // Restart game logic
	};
}
