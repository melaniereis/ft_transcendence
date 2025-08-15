export function renderRegistrationForm(container) {
    container.innerHTML = `
    <h2>Register</h2>
    <form id="registration-form">
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
        <input type="text" id="team" required />
      </label>
      <label>
        Password:
        <input type="password" id="password" required />
      </label>
      <button type="submit">Register</button>
    </form>
    <div id="result"></div>
  `;
    const form = document.getElementById('registration-form');
    const result = document.getElementById('result');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const team = document.getElementById('team').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, team, password })
            });
            if (!response.ok)
                throw new Error('Failed to register');
            const data = await response.json();
            result.innerText = `✅ Registered: ${JSON.stringify(data)}`;
            form.reset();
        }
        catch (err) {
            result.innerText = `❌ ${err.message}`;
        }
    });
}
