// public/index.ts
import { renderRegistrationForm } from './render';

const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const nameInput = document.getElementById('player-name') as HTMLInputElement;

playBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return alert('Please enter your name');
  renderRegistrationForm(name);
});
