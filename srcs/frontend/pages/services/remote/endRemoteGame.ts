export function endGame(score1: number, score2: number, canvas: HTMLCanvasElement,
player1Name: string, player2Name: string) {
	const ctx = canvas.getContext('2d');
	if (!ctx) 
		return;

	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';
	ctx.font = '24px Arial';
	ctx.textAlign = 'center';

	// Display final score
	ctx.fillText('🎮 Game Over', canvas.width / 2, canvas.height / 2 - 60);
	ctx.fillText(`${player1Name}: ${score1}`, canvas.width / 2, canvas.height / 2 - 20);
	ctx.fillText(`${player2Name}: ${score2}`, canvas.width / 2, canvas.height / 2 + 20);

	// Create button container
	const buttonContainer = document.createElement('div');
	buttonContainer.style.position = 'absolute';
	buttonContainer.style.top = '60%';
	buttonContainer.style.left = '50%';
	buttonContainer.style.transform = 'translate(-50%, -50%)';
	buttonContainer.style.display = 'flex';
	buttonContainer.style.flexDirection = 'row';
	buttonContainer.style.gap = '20px';
	buttonContainer.style.zIndex = '10';

	// Main Menu button
	const menuBtn = document.createElement('button');
	menuBtn.textContent = 'Main Menu';
	menuBtn.style.padding = '10px 20px';
	menuBtn.style.fontSize = '16px';
	menuBtn.style.cursor = 'pointer';

	menuBtn.onclick = () => {
		buttonContainer.remove();
		window.location.href = '/'; // Update if your menu path is different
	};

	buttonContainer.appendChild(menuBtn);
	document.body.appendChild(buttonContainer);
}