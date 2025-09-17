import { translations } from '../language/translations.js';

export async function endGame(
	score1: number,
	score2: number,
	canvas: HTMLCanvasElement,
	onRestart: (winnerId?: number) => void,
	player1Name: string,
	player2Name: string,
	mode: 'single' | 'tournament' | 'quick' = 'single',
	gameId?: number
) {
	let winnerId: number | undefined;

	// 🌐 Get current language
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;

	const t = translations[lang];

	console.log("🎮 Game mode:", mode);

	if (gameId) {
		try {
			const res = await fetch(`/games/${gameId}/end`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
				},
				body: JSON.stringify({ score_player1: score1, score_player2: score2 })
			});
			const data = await res.json();
			winnerId = data.winner_id;
			console.log('✅ Game ended. Winner:', winnerId);
		} catch (err) {
			console.error(t.failedToEnd, err);
		}
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';
	ctx.font = '24px Arial';
	ctx.textAlign = 'center';

	ctx.fillText(t.gameOver, canvas.width / 2, canvas.height / 2 - 40);
	ctx.fillText(`${player1Name}: ${score1}`, canvas.width / 2, canvas.height / 2);
	ctx.fillText(`${player2Name}: ${score2}`, canvas.width / 2, canvas.height / 2 + 40);

	//if (isAI && winnerId !== undefined)
	//	ctx.fillText(winnerId === 1 ? t.youBeatAI : t.aiWins, canvas.width / 2, canvas.height / 2 + 60);

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
	restartBtn.textContent = mode === 'tournament' ? t.nextMatch : t.restart;
	restartBtn.style.padding = '10px 20px';
	restartBtn.style.fontSize = '16px';
	restartBtn.style.cursor = 'pointer';
	buttonContainer.appendChild(restartBtn);

	// 🏠 Menu button (only in single mode)
	if (mode !== 'tournament') {
		const menuBtn = document.createElement('button');
		menuBtn.textContent = t.mainMenu;
		menuBtn.style.padding = '10px 20px';
		menuBtn.style.fontSize = '16px';
		menuBtn.style.cursor = 'pointer';
		buttonContainer.appendChild(menuBtn);

		menuBtn.onclick = () => {
			buttonContainer.remove();
			window.location.href = '/';
		};

		document.body.appendChild(buttonContainer);

		restartBtn.onclick = () => {
			buttonContainer.remove();
			onRestart(winnerId);
		};
	} else {
		onRestart(winnerId);
	}
}
