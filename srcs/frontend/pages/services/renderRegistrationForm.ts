import { translations } from './language/translations.js';
import { navigateTo } from '../index.js';

export function renderRegistrationForm(container: HTMLElement): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center">
			<h2 class="text-5xl font-bold text-[#e8d5ff] mb-8 drop-shadow-lg text-center" style="font-family:'Segoe UI',sans-serif;letter-spacing:0.08em;">${t.registerTitle}</h2>

			<div class="w-full max-w-xl p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-[rgba(44,34,84,0.10)] border border-[rgba(232,213,255,0.18)]" style="box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);">
				<form id="register-form" class="space-y-7 flex flex-col items-center">
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.name}:</span>
						<input type="text" id="name" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.name}" />
					</label>
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.username}:</span>
						<input type="text" id="username" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.username}" />
					</label>
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.email} (${t.notProvided}):</span>
						<input type="email" id="email" class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.email}" />
					</label>
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.team}:</span>
						<select id="team" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur text-[#2c2254]">
							<option value="">${t.selectTeam}</option>
							<option value="HACKTIVISTS">HACKTIVISTS</option>
							<option value="BUG BUSTERS">BUG BUSTERS</option>
							<option value="LOGIC LEAGUE">LOGIC LEAGUE</option>
							<option value="CODE ALLIANCE">CODE ALLIANCE</option>
						</select>
					</label>
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.password}:</span>
						<input type="password" id="password" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.password}" />
					</label>
					<div id="password-error" class="w-full text-red-600 text-lg text-center"></div>

					<!-- Confirm Password -->
					<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
						<span class="mb-2">${t.confirmPassword ?? 'Confirm Password'}:</span>
						<input type="password" id="confirm-password" required class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" placeholder="${t.confirmPassword ?? 'Confirm Password'}" />
					</label>
					<div id="confirm-password-error" class="w-full text-red-600 text-lg text-center"></div>

					<button type="submit" class="mx-auto w-2/3 py-4 text-2xl font-bold text-[#2c2254] bg-gradient-to-r from-[#e8d5ff] to-[#6c4fa3] border-none rounded-full shadow-lg hover:from-[#6c4fa3] hover:to-[#e8d5ff] hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all duration-200">
						${t.register}
					</button>
				</form>
				<div id="register-result" class="text-xl text-red-600 mt-4 text-center"></div>
			</div>
		</div>
	`;

	function isStrongPassword(pw: string): boolean {
		const minLength = pw.length >= 8;
		const hasNumber = /\d/.test(pw);
		const hasSpecial = /[^A-Za-z0-9]/.test(pw);
		const hasUppercase = /[A-Z]/.test(pw);
		return minLength && hasNumber && hasSpecial && hasUppercase;
	}

	const form = document.getElementById('register-form') as HTMLFormElement;
	const resultDiv = document.getElementById('register-result') as HTMLDivElement;
	const passwordErrorDiv = document.getElementById('password-error') as HTMLDivElement;
	const confirmPasswordErrorDiv = document.getElementById('confirm-password-error') as HTMLDivElement;

	form.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const name = (document.getElementById('name') as HTMLInputElement).value.trim();
		const username = (document.getElementById('username') as HTMLInputElement).value.trim();
		const team = (document.getElementById('team') as HTMLSelectElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value.trim();
		const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value.trim();
		const email = (document.getElementById('email') as HTMLInputElement).value.trim();

		passwordErrorDiv.textContent = '';
		confirmPasswordErrorDiv.textContent = '';
		resultDiv.textContent = '';

		// Email validation
		const atIndex = email.indexOf('@');
		const isValidEmail = (
			email &&
			atIndex > 0 &&
			email.indexOf('@', atIndex + 1) === -1 &&
			email.indexOf('.', atIndex) > atIndex + 1
		);

		if (email && !isValidEmail) {
			resultDiv.textContent = t.invalidEmail || 'Please enter a valid email address.';
			return;
		}

		if (!isStrongPassword(password)) {
			passwordErrorDiv.textContent = t.passwordStrengthError || 'Password must be at least 8 characters and include a number, a special character, and an uppercase letter.';
			return;
		}

		if (password !== confirmPassword) {
			confirmPasswordErrorDiv.textContent = t.passwordMismatch || 'Passwords do not match.';
			return;
		}

		const data = { name, username, team, password, email };

		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await res.json();

			if (result.success) {
				resultDiv.textContent = `${t.registrationSuccess} ${result.userId}`;
				resultDiv.classList.remove('text-red-600');
				resultDiv.classList.add('text-green-600');

				form.reset();

				setTimeout(() => {
					navigateTo('/login');
				}, 1000);
			} else {
				resultDiv.textContent = `${t.registrationError} ${result.error}`;
				resultDiv.classList.remove('text-green-600');
				resultDiv.classList.add('text-red-600');
			}
		} 
		catch (err) {
			resultDiv.textContent = t.registrationFailed || 'Registration failed. Please try again.';
			resultDiv.classList.remove('text-green-600');
			resultDiv.classList.add('text-red-600');
		}
	});
}
