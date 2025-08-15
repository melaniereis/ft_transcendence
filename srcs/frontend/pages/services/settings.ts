export function renderSettingsPage(container: HTMLElement) {
container.innerHTML = `
	<h2>Player Settings</h2>

	<button id="show-users">Show All Users</button>

	<h3>Delete User</h3>
	<label>
	Enter Username to Delete:
	<input type="text" id="delete-username" />
	</label>
	<button id="delete-user">Delete User</button>

	<div id="result"></div>
`;

const result = document.getElementById('result') as HTMLDivElement;
const showUsersBtn = document.getElementById('show-users') as HTMLButtonElement;
const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;

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
