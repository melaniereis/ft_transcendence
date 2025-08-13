// public/index.ts
import { renderRegistrationForm } from './render';
const playBtn = document.getElementById('play-btn');
const nameInput = document.getElementById('player-name');
playBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name)
        return alert('Please enter your name');
    renderRegistrationForm(name);
});
