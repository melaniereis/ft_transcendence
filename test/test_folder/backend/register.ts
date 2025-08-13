export function renderRegistrationForm(name: string) {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <form id="user-form">
      <input type="text" id="name" value="${name}" readonly />
      <input type="text" id="username" placeholder="Username" required />
      <input type="text" id="team" placeholder="Team" required />
      <button type="submit">Add User</button>
    </form>
    <button id="load-users">Load Users</button>
    <ul id="user-list"></ul>
  `;

  const form = document.getElementById('user-form') as HTMLFormElement;
  const loadBtn = document.getElementById('load-users') as HTMLButtonElement;
  const list = document.getElementById('user-list') as HTMLUListElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value.trim();
    const team = (document.getElementById('team') as HTMLInputElement).value.trim();

    if (!username || !team) return alert('Fill all fields');

    const res = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, team })
    });

    if (res.ok) {
      alert('User added!');
      form.reset();
    } else {
      const error = await res.json();
      alert('Error: ' + error.error);
    }
  });

  loadBtn.addEventListener('click', async () => {
    list.innerHTML = '';
    const res = await fetch('/users');
    const users = await res.json();

    users.forEach((user: { name: string; username: string; created_at: string }) => {
      const item = document.createElement('li');
      item.textContent = `${user.name} (${user.username}) - Joined: ${new Date(user.created_at).toLocaleString()}`;
      list.appendChild(item);
    });
  });
}
