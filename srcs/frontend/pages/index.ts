import { renderRegistrationForm } from './services/registrationFrom.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournaments.js';
import { renderTeamsPage } from './services/teams.js';

const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const tournamentsBtn = document.getElementById('tournaments-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const appDiv = document.getElementById('app') as HTMLDivElement;

console.log('appDiv:', appDiv);

console.log('playBtn:', playBtn);
playBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderRegistrationForm(appDiv);
});

console.log('settingsBtn:', settingsBtn);
settingsBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderSettingsPage(appDiv);
});

console.log('tournamentsBtn:', tournamentsBtn);
tournamentsBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderTournamentsPage(appDiv);
});


console.log('teamsBtn:', teamsBtn);
teamsBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderTeamsPage(appDiv);
});