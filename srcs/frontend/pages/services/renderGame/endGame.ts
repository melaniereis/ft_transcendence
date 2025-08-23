export async function endGame(
gameId: number,
score1: number,
score2: number,
canvas: HTMLCanvasElement,
onRestart: (winnerId?: number) => void,
player1Name: string,
player2Name: string,
mode: 'single' | 'tournament' = 'single'
) {
	let winnerId: number | undefined;

	try {
		const res = await fetch(`https://localhost:3000/games/${gameId}/end`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ score_player1: score1, score_player2: score2 })
		});
		const data = await res.json();
		winnerId = data.winner_id;
		console.log('✅ Game ended. Winner:', winnerId);
	} 
	catch (err) {
		console.error('❌ Failed to end game:', err);
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) 
		return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';
	ctx.font = '24px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
	ctx.fillText(`${player1Name}: ${score1}`, canvas.width / 2, canvas.height / 2);
	ctx.fillText(`${player2Name}: ${score2}`, canvas.width / 2, canvas.height / 2 + 40);

	// 🎯 Create centered button container
	const buttonContainer = document.createElement('div');
	buttonContainer.style.position = 'absolute';
	buttonContainer.style.top = '50%';
	buttonContainer.style.left = '50%';
	buttonContainer.style.transform = 'translate(-50%, -50%)';
	buttonContainer.style.display = 'flex';
	buttonContainer.style.flexDirection = 'row';
	buttonContainer.style.gap = '20px';
	buttonContainer.style.zIndex = '10';

	// ▶️ Restart / Next Match button
	const restartBtn = document.createElement('button');
	restartBtn.textContent = mode === 'tournament' ? 'Next Match' : 'Restart';
	restartBtn.style.padding = '10px 20px';
	restartBtn.style.fontSize = '16px';
	restartBtn.style.cursor = 'pointer';
	buttonContainer.appendChild(restartBtn);


	// 🏠 Menu button (only in single mode)
	if (mode !== 'tournament') {
		const menuBtn = document.createElement('button');
		menuBtn.textContent = 'Main Menu';
		menuBtn.style.padding = '10px 20px';
		menuBtn.style.fontSize = '16px';
		menuBtn.style.cursor = 'pointer';
		buttonContainer.appendChild(menuBtn);

		menuBtn.onclick = () => {
		buttonContainer.remove();
		window.location.href = '/';
		};
	}

	// document.body.appendChild(buttonContainer);

	// restartBtn.onclick = () => {
	// 	buttonContainer.remove();
	// 	onRestart(winnerId);
	// };
  onRestart(winnerId);
}