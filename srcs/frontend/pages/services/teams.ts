import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

const teams = [
	{ key: 'hacktivists', displayName: 'Hacktivists', img: 'assets/hacktivists.png' },
	{ key: 'bug_busters', displayName: 'Bug Busters', img: 'assets/bugbusters.png' },
	{ key: 'logic_league', displayName: 'Logic League', img: 'assets/logicleague.png' },
	{ key: 'code_alliance', displayName: 'Code Alliance', img: 'assets/codealliance.png' },
];

export async function renderTeamsPage(container: HTMLElement) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">${t.loginRequired}</p>`;
		return;
	}

	// Inject dreamy clouds, gradient overlay, and magical styles
	if (!document.getElementById('teams-dreamy-styles')) {
		const style = document.createElement('style');
		style.id = 'teams-dreamy-styles';
		style.textContent = `
			.teams-bg { position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;z-index:0;background:transparent; }
			.teams-gradient { position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 60% 30%,rgba(236,233,244,0.13) 0%,rgba(182,166,202,0.09) 40%,rgba(44,34,84,0.04) 100%);mix-blend-mode:screen;animation:magicGradientMove 12s ease-in-out infinite alternate; }
			@keyframes magicGradientMove { 0%{background-position:60% 30%;} 100%{background-position:40% 70%;} }
			.cloud { position: absolute; border-radius: 50%; filter: blur(18px); opacity: 0.85; z-index: 10; pointer-events: none; animation: floatCloud 22s ease-in-out infinite alternate; }
			.cloud1 { width: 260px; height: 100px; left: 7vw; top: 9vh; animation-delay: 0s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
			.cloud2 { width: 360px; height: 140px; right: 9vw; top: 21vh; animation-delay: 2s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
			.cloud3 { width: 220px; height: 80px; left: 54vw; bottom: 13vh; animation-delay: 4s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
			.cloud4 { width: 180px; height: 60px; right: 18vw; bottom: 7vh; animation-delay: 6s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
			.cloud5 { width: 120px; height: 40px; left: 22vw; top: 33vh; animation-delay: 8s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
			.cloud6 { width: 90px; height: 30px; right: 28vw; bottom: 23vh; animation-delay: 10s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
			@keyframes floatCloud {
				0% { transform: translateY(0) scale(1); }
				20% { transform: translateY(-18px) scale(1.04); }
				50% { transform: translateY(0) scale(1); }
				80% { transform: translateY(12px) scale(0.98); }
				100% { transform: translateY(0) scale(1); }
			}
			@keyframes fadeInPanel {
				from { opacity: 0; transform: translateY(32px) scale(0.98); }
				to { opacity: 1; transform: translateY(0) scale(1); }
			}
			.teams-panel {
				background:linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);
				border-radius:2.8rem;
				box-shadow:0 0 32px 8px #d6d8e8,0 16px 64px 0 rgba(44,34,84,0.08),0 2px 16px 0 rgba(44,34,84,0.04);
				padding:2.2rem 1.6rem;
				max-width:1280px;
				width:100%;
				/* Removed blur effect */
				border:1.5px solid rgba(182,166,202,0.22);
				overflow:hidden;
				margin:auto;
				transition: box-shadow 0.3s, background 0.3s;
				animation: fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;
			}
			/* Removed hover effect for teams-panel */
			.team-card {
				background:linear-gradient(120deg,rgba(236,233,244,0.32) 0%,rgba(182,166,202,0.22) 100%);
				border-radius:2rem;
				box-shadow:0 0 24px 6px #d6d8e8,0 8px 32px 0 rgba(44,34,84,0.08),0 2px 8px 0 rgba(44,34,84,0.04);
				padding:1.6rem;
				transition: box-shadow 0.3s, background 0.3s;
				animation: fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;
			}
			.team-card:hover {
				background: rgba(255,255,255,0.88);
				box-shadow: 0 0 32px 8px #a5b4fc, 0 12px 40px 0 rgba(44,34,84,0.18), 0 2px 12px 0 rgba(44,34,84,0.12);
			}
			.team-img {
				box-shadow:0 4px 24px rgba(44,34,84,0.14);
				border-radius:50%;
				border:4px solid #a5b4fc;
				width:96px;height:96px;object-fit:cover;
				background:rgba(236,233,244,0.22);
			}
			.team-title {
				font-size:2.2rem;font-weight:700;color:#2c2254;margin-bottom:1.2rem;letter-spacing:0.04em;text-shadow:0 4px 16px rgba(44,34,84,0.12);font-family:'Inter','EB Garamond',serif;
			}
			.team-content {
				font-size:1.18rem;color:#2c2254;text-align:center;
			}
			.team-list {
				font-size:1.08rem;color:#2c2254;text-align:left;max-height:180px;overflow-y:auto;margin-top:1.2rem;
			}
			.team-list li {
				border-bottom:1px solid #d6d8e8;padding-bottom:0.8rem;margin-bottom:0.8rem;
			}
		`;
		document.head.appendChild(style);
	}

	container.className = '';
	container.style.color = '';
	container.innerHTML = `
        <div class="teams-bg">
            <div class="teams-gradient"></div>
            <canvas id="teams-celestial" style="position:absolute;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2;"></canvas>
            <div class="cloud cloud1"></div>
            <div class="cloud cloud2"></div>
            <div class="cloud cloud3"></div>
            <div class="cloud cloud4"></div>
            <div class="cloud cloud5"></div>
            <div class="cloud cloud6"></div>
        </div>
        <div class="teams-panel" style="position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
            <h2 class="team-title">${t.teams || 'Teams'}</h2>
            <div id="teams-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10 relative" style="width:100%;"></div>
        </div>
    `;

	// Celestial animation (stars/sparkles, lightweight)
	setTimeout(() => {
		const canvas = document.getElementById('teams-celestial') as HTMLCanvasElement;
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.willChange = 'transform';
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Stars (reduced for performance)
		const stars = Array.from({ length: 18 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 0.7 + Math.random() * 1.6,
			baseAlpha: 0.5 + Math.random() * 0.5,
			twinkleSpeed: 0.008 + Math.random() * 0.012,
			twinklePhase: Math.random() * Math.PI * 2,
			color: `rgba(255,255,255,`
		}));

		// Sparkles (reduced for performance)
		const sparkles = Array.from({ length: 12 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 1.5 + Math.random() * 2.5,
			dx: (Math.random() - 0.5) * 0.3,
			dy: (Math.random() - 0.5) * 0.3,
			alpha: 0.7 + Math.random() * 0.3,
			color: `rgba(${200 + Math.floor(Math.random() * 55)},${180 + Math.floor(Math.random() * 55)},255,`
		}));

		function draw() {
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw stars
			const now = performance.now();
			stars.forEach(star => {
				if (!ctx) return;
				const twinkle = star.baseAlpha + 0.4 * Math.sin(now * star.twinkleSpeed + star.twinklePhase);
				ctx.save();
				ctx.globalAlpha = Math.max(0.2, Math.min(1, twinkle));
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
				ctx.fillStyle = star.color + "1)";
				ctx.shadowColor = "rgba(255,255,255,0.8)";
				ctx.shadowBlur = 8;
				ctx.fill();
				ctx.restore();
			});

			// Draw sparkles
			sparkles.forEach(s => {
				if (!ctx) return;
				ctx.save();
				ctx.globalAlpha = s.alpha;
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
				ctx.fillStyle = s.color + "0.8)";
				ctx.shadowColor = s.color + "1)";
				ctx.shadowBlur = 12;
				ctx.fill();
				ctx.restore();
				s.x += s.dx;
				s.y += s.dy;
				if (s.x < 0) s.x = canvas.width;
				if (s.x > canvas.width) s.x = 0;
				if (s.y < 0) s.y = canvas.height;
				if (s.y > canvas.height) s.y = 0;
			});

			requestAnimationFrame(draw);
		}
		draw();
	}, 100);

	const grid = container.querySelector('#teams-grid') as HTMLElement;

	const statsPromises = teams.map(team => fetchTeamStats(team.key));
	const allTeamsStats = await Promise.all(statsPromises);

	allTeamsStats.forEach((members, idx) => {
		const team = teams[idx];
		grid.appendChild(createTeamStatsCard(team, members));
	});
}

// 🧩 Team Card Creator
function createTeamStatsCard(team: { key: string; displayName: string; img: string }, members: any[] | null) {
	const card = document.createElement('div');
	card.className = 'team-card flex flex-col items-center justify-center overflow-hidden';

	// Team image
	card.innerHTML = `
        <div class="flex justify-center mb-6 relative z-10">
            <img src="${team.img}" alt="${team.displayName}" class="team-img" />
        </div>
    `;

	const content = document.createElement('div');
	content.className = 'team-content flex-grow overflow-auto text-center relative z-10';

	if (!members || members.length === 0) {
		content.innerHTML = `<p>${t.noMembersFound} ${formatTeamName(team.key)}</p>`;
	} else {
		const avgWinRate = members.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / members.length;
		content.innerHTML = `
            <p class="italic mb-2">${t.averageWinRate}: <span class="font-semibold">${avgWinRate.toFixed(2)}%</span></p>
            <ul class="team-list">
                ${members.map((member: any) => `
                    <li>
                        <strong class="block mb-1" style="color:#818cf8;">${member.members}</strong>
                        <div>${t.wins}: ${member.victories}</div>
                        <div>${t.losses}: ${member.defeats}</div>
                        <div>${t.tournamentsWon}: ${member.tournaments_won}</div>
                        <div>${t.winRate}: ${(member.win_rate ?? 0).toFixed(2)}%</div>
                    </li>
                `).join('')}
            </ul>
        `;
	}

	card.appendChild(content);
	return card;
}

// 🧠 Helper: Format team name
function formatTeamName(name: string): string {
	return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// 🌐 Fetch team stats
async function fetchTeamStats(teamKey: string) {
	try {
		const response = await fetch(`/api/teams/${teamKey}`);
		if (!response.ok) throw new Error(t.failedToLoadTeamStats);
		const members = await response.json();
		members.sort((a: any, b: any) => b.win_rate - a.win_rate);
		return members;
	} catch (err) {
		return null;
	}
}
