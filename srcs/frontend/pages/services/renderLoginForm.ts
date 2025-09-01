export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
container.innerHTML = `
	<h2>Login</h2>
	<form id="login-form">
	<input type="text" name="username" placeholder="Username" required />
	<input type="password" name="password" placeholder="Password" required />
	<button type="submit">Login</button>
	</form>
	<div id="login-result"></div>
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
		resultDiv.textContent = 'Login successful!';
		onLoginSuccess(); // 👈 Update UI
	} 
	else
		resultDiv.textContent = 'Invalid credentials.';
	} 
	catch (err) {
	resultDiv.textContent = 'Login failed.';
	}
});
}
