import { renderTeamStats } from './teamStats.js';

export function renderTeamsPage(container: HTMLElement) {
container.innerHTML = `
	<h2>Select a Team</h2>
	<div style="display: flex; gap: 2rem; flex-wrap: wrap;">
	<img src="assets/hacktivists.png" alt="Hacktivists" class="team-img" data-team="hacktivists" />
	<img src="assets/bugbusters.png" alt="Bug Busters" class="team-img" data-team="bug_busters" />
	<img src="assets/logicleague.png" alt="Logic League" class="team-img" data-team="logic_league" />
	<img src="assets/codealliance.png" alt="Code Alliance" class="team-img" data-team="code_allience" />
	</div>
`;

const images = container.querySelectorAll('.team-img') as NodeListOf<HTMLImageElement>;

images.forEach(img => {
	img.addEventListener('click', () => {
	const teamName = img.dataset.team!;
	container.innerHTML = '';
	renderTeamStats(container, teamName);
	});
});
}
