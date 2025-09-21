import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

const teams = [
	{ key: 'hacktivists', displayName: 'Hacktivists', img: '/hacktivists.png' },
	{ key: 'bug_busters', displayName: 'Bug Busters', img: '/bugbusters.png' },
	{ key: 'logic_league', displayName: 'Logic League', img: '/logicleague.png' },
	{ key: 'code_alliance', displayName: 'Code Alliance', img: '/codealliance.png' },
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
			.teams-bg { position:absolute !important;inset:0;width:100vw;height:100vh;overflow:hidden;z-index:0 !important;background:transparent; }
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
				border-radius:2rem;
				box-shadow:0 4px 32px 0 rgba(120,94,196,0.10), 0 2px 16px 0 rgba(120,94,196,0.03);
				padding:2.2rem 1.6rem;
				max-width:1280px;
				width:100%;
				border:1.5px solid rgba(182,166,202,0.22);
				overflow:hidden;
				margin:auto;
				transition: box-shadow 0.3s, background 0.3s;
				animation: fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;
				z-index: 3;
				padding-top: 72px;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}
			.team-card {
				background:linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);
				border-radius:2rem;
				box-shadow:0 4px 24px 0 rgba(120,94,196,0.10), 0 2px 8px 0 rgba(120,94,196,0.04);
				padding:2rem 1.2rem;
				transition: box-shadow 0.3s, background 0.3s;
				animation: fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}
			.team-card:hover {
				background: rgba(255,255,255,0.96);
				box-shadow: 0 8px 32px 0 #a5b4fc, 0 2px 12px 0 rgba(120,94,196,0.12);
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
			#top-bar, .top-bar {
				position: fixed !important;
				top: 0; left: 0; right: 0;
				z-index: 100 !important;
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
	card.className = 'team-card';
	card.style.background = 'linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%)';
	card.style.borderRadius = '2rem';
	card.style.boxShadow = '0 4px 24px 0 rgba(120,94,196,0.10), 0 2px 8px 0 rgba(120,94,196,0.04)';
	card.style.padding = '2rem 1.2rem';
	card.style.transition = 'box-shadow 0.3s, background 0.3s';
	card.style.position = 'relative';
	card.style.overflow = 'visible';
	card.style.display = 'flex';
	card.style.flexDirection = 'column';
	card.style.alignItems = 'center';
	card.style.justifyContent = 'center';

	// Celestial glow and floating particles
	card.innerHTML = `
		<div style="position:absolute;top:-32px;left:50%;transform:translateX(-50%);pointer-events:none;z-index:0;">
			<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="90" cy="30" rx="80" ry="24" fill="#c7d2fe" opacity="0.13"/>
				<ellipse cx="40" cy="18" rx="18" ry="8" fill="#a5b4fc" opacity="0.09"/>
				<ellipse cx="140" cy="42" rx="14" ry="6" fill="#f7b267" opacity="0.07"/>
				<ellipse cx="120" cy="16" rx="10" ry="4" fill="#fbcfe8" opacity="0.06"/>
			</svg>
		</div>
		<div class="flex justify-center mb-6 relative z-10">
			<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius:50%;box-shadow:0 4px 24px rgba(120,94,196,0.10);background:rgba(199,210,254,0.18);">
				<defs>
					<radialGradient id="teamGlow" cx="48" cy="48" r="44" gradientUnits="userSpaceOnUse">
						<stop stop-color="#818cf8"/>
						<stop offset="1" stop-color="#fbcfe8"/>
					</radialGradient>
				</defs>
				<circle cx="48" cy="48" r="44" fill="url(#teamGlow)" stroke="#818cf8" stroke-width="4"/>
				<image href="${team.img}" x="12" y="12" height="72" width="72" clip-path="circle(36)"/>
			</svg>
		</div>
	<h3 style="font-size: 2rem; font-weight: 700; color: #3b3663; margin-bottom: 0.8rem;letter-spacing: 0.04em; text-shadow: 0 4px 16px #a5b4fc, 0 2px 8px #818cf8;font-family:'Inter','EB Garamond',serif;">${team.displayName}</h3>
	`;

	const content = document.createElement('div');
	content.className = 'team-content';
	content.style.width = '100%';
	content.style.background = 'linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%)';
	content.style.borderRadius = '2rem';
	content.style.boxShadow = '0 2px 12px 0 #a5b4fc, 0 1px 4px 0 rgba(120,94,196,0.04)';
	content.style.padding = '1.2rem 0.8rem';
	content.style.display = 'flex';
	content.style.flexDirection = 'column';
	content.style.alignItems = 'center';

	if (!members || members.length === 0) {
		content.innerHTML = `<p style="color:#64748b;font-size:1.1rem;">${typeof formatTeamName === 'function' ? t.noMembersFound + ' ' + formatTeamName(team.key) : t.noMembersFound}</p>`;
	} else {
		// Show all members, even those with no stats
		const allMembers = members.filter(m => m && typeof m.members === 'string' && m.members.length > 0);
		const avgWinRate = allMembers.length > 0 ? allMembers.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / allMembers.length : 0;
		// Sort by win_rate descending for podium
		const sortedMembers = [...allMembers].sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0));
		const podium = sortedMembers.slice(0, 3);

		const podiumHtml = podium.length ? `
			<div style="display:flex;justify-content:center;align-items:flex-end;gap:1.2rem;margin-bottom:2rem;">
				${podium.map((member, idx) => {
			const initial = member.members[0] ? member.members[0].toUpperCase() : 'U';
			const colors = [
				'linear-gradient(120deg,rgba(251,207,232,0.18) 0%,rgba(129,140,248,0.18) 100%)', // 1st
				'linear-gradient(120deg,rgba(199,210,254,0.13) 0%,rgba(165,180,252,0.13) 100%)', // 2nd
				'linear-gradient(120deg,rgba(247,178,103,0.13) 0%,rgba(251,207,232,0.13) 100%)'  // 3rd
			];
			const heights = [72, 56, 44];
			// SVG medal icons (no emoji)
			const medalSvg = [
				`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fbcfe8" opacity="0.7"/><circle cx="12" cy="12" r="7" fill="#fffbe6" opacity="0.8"/><text x="12" y="16" text-anchor="middle" font-size="13" fill="#818cf8" font-family="Inter, Arial, sans-serif">1</text></svg>`,
				`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#c7d2fe" opacity="0.7"/><circle cx="12" cy="12" r="7" fill="#fffbe6" opacity="0.8"/><text x="12" y="16" text-anchor="middle" font-size="13" fill="#a5b4fc" font-family="Inter, Arial, sans-serif">2</text></svg>`,
				`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f7b267" opacity="0.7"/><circle cx="12" cy="12" r="7" fill="#fffbe6" opacity="0.8"/><text x="12" y="16" text-anchor="middle" font-size="13" fill="#fbcfe8" font-family="Inter, Arial, sans-serif">3</text></svg>`
			];
			return `<div style="display:flex;flex-direction:column;align-items:center;">
							<svg width="${heights[idx]}" height="${heights[idx]}" viewBox="0 0 40 40" fill="none" style="margin-bottom:0.2rem;background:${colors[idx]};border-radius:50%;box-shadow:0 2px 12px #b6a6ca;">
								<circle cx="20" cy="20" r="18" fill="#fff" stroke="#818cf8" stroke-width="2"/>
								<text x="20" y="27" text-anchor="middle" font-size="1.3rem" fill="#818cf8" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${initial}</text>
							</svg>
							<strong style="color:#818cf8;font-size:1.08rem;text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${member.members}</strong>
							<span style="color:#a5b4fc;font-size:0.98rem;text-shadow:0 2px 8px #2c2254,0 1px 4px #818cf8;">${t.winRate}: ${(member.win_rate ?? 0).toFixed(2)}%</span>
							<span style="font-size:0.88rem;">${medalSvg[idx]}</span>
						</div>`;
		}).join('')}
			</div>
		` : '';

		const memberStatsHtml = allMembers.map((member: any) => {
			const initial = member.members[0] ? member.members[0].toUpperCase() : 'U';
			const hasStats = member.victories || member.defeats || member.tournaments_won || member.win_rate;
			return `
				<li style="background: linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);border-radius: 1rem; margin-bottom: 1.2rem; padding: 1.2rem 1rem;box-shadow: 0 2px 12px 0 #a5b4fc, 0 1px 4px 0 rgba(120,94,196,0.04);display: flex; flex-direction: column; align-items: center;position:relative;">
					<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:0.4rem;">
						<defs>
							<radialGradient id="memberGlow${initial}" cx="20" cy="20" r="18" gradientUnits="userSpaceOnUse">
								<stop stop-color="#818cf8"/>
								<stop offset="1" stop-color="#fbcfe8"/>
							</radialGradient>
						</defs>
						<circle cx="20" cy="20" r="18" fill="url(#memberGlow${initial})" stroke="#818cf8" stroke-width="2"/>
						<text x="20" y="27" text-anchor="middle" font-size="1.3rem" fill="#fff" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${initial}</text>
					</svg>
					<strong style="color:#818cf8;font-size:1.18rem;margin-bottom:0.4rem;text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${member.members}</strong>
					${hasStats ? `
					<div style="display:flex;align-items:center;gap:0.7rem;color:#818cf8;margin-bottom:0.2rem;">
						<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="vertical-align:middle;"><circle cx="11" cy="11" r="10" fill="#fbcfe8" opacity="0.7" stroke="#818cf8" stroke-width="2"/><text x="11" y="16" text-anchor="middle" font-size="13" fill="#818cf8" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">W</text></svg>
						<span style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${t.wins}: <span style="font-weight:600;">${member.victories}</span></span>
					</div>
					<div style="display:flex;align-items:center;gap:0.7rem;color:#818cf8;margin-bottom:0.2rem;">
						<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="vertical-align:middle;"><circle cx="11" cy="11" r="10" fill="#c7d2fe" opacity="0.7" stroke="#818cf8" stroke-width="2"/><text x="11" y="16" text-anchor="middle" font-size="13" fill="#818cf8" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">L</text></svg>
						<span style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${t.losses}: <span style="font-weight:600;">${member.defeats}</span></span>
					</div>
						<div style="display:flex;align-items:center;gap:0.7rem;color:#818cf8;margin-bottom:0.2rem;">
							<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="vertical-align:middle;"><circle cx="11" cy="11" r="10" fill="#f7b267" opacity="0.7" stroke="#818cf8" stroke-width="2"/><text x="11" y="16" text-anchor="middle" font-size="13" fill="#818cf8" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">T</text></svg>
							<span style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${t.tournamentsWon}: <span style="font-weight:600;">${member.tournaments_won}</span></span>
						</div>
						<div style="display:flex;align-items:center;gap:0.7rem;color:#818cf8;margin-bottom:0.2rem;">
							<svg width="22" height="22" viewBox="0 0 22 22" fill="none" style="vertical-align:middle;"><circle cx="11" cy="11" r="10" fill="#818cf8" opacity="0.7" stroke="#818cf8" stroke-width="2"/><text x="11" y="16" text-anchor="middle" font-size="13" fill="#fff" font-family="Inter, Arial, sans-serif" style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">%</text></svg>
							<span style="text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;">${t.winRate}: <span style="font-weight:600;">${(member.win_rate ?? 0).toFixed(2)}%</span></span>
						</div>
					` : `<div style='color:#64748b;font-size:1rem;text-shadow:0 2px 8px #818cf8,0 1px 4px #fffbe6;'>No stats yet</div>`}
				</li>
			`;
		}).join('');

		content.innerHTML = `
			${podiumHtml}
			<p class="italic mb-2" style="color:#818cf8;font-size:1.18rem;letter-spacing:0.02em;text-shadow:0 2px 8px #b6a6ca;">
				${t.averageWinRate}: <span class="font-semibold" style="color:#22c55e;">${avgWinRate.toFixed(2)}%</span>
			</p>
			<ul class="team-list" style="list-style:none;padding:0;margin:0;">${memberStatsHtml}</ul>
		`;
	}

	card.appendChild(content);
	return card;
}

function formatTeamName(name: string): string {
	return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchTeamStats(teamKey: string) {
	try {
		const response = await fetch(`/api/teams/${teamKey}`);
		if (!response.ok)
			throw new Error(t.failedToLoadTeamStats);
		const members = await response.json();
		console.log(`Fetched members for ${teamKey}:`, members);
		members.sort((a: any, b: any) => b.win_rate - a.win_rate);
		return members;
	} catch (err) {
		console.error(`Error loading team stats for ${teamKey}:`, err);
		return null;
	}
}
