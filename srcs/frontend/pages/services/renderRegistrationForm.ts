import { translations } from './language/translations.js';

export function renderRegistrationForm(container: HTMLElement): void {
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

container.innerHTML = `
	<h2>${t.registerTitle}</h2>
	<form id="register-form">
	<label>
		${t.name}:
		<input type="text" id="name" required />
	</label>
	<label>
		${t.username}:
		<input type="text" id="username" required />
	</label>
	<label>
		${t.team}:
		<select id="team" required>
		<option value="">${t.selectTeam}</option>
		<option value="HACKTIVISTS">HACKTIVISTS</option>
		<option value="BUG BUSTERS">BUG BUSTERS</option>
		<option value="LOGIC LEAGUE">LOGIC LEAGUE</option>
		<option value="CODE ALLIANCE">CODE ALLIANCE</option>
		</select>
	</label>
	<label>
		${t.password}:
		<input type="password" id="password" required />
	</label>
	<button type="submit">${t.register}</button>
	</form>
	<div id="register-result"></div>
`;

const form = document.getElementById('register-form') as HTMLFormElement;
const resultDiv = document.getElementById('register-result') as HTMLDivElement;

form.addEventListener('submit', async (e: Event) => {
	e.preventDefault();

	const name = (document.getElementById('name') as HTMLInputElement).value;
	const username = (document.getElementById('username') as HTMLInputElement).value;
	const team = (document.getElementById('team') as HTMLSelectElement).value;
	const password = (document.getElementById('password') as HTMLInputElement).value;

	const data = { name, username, team, password };

	try {
	const res = await fetch('/api/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	const result = await res.json();
	resultDiv.textContent = result.success
		? `${t.registrationSuccess} ${result.userId}`
		: `${t.registrationError} ${result.error}`;
	form.reset();
	} 
	catch (err) {
	resultDiv.textContent = t.registrationFailed;
	}
});
}