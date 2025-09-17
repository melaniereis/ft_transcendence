// srcs/frontend/pages/services/renderRegistrationForm.ts
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

		<div class="bg-transparent p-8 rounded-lg shadow-xl space-y-6 w-full max-w-xl backdrop-blur-md">
			<form id="register-form" class="space-y-6">
				<!-- Name -->
				<label class="text-2xl font-bold text-black block">
					${t.name}:
					<input type="text" id="name" required
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<!-- Username -->
				<label class="text-2xl font-bold text-black block">
					${t.username}:
					<input type="text" id="username" required
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<!-- Email -->
				<label class="text-2xl font-bold text-black block">
					${t.email} (optional):
					<input type="email" id="email"
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>
				<div id="email-error" class="text-red-600 text-lg"></div>

				<!-- Team -->
				<label class="text-2xl font-bold text-black block">
					${t.team}:
					<select id="team" required
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
					<option value="">${t.selectTeam}</option>
					<option value="HACKTIVISTS">HACKTIVISTS</option>
					<option value="BUG BUSTERS">BUG BUSTERS</option>
					<option value="LOGIC LEAGUE">LOGIC LEAGUE</option>
					<option value="CODE ALLIANCE">CODE ALLIANCE</option>
					</select>
				</label>

				<!-- Password -->
				<label class="text-2xl font-bold text-black block">
					${t.password}:
					<input type="password" id="password" required
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<!-- Confirm Password -->
				<label class="text-2xl font-bold text-black block">
					${t.confirmPassword || "Confirm Password"}:
					<input type="password" id="confirm-password" required
					class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<div id="password-error" class="text-red-600 text-lg"></div>
				<div id="confirm-password-error" class="text-red-600 text-lg"></div>

				<button type="submit"
					class="w-full py-4 text-2xl font-bold text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
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
	const emailErrorDiv = document.getElementById('email-error') as HTMLDivElement;

	function isValidEmail(email: string): boolean {
		const atIndex = email.indexOf('@');
		const dotIndex = email.lastIndexOf('.');
		return atIndex > 0 && dotIndex > atIndex + 1;
	}

	form.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const name = (document.getElementById('name') as HTMLInputElement).value.trim();
		const username = (document.getElementById('username') as HTMLInputElement).value.trim();
		const team = (document.getElementById('team') as HTMLSelectElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;
		const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;
		const email = (document.getElementById('email') as HTMLInputElement).value.trim();

		passwordErrorDiv.textContent = '';
		confirmPasswordErrorDiv.textContent = '';
		emailErrorDiv.textContent = '';
		resultDiv.textContent = '';

		if (!isStrongPassword(password)) {
			passwordErrorDiv.textContent = t.passwordStrengthError ||
				'Password must be at least 8 characters and include a number, a special character, and an uppercase letter.';
			return;
		}

		if (password !== confirmPassword) {
			confirmPasswordErrorDiv.textContent = t.passwordMismatch || 'Passwords do not match.';
			return;
		}

		if (email && !isValidEmail(email)) {
			emailErrorDiv.textContent = t.invalidEmail || 'Please enter a valid email address.';
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
			}
			else {
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