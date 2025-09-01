export function renderTournamentBracket(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D,
players: { id: number; name: string }[],
winners: { semifinal1?: number; semifinal2?: number; final?: number },
onNext?: () => void) {
	if (!ctx || players.length !== 4) 
		return;

	const bg = new Image();
	bg.src = 'assets/gris.jpg';

	bg.onload = () => {
		// Draw background image
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

		// Set styles for bracket drawing
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 16px Arial';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = '#fff';

		const horizontalSpacing = 100;
		const verticalOffset = 10;

		const positions = {
		p1: { x: 50, y: 30 },
		p2: { x: 50, y: 70 },
		p3: { x: 50, y: 110 },
		p4: { x: 50, y: 150 },
		semi1: { x: 200, y: 50 },
		semi2: { x: 200, y: 130 },
		final: { x: 350, y: 90 }
		};

		// Draw player names
		['p1', 'p2', 'p3', 'p4'].forEach((key, index) => {
		const pos = positions[key as keyof typeof positions];
		const player = players[index];
		if (pos && player) ctx.fillText(player.name, pos.x, pos.y);
		});

		// Draw lines to semifinals
		ctx.beginPath();
		ctx.moveTo(positions.p1.x + horizontalSpacing, positions.p1.y);
		ctx.lineTo(positions.semi1.x - verticalOffset, positions.semi1.y - verticalOffset);
		ctx.moveTo(positions.p2.x + horizontalSpacing, positions.p2.y);
		ctx.lineTo(positions.semi1.x - verticalOffset, positions.semi1.y + verticalOffset);
		ctx.moveTo(positions.p3.x + horizontalSpacing, positions.p3.y);
		ctx.lineTo(positions.semi2.x - verticalOffset, positions.semi2.y - verticalOffset);
		ctx.moveTo(positions.p4.x + horizontalSpacing, positions.p4.y);
		ctx.lineTo(positions.semi2.x - verticalOffset, positions.semi2.y + verticalOffset);
		ctx.stroke();

		// Draw semifinal winners
		if (winners.semifinal1) {
		const winnerName = players.find(p => p.id === winners.semifinal1)?.name || 'Winner';
		ctx.fillText(winnerName, positions.semi1.x + 10, positions.semi1.y);
		}
		if (winners.semifinal2) {
		const winnerName = players.find(p => p.id === winners.semifinal2)?.name || 'Winner';
		ctx.fillText(winnerName, positions.semi2.x + 10, positions.semi2.y);
		}

		// Draw lines to final
		if (winners.semifinal1 && winners.semifinal2) {
		ctx.beginPath();
		ctx.moveTo(positions.semi1.x + horizontalSpacing, positions.semi1.y);
		ctx.lineTo(positions.final.x - verticalOffset, positions.final.y - verticalOffset);
		ctx.moveTo(positions.semi2.x + horizontalSpacing, positions.semi2.y);
		ctx.lineTo(positions.final.x - verticalOffset, positions.final.y + verticalOffset);
		ctx.stroke();
		}

		// Draw final winner
		if (winners.final) {
		const winnerName = players.find(p => p.id === winners.final)?.name || 'Champion';
		ctx.fillText(`🏆 ${winnerName}`, positions.final.x + 10, positions.final.y);
		}

		// Create button
		const parent = document.getElementById('bracket-wrapper');
		if (!parent) return;

		const existingButton = parent.querySelector('.next-match-btn');
		if (existingButton) existingButton.remove();

		const button = document.createElement('button');
		if (!winners.semifinal1 && !winners.semifinal2 && !winners.final)
		button.textContent = 'Start Tournament';
		else if ((winners.semifinal1 && !winners.semifinal2) || (!winners.semifinal1 && winners.semifinal2))
		button.textContent = 'Next Semifinal';
		else if (winners.semifinal1 && winners.semifinal2 && !winners.final)
		button.textContent = 'Go to Final';
		else if (winners.final)
		button.textContent = '🏁 Tournament Finished — Back to Main Menu';

		button.className = 'next-match-btn';
		button.style.display = 'block';
		button.style.margin = '10px auto';
		button.style.padding = '8px 16px';
		button.style.fontSize = '16px';
		button.onclick = () => {
		button.remove();
		if (onNext) onNext();
		};

		parent.appendChild(button);
	};
}