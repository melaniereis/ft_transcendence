import { translations } from "./language/translations.js";
import { startActivityMonitoring } from "./activity.js"

export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div class="flex flex-col items-center justify-center h-screen p-6 bg-cover bg-center">
			<h2 class="text-6xl font-bold text-black mb-8">${t.loginTitle}</h2>

			<div class="bg-transparent p-8 rounded-lg shadow-xl space-y-6 w-full max-w-xl backdrop-blur-md">
				<form id="login-form" class="space-y-6">
					<label class="text-2xl font-bold text-black block">
						${t.username}:
						<input type="text" name="username" placeholder="${t.username}" required
							class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black placeholder-gray-500" />
					</label>

					<label class="text-2xl font-bold text-black block">
						${t.password}:
						<input type="password" name="password" placeholder="${t.password}" required
							class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black placeholder-gray-500" />
					</label>

					<button type="submit"
						class="w-full py-4 text-2xl font-bold text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
						${t.login}
					</button>
				</form>

				<div id="login-result" class="text-xl text-red-600 text-center"></div>
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
				// Store token and user info
				localStorage.setItem('authToken', result.token);
				localStorage.setItem('playerId', result.user.id);
				localStorage.setItem('playerName', result.user.username);

				resultDiv.classList.remove('text-red-600', 'text-green-600');
				resultDiv.classList.add('text-green-600');
				resultDiv.textContent = t.success;

				// ✅ Start monitoring after token is saved
				startActivityMonitoring();

				onLoginSuccess();
			} 
			else {
				resultDiv.classList.remove('text-green-600', 'text-red-600');
				resultDiv.classList.add('text-red-600');
				resultDiv.textContent = t.invalid;
			}
		} 
		catch (err) {
			resultDiv.classList.remove('text-green-600', 'text-red-600');
			resultDiv.classList.add('text-red-600');
			console.error('Login error:', err);
			resultDiv.textContent = t.failed;
		}
	});
}
