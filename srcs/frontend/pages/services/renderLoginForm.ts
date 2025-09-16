// srcs/frontend/pages/services/renderLoginForm.ts
import { translations } from "./language/translations.js";
import { startActivityMonitoring } from "./activity.js"

export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
	<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center">
			<h2 class="text-5xl font-bold text-[#e8d5ff] mb-8 drop-shadow-lg text-center" style="font-family:'Segoe UI',sans-serif;letter-spacing:0.08em;">${t.loginTitle}</h2>

			<div class="w-full max-w-xl p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-[rgba(44,34,84,0.10)] border border-[rgba(232,213,255,0.18)]" style="box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);">
				<form id="login-form" class="space-y-7 flex flex-col items-center">
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.username}:</span>
						<input type="text" name="username" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.username}" />
					</label>
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.password}:</span>
						<input type="password" name="password" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.password}" />
					</label>
					<div id="login-error" class="w-full text-red-600 text-lg text-center"></div>
					<button type="submit" class="mx-auto w-2/3 py-4 text-2xl font-bold text-[#2c2254] bg-gradient-to-r from-[#e8d5ff] to-[#6c4fa3] border-none rounded-full shadow-lg hover:from-[#6c4fa3] hover:to-[#e8d5ff] hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all duration-200">
						${t.login}
					</button>
				</form>
				<div id="login-result" class="text-xl text-red-600 mt-4 text-center"></div>
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


				// Call the success callback to handle navigation and UI updates
				onLoginSuccess();
			} else {
				resultDiv.classList.remove('text-green-600', 'text-red-600');
				resultDiv.classList.add('text-red-600');
				resultDiv.textContent = t.invalid;
			}
		} catch (err) {
			resultDiv.classList.remove('text-green-600', 'text-red-600');
			resultDiv.classList.add('text-red-600');
			console.error('Login error:', err);
			resultDiv.textContent = t.failed;
		}
	});
}
