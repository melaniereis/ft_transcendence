export function renderRegistrationForm(container: HTMLElement): void {
    container.innerHTML = `
        <h2>Register</h2>
        <form id="register-form">
            <label>
                Name:
                <input type="text" id="name" required />
            </label>
            <label>
                Username:
                <input type="text" id="username" required />
            </label>
            <label>
                Team:
                <select id="team" required>
                    <option value="">Select a team</option>
                    <option value="HACKTIVISTS">HACKTIVISTS</option>
                    <option value="BUG BUSTERS">BUG BUSTERS</option>
                    <option value="LOGIC LEAGUE">LOGIC LEAGUE</option>
                    <option value="CODE ALLIANCE">CODE ALLIANCE</option>
                </select>
            </label>
            <label>
                Password:
                <input type="password" id="password" required />
            </label>
            <button type="submit">Register</button>
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
            const res = await fetch('https://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            resultDiv.textContent = result.success
                ? `Registered! User ID: ${result.userId}`
                : `Error: ${result.error}`;
            form.reset();
        } catch (err) {
            resultDiv.textContent = 'Registration failed.';
        }
    });
}
