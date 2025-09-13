import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export async function renderTeamStats(container: HTMLElement, team: string) {
	try {
		const response = await fetch(`/api/teams/${team}`);
		if (!response.ok)
			throw new Error(t.failedToLoadTeamStats);

		const members = await response.json();

		// Inject dreamy clouds, gradient overlay, and magical styles
		if (!document.getElementById('teamstats-dreamy-styles')) {
			const style = document.createElement('style');
			style.id = 'teamstats-dreamy-styles';
			style.textContent = `
                .teamstats-bg { position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;z-index:0;background:transparent; }
                .teamstats-gradient { position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 60% 30%,rgba(236,233,244,0.13) 0%,rgba(182,166,202,0.09) 40%,rgba(44,34,84,0.04) 100%);mix-blend-mode:screen;animation:magicGradientMove 12s ease-in-out infinite alternate; }
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
                .teamstats-panel {
                    background:linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);
                    border-radius:2.8rem;
                    box-shadow:0 0 32px 8px #d6d8e8,0 16px 64px 0 rgba(44,34,84,0.08),0 2px 16px 0 rgba(44,34,84,0.04);
                    padding:2.2rem 1.6rem;
                    max-width:640px;
                    width:100%;
                    backdrop-filter:blur(22px);
                    border:1.5px solid rgba(182,166,202,0.22);
                    overflow:hidden;
                    margin:auto;
                    transition: box-shadow 0.3s, background 0.3s;
                    animation: fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;
                }
                .teamstats-panel:hover {
                    background: rgba(255,255,255,0.78);
                    box-shadow: 0 0 48px 16px #a5b4fc, 0 24px 80px 0 rgba(44,34,84,0.28), 0 2px 24px 0 rgba(44,34,84,0.18);
                }
                .teamstats-title {
                    font-size:2.2rem;font-weight:700;color:#2c2254;margin-bottom:1.2rem;letter-spacing:0.04em;text-shadow:0 4px 16px rgba(44,34,84,0.12);font-family:'Inter','EB Garamond',serif;
                }
                .teamstats-content {
                    font-size:1.18rem;color:#2c2254;text-align:center;
                }
                .teamstats-list {
                    font-size:1.08rem;color:#2c2254;text-align:left;max-height:180px;overflow-y:auto;margin-top:1.2rem;
                }
                .teamstats-list li {
                    border-bottom:1px solid #d6d8e8;padding-bottom:0.8rem;margin-bottom:0.8rem;
                }
            `;
			document.head.appendChild(style);
		}

		if (members.length === 0) {
			container.innerHTML = `
                <div class="teamstats-bg">
                    <div class="teamstats-gradient"></div>
                    <div class="cloud cloud1"></div>
                    <div class="cloud cloud2"></div>
                    <div class="cloud cloud3"></div>
                    <div class="cloud cloud4"></div>
                    <div class="cloud cloud5"></div>
                    <div class="cloud cloud6"></div>
                </div>
                <div class="teamstats-panel" style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
                    <h2 class="teamstats-title">${formatTeamName(team)} ${t.stats}</h2>
                    <div class="teamstats-content"><p>${t.noMembersFound} ${formatTeamName(team)}</p></div>
                </div>
            `;
			return;
		}

		members.sort((a: any, b: any) => b.win_rate - a.win_rate);
		const avgWinRate = members.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / members.length;

		container.innerHTML = `
            <div class="teamstats-bg">
                <div class="teamstats-gradient"></div>
                <div class="cloud cloud1"></div>
                <div class="cloud cloud2"></div>
                <div class="cloud cloud3"></div>
                <div class="cloud cloud4"></div>
                <div class="cloud cloud5"></div>
                <div class="cloud cloud6"></div>
            </div>
            <div class="teamstats-panel" style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
                <h2 class="teamstats-title">${formatTeamName(team)} ${t.stats}</h2>
                <div class="teamstats-content"><p><em>${t.averageWinRate}: ${avgWinRate.toFixed(2)}%</em></p></div>
                <ul class="teamstats-list">
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
            </div>
        `;
	} catch (err) {
		container.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">${t.errorLoadingTeamStats}: ${(err as Error).message}</p>`;
	}
}

function formatTeamName(name: string): string {
	return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
