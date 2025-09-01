export async function endGame(gameId: number,score1: number,score2: number,
    canvas: HTMLCanvasElement,onRestart: () => void, player1Name: string,
    player2Name: string,) {
    try {
        await fetch(`https://localhost:3000/games/${gameId}/end`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                score_player1: score1,
                score_player2: score2
            })
        });
        console.log('Game ended and scores saved.');
    } 
    catch (err) {
        console.error('Failed to end game:', err);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) 
        return;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const winner =
        score1 > score2 ? `${player1Name} wins!` :
        score2 > score1 ? `${player2Name} wins!` : 'It\'s a draw!';

    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 60);
    ctx.fillText(winner, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Final Score: ${player1Name} ${score1} - ${score2} ${player2Name}`, canvas.width / 2, canvas.height / 2 + 20);

    const rect = canvas.getBoundingClientRect();

    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart Game';
    restartBtn.style.position = 'absolute';
    restartBtn.style.left = `${rect.left + canvas.width / 2 - 130}px`;
    restartBtn.style.top = `${rect.top + canvas.height / 2 + 60}px`;
    restartBtn.style.padding = '10px 20px';
    restartBtn.style.fontSize = '16px';
    restartBtn.style.cursor = 'pointer';

    const menuBtn = document.createElement('button');
    menuBtn.textContent = 'Back to Menu';
    menuBtn.style.position = 'absolute';
    menuBtn.style.left = `${rect.left + canvas.width / 2 + 10}px`;
    menuBtn.style.top = `${rect.top + canvas.height / 2 + 60}px`;
    menuBtn.style.padding = '10px 20px';
    menuBtn.style.fontSize = '16px';
    menuBtn.style.cursor = 'pointer';

    document.body.appendChild(restartBtn);
    document.body.appendChild(menuBtn);

    restartBtn.onclick = () => {
        restartBtn.remove();
        menuBtn.remove();
        onRestart();
    };

    menuBtn.onclick = () => {
        restartBtn.remove();
        menuBtn.remove();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        location.reload();
    };
}