import { renderRegistrationForm } from './render.js';
const playBtn = document.getElementById('play-btn');
const appDiv = document.getElementById('app');
playBtn.addEventListener('click', () => {
    renderRegistrationForm(appDiv);
});
