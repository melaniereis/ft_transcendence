export function renderRegistrationForm(container: HTMLElement) {
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
        <select id="team" required>
          <option value="">Select a team</option>
          <option value="HACKTIVISTS">HACKTIVISTS</option>
          <option value="BUG BUSTERS">BUG BUSTERS</option>
          <option value="LOGIC LEAGUE">LOGIC LEAGUE</option>
          <option value="CODE ALLIANCE">CODE ALLIANCE</option>
        </select>
      </label>
      <label>
        <br>Password:
        <input type="password" id="password" required />
      </label>
      <button type="submit">Register</button>
    </form>

    <!-- ADD THIS DIV BELOW THE FORM TO SHOW RESULTS -->
    <div id="result"></div>
  `;

  const form = document.getElementById('registration-form') as HTMLFormElement;
  const result = document.getElementById('result') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const team = (document.getElementById('team') as HTMLSelectElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, team, password })
      });

      if (!response.ok) throw new Error('Failed to register');

      const data = await response.json();
      result.innerText = `✅ Registered: ${JSON.stringify(data)}`;
      form.reset();
    } catch (err) {
      result.innerText = `❌ ${(err as Error).message}`;
    }
  });
}
