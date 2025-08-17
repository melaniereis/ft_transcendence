import { renderRegistrationForm } from './registrationFrom.js';
import { renderPlayerSelection } from './renderPlayerSelection.js';

export function renderPlayMenu(container: HTMLElement) {
container.innerHTML = `
	<h2>Welcome to the Game</h2>
	<button id="create-user-btn">Create User</button>
	<button id="start-game-btn">Players Already Registered</button>
`;

const createUserBtn = document.getElementById('create-user-btn') as HTMLButtonElement;
const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;

createUserBtn.addEventListener('click', () => {
	container.innerHTML = '';
	renderRegistrationForm(container);
});

startGameBtn.addEventListener('click', () => {
	container.innerHTML = '';
	renderPlayerSelection(container);
});
}
