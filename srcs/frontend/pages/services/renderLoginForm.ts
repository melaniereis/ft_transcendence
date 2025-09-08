import { translations } from "./language/translations.js";

export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
    const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
        ? localStorage.getItem('preferredLanguage')
        : 'en') as keyof typeof translations;
    const t = translations[lang];

    container.innerHTML = `
        <h2>${t.loginTitle}</h2>
        <form id="login-form">
            <label>
                ${t.username}:
                <input type="text" name="username" placeholder="${t.username}" required />
            </label>
            <label>
                ${t.password}:
                <input type="password" name="password" placeholder="${t.password}" required />
            </label>
            <button type="submit">${t.login}</button>
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
                resultDiv.textContent = t.success;
                onLoginSuccess();
            } else {
                resultDiv.textContent = t.invalid;
            }
        } catch (err) {
            resultDiv.textContent = t.failed;
        }
    });
}
