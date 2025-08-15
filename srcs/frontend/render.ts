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

    <button id="show-users">Show All Users</button>

    <h3>Delete User</h3>
    <label>
      Enter Username to Delete:
      <input type="text" id="delete-username" />
    </label>
    <button id="delete-user">Delete User</button>

    <div id="result"></div>
  `;

  const form = document.getElementById('registration-form') as HTMLFormElement;
  const result = document.getElementById('result') as HTMLDivElement;
  const showUsersBtn = document.getElementById('show-users') as HTMLButtonElement;
  const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;

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

  showUsersBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();
      result.innerHTML = `
        <h3>All Users:</h3>
        <ul>
          ${users.map((user: any) => `<li>${user.name} (${user.username}) - ${user.team}</li>`).join('')}
        </ul>
      `;
    } catch (err) {
      result.innerText = `❌ ${(err as Error).message}`;
    }
  });

  deleteBtn.addEventListener('click', async () => {
    const usernameToDelete = (document.getElementById('delete-username') as HTMLInputElement).value.trim();
    if (!usernameToDelete) {
      result.innerText = '❌ Please enter a username to delete';
      return;
    }

    try {
      const response = await fetch('/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();
      const user = users.find((u: any) => u.username === usernameToDelete);

      if (!user) {
        result.innerText = `❌ No user found with username "${usernameToDelete}"`;
        return;
      }

      await fetch(`/users/${user.id}`, { method: 'DELETE' });
      result.innerText = `🗑️ Deleted user "${usernameToDelete}" (ID: ${user.id})`;
    } catch (err) {
      result.innerText = `❌ ${(err as Error).message}`;
    }
  });
}
