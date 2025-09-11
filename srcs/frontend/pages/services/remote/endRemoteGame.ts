export function endGame(score1: number, score2: number, canvas: HTMLCanvasElement,
	player1Name: string, player2Name: string) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Fill background
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Display final score
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';

	ctx.font = '48px Arial';
	ctx.fillText('🎮 Game Over', canvas.width / 2, canvas.height / 2 - 80);

	ctx.font = '32px Arial';
	ctx.fillText(`${player1Name}: ${score1}`, canvas.width / 2, canvas.height / 2 - 20);
	ctx.fillText(`${player2Name}: ${score2}`, canvas.width / 2, canvas.height / 2 + 30);

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
	menuBtn.style.backgroundColor = '#fff';
	menuBtn.style.border = '2px solid #000';
	menuBtn.style.borderRadius = '5px';
	menuBtn.style.color = '#000';

	menuBtn.onclick = () => {
		buttonContainer.remove();
		window.location.href = '/'; // Adjust if needed
	};

	buttonContainer.appendChild(menuBtn);

	// Prefer attaching to canvas container
	canvas.parentElement?.appendChild(buttonContainer);
}
