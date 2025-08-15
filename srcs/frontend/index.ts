import { renderRegistrationForm } from './render.js';

const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const appDiv = document.getElementById('app') as HTMLDivElement;

playBtn.addEventListener('click', () => {
  renderRegistrationForm(appDiv);
});
