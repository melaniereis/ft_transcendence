// public/render.ts
export function renderRegistrationForm(name: string) {
  const form = document.createElement('form');
  form.innerHTML = `
    <h2>Welcome, ${name}!</h2>
    <label>Username: <input type="text" name="username" /></label><br/>
    <label>Team: <input type="text" name="team" /></label><br/>
    <button type="submit">Register</button>
  `;
  document.body.appendChild(form);
}
