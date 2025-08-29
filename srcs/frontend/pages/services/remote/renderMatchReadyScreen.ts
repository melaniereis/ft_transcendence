export function renderMatchReadyScreen(
container: HTMLDivElement,
playerName: string,
opponentName: string,
maxGames: number,
onConfirm: () => void
) {
console.log('renderMatchReadyScreen called', { playerName, opponentName, maxGames });

container.innerHTML = `
<div style="text-align:center; margin-top: 2rem;">
	<h2>Match Ready</h2>
	<p>You: <strong>${playerName}</strong></p>
	<p>Opponent: <strong>${opponentName}</strong></p>
	<p>Number of games: <strong>${maxGames}</strong></p>
	<button id="confirmBtn">Start Game</button>
</div>
`;

const btn = container.querySelector('#confirmBtn') as HTMLButtonElement;
if (!btn) {
	console.error('Confirm button not found!');
	return;
}
btn.onclick = () => {
	console.log('Confirm button clicked');
	onConfirm();
};
}
