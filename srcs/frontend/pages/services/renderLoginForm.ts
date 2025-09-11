import { translations } from "./language/translations.js";
import {startActivityMonitoring} from "./activity.js"

export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div class="min-h-screen flex items-center justify-center">
			<div class="w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg text-white">
				<h2 class="text-3xl font-bold text-center mb-6 text-white">${t.loginTitle}</h2>
				<form id="login-form" class="space-y-6">
					<div>
						<label class="block text-lg font-medium mb-2 text-white">${t.username}</label>
						<input 
							type="text" 
							name="username" 
							placeholder="${t.username}" 
							required 
							class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
						/>
					</div>
					<div>
						<label class="block text-lg font-medium mb-2 text-white">${t.password}</label>
						<input 
							type="password" 
							name="password" 
							placeholder="${t.password}" 
							required 
							class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
						/>
					</div>
					<button 
						type="submit" 
						class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
					>
						${t.login}
					</button>
				</form>
				<div id="login-result" class="mt-4 text-center text-sm text-white"></div>
			</div>
		</div>
	`;

	const form = document.getElementById('login-form') as HTMLFormElement;
	const resultDiv = document.getElementById('login-result') as HTMLDivElement;

	form.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const formData = new FormData(form);
		const data = {
			username: formData.get('username') as string,
			password: formData.get('password') as string,
		};

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await res.json();
			if (result.token) {
				localStorage.setItem('authToken', result.token);
				localStorage.setItem('playerId', result.user.id);
				localStorage.setItem('playerName', result.user.username);
				resultDiv.textContent = t.success;

				// ✅ Start monitoring after token is saved
				startActivityMonitoring();

				onLoginSuccess();
			} else {
				resultDiv.textContent = t.invalid;
			}
		} catch (err) {
			console.error('Login error:', err);
			resultDiv.textContent = t.failed;
		}
	});
}
