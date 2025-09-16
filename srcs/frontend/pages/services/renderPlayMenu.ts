import { renderRegistrationForm } from './renderRegistrationForm.js';
import { renderPlayerSelection } from './renderPlayerSelection.js';

export function renderPlayMenu(container: HTMLElement) {
	container.innerHTML = `
	<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
		<h2 style="font-size:2.6rem;font-weight:700;color:#fff;margin-bottom:2.2rem;letter-spacing:0.04em;text-shadow:0 6px 32px rgba(44,34,84,0.22);">Welcome to the Game</h2>
		<button id="create-user-btn" style="margin-bottom:1.2rem;">Create User</button>
		<button id="start-game-btn">Players Already Registered</button>
	</div>
	<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('assets/Background3.jpg') center center / cover no-repeat fixed;">
		<div style="position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 60% 30%,rgba(236,233,244,0.13) 0%,rgba(182,166,202,0.09) 40%,rgba(44,34,84,0.04) 100%);mix-blend-mode:screen;"></div>
	</div>
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
