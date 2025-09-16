// Add hover effect styles for Back to Profile button (matching renderPlayerSelection)
if (!document.getElementById('gris-friend-hover-styles')) {
	const hoverStyle = document.createElement('style');
	hoverStyle.id = 'gris-friend-hover-styles';
	hoverStyle.textContent = `
			#back-to-profile {
				transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.25s;
			}
			#back-to-profile:hover {
				background: linear-gradient(90deg,#818cf8 0%,#b6a6ca 100%);
				color: #fff;
				box-shadow: 0 12px 40px rgba(44,34,84,0.22);
				border-color: #818cf8;
				transform: translateY(-3px) scale(1.04);
				filter: drop-shadow(0 0 12px #b6a6ca);
			}
			#back-to-profile svg {
				transition: stroke 0.25s;
			}
			#back-to-profile:hover svg {
				stroke: #fff;
				filter: drop-shadow(0 0 8px #fff);
			}
		`;
	document.head.appendChild(hoverStyle);
}
// Add hover effect styles for Back to Profile button
if (!document.getElementById('gris-friend-hover-styles')) {
	const hoverStyle = document.createElement('style');
	hoverStyle.id = 'gris-friend-hover-styles';
	hoverStyle.textContent = `
			#back-to-profile {
				transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.25s;
			}
			#back-to-profile:hover {
				background: linear-gradient(90deg,#b6a6ca 0%,#e3e7f1 100%);
				color: #fff;
				box-shadow: 0 10px 32px rgba(44,34,84,0.18);
				border-color: #b6a6ca;
				transform: translateY(-2px) scale(1.03);
			}
			#back-to-profile svg {
				transition: stroke 0.25s;
			}
			#back-to-profile:hover svg {
				stroke: #fff;
			}
		`;
	document.head.appendChild(hoverStyle);
}
// Add hover effect styles for Back to Profile button
if (!document.getElementById('gris-friend-hover-styles')) {
	const hoverStyle = document.createElement('style');
	hoverStyle.id = 'gris-friend-hover-styles';
	hoverStyle.textContent = `
			#back-to-profile {
				transition: background 0.25s, color 0.25s, box-shadow 0.25s;
			}
			#back-to-profile:hover {
				background: linear-gradient(90deg,#b6a6ca 0%,#e3e7f1 100%);
				color: #fff;
				box-shadow: 0 10px 32px rgba(44,34,84,0.18);
				border-color: #b6a6ca;
				transform: translateY(-2px) scale(1.03);
			}
			#back-to-profile svg {
				transition: stroke 0.25s;
			}
			#back-to-profile:hover svg {
				stroke: #fff;
			}
		`;
	document.head.appendChild(hoverStyle);
}
import { updateFriendRequestsBadge } from '../index.js';
import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage') : 'en') as keyof typeof translations;
const t = translations[lang];

// Team logo mapping (copied from templates.ts)
const TEAM_LOGOS = {
	'HACKTIVISTS': '/hacktivists.png',
	'BUG BUSTERS': '/bugbusters.png',
	'LOGIC LEAGUE': '/logicleague.png',
	'CODE ALLIANCE': '/codealliance.png'
};

// SVG ICON HELPERS (local, for requests page)
function svgInboxIcon() {
	return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b6a6ca" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>`;
}

function svgBackIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
}
function svgAcceptIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

function svgRejectIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`;
}

export async function renderFriendRequestsPage(container: HTMLElement) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = `<p>${t.pleaseLoginToViewRequests}</p>`;
		return;
	}

	container.innerHTML = `
		<div class="friend-bg" style="position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;z-index:0;background:url('/Background4.jpg') center center / cover no-repeat fixed;">
			<div class="magic-gradient"></div>
			<canvas id="magic-sparkles" style="position:absolute;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;"></canvas>
			<div class="cloud cloud1"></div>
			<div class="cloud cloud2"></div>
			<div class="cloud cloud3"></div>
			<div class="cloud cloud4"></div>
			<div class="cloud cloud5"></div>
			<div class="cloud cloud6"></div>
			<div class="cloud cloud7"></div>
			<div class="cloud cloud8"></div>
			<div class="cloud cloud9"></div>
			<div class="cloud cloud10"></div>
		</div>
		<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;animation:fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;">
			<h2 style="font-size:3.2rem;font-weight:700;color:#fff;margin-bottom:2.8rem;letter-spacing:0.04em;text-shadow:0 6px 32px rgba(44,34,84,0.22);font-family:'Inter','EB Garamond',serif;display:flex;align-items:center;gap:12px;">
				<span style="display:inline-block;vertical-align:middle;">${svgInboxIcon()}</span>
				<span>${t.friendRequestsTitle}</span>
			</h2>
			<div class="friend-panel" style="position:relative;background:linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);border-radius:2.8rem;box-shadow:0 0 32px 8px #d6d8e8,0 16px 64px 0 rgba(44,34,84,0.08),0 2px 16px 0 rgba(44,34,84,0.04);padding:2.2rem 1.6rem;max-width:540px;width:100%;backdrop-filter:blur(22px);margin-bottom:2.8rem;border:1.5px solid rgba(182,166,202,0.22);overflow:hidden;">
				<div class="panel-sparkle" style="pointer-events:none;position:absolute;inset:0;z-index:0;"></div>
				<h3 style="font-size:1.4rem;font-weight:600;color:#b6a6ca;margin-bottom:1.2rem;letter-spacing:0.02em;font-family:'Inter','EB Garamond',serif;display:flex;align-items:center;gap:8px;">
					<span style="display:inline-block;vertical-align:middle;">${svgInboxIcon()}</span>
					<span>${t.pendingRequests}</span>
				</h3>
				<div id="pending-list">
					<p>${t.loading}</p>
				</div>
			</div>
			<button id="back-to-profile" style="width:100%;max-width:540px;background:linear-gradient(90deg,#d6d8e8 0%,#f8fafc 100%);border:1.5px solid #6b7280;color:#6b7280;font-weight:600;padding:1.1rem;border-radius:1.1rem;font-size:1.08rem;box-shadow:0 6px 24px rgba(44,34,84,0.08);transition:background 0.2s,color 0.2s,box-shadow 0.2s;cursor:pointer;font-family:'Inter','EB Garamond',serif;display:flex;align-items:center;gap:8px;justify-content:center;">
				${svgBackIcon()} <span>${t.backToProfile}</span>
			</button>
			<div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:linear-gradient(90deg,#b6a6ca 0%,#e3e7f1 100%);color:#23272f;padding:15px 22px;border-radius:1.2rem;box-shadow:0 2px 18px rgba(44,34,84,0.18);z-index:1000;font-family:'Inter','EB Garamond',serif;font-size:1.08rem;font-weight:600;letter-spacing:0.01em;animation:fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;"></div>
		</div>
	`;

	// Inject cloud shapes, gradient overlay, sparkles, and new styles for magic
	const cloudStyles = document.createElement('style');
	cloudStyles.id = 'gris-friend-styles';
	cloudStyles.textContent = `
		.magic-gradient { position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 60% 30%,rgba(236,233,244,0.13) 0%,rgba(182,166,202,0.09) 40%,rgba(44,34,84,0.04) 100%);mix-blend-mode:screen;animation:magicGradientMove 12s ease-in-out infinite alternate; }
		@keyframes magicGradientMove { 0%{background-position:60% 30%;} 100%{background-position:40% 70%;} }
		.cloud { position: absolute; border-radius: 50%; filter: blur(18px); opacity: 0.85; z-index: 10; pointer-events: none; animation: floatCloud 22s ease-in-out infinite alternate; }
		.cloud1 { width: 260px; height: 100px; left: 7vw; top: 9vh; animation-delay: 0s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
		.cloud2 { width: 360px; height: 140px; right: 9vw; top: 21vh; animation-delay: 2s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		.cloud3 { width: 220px; height: 80px; left: 54vw; bottom: 13vh; animation-delay: 4s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
		.cloud4 { width: 180px; height: 60px; right: 18vw; bottom: 7vh; animation-delay: 6s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
		.cloud5 { width: 120px; height: 40px; left: 22vw; top: 33vh; animation-delay: 8s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		.cloud6 { width: 90px; height: 30px; right: 28vw; bottom: 23vh; animation-delay: 10s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
		.cloud7 { width: 180px; height: 60px; left: 12vw; bottom: 18vh; animation-delay: 12s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		.cloud8 { width: 140px; height: 50px; right: 32vw; top: 12vh; animation-delay: 14s; background: linear-gradient(90deg, #e3e7f1 0%, #c7cbe6 100%); }
		.cloud9 { width: 100px; height: 40px; left: 38vw; top: 44vh; animation-delay: 16s; background: linear-gradient(90deg, #e3e7f1 0%, #d6d8e8 100%); }
		.cloud10 { width: 70px; height: 30px; right: 44vw; bottom: 32vh; animation-delay: 18s; background: linear-gradient(90deg, #e3e7f1 0%, #bfc6e0 100%); }
		@keyframes floatCloud {
			0% { transform: translateY(0) scale(1); }
			20% { transform: translateY(-18px) scale(1.04); }
			50% { transform: translateY(0) scale(1); }
			80% { transform: translateY(12px) scale(0.98); }
			100% { transform: translateY(0) scale(1); }
		}
		.panel-sparkle {
			background: url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="30" r="2.5" fill="%23b6a6ca" opacity="0.18"/><circle cx="80" cy="60" r="1.8" fill="%23e3e7f1" opacity="0.14"/><circle cx="120" cy="90" r="2.2" fill="%23bfc6e0" opacity="0.16"/><circle cx="200" cy="40" r="1.2" fill="%23fff" opacity="0.12"/><circle cx="300" cy="120" r="2.8" fill="%23b6a6ca" opacity="0.18"/></svg>');
			animation: sparklePanel 2.8s linear infinite alternate;
		}
		@keyframes sparklePanel {
			0% { opacity: 0.7; filter: blur(0px); }
			100% { opacity: 1; filter: blur(2px); }
		}
		@keyframes fadeInPanel {
			from { opacity: 0; transform: translateY(32px) scale(0.98); }
			to { opacity: 1; transform: translateY(0) scale(1); }
		}
		.friend-panel {
			transition: box-shadow 0.3s, background 0.3s;
		}
		.friend-panel:hover {
			background: rgba(255,255,255,0.78);
			box-shadow: 0 0 48px 16px #a5b4fc, 0 24px 80px 0 rgba(44,34,84,0.28), 0 2px 24px 0 rgba(44,34,84,0.18);
		}
		.friend-panel label {
			display: block;
			color: #2c2254;
			font-weight: 700;
			font-size: 1.4rem;
			margin-bottom: 1.4rem;
			transition: color 0.2s;
		}
		.friend-panel label:hover {
			color: #4338ca;
		}
		.friend-panel select {
			width: 100%;
			padding: 1.4rem;
			border: 2px solid #a5b4fc;
			border-radius: 1.4rem;
			background: rgba(255,255,255,0.92);
			color: #2c2254;
			font-weight: 700;
			font-size: 1.18rem;
			box-shadow: 0 2px 14px rgba(44,34,84,0.12);
			margin-top: 0.5rem;
			transition: border-color 0.2s, background 0.2s;
		}
		.friend-panel select:hover, .friend-panel select:focus {
			border-color: #4338ca;
			background: rgba(255,255,255,0.98);
		}
		.friend-panel button, .accept-btn, .reject-btn {
			width: auto;
			background: linear-gradient(90deg,#a5b4fc 0%,#f8fafc 100%);
			border: 2px solid #2c2254;
			color: #2c2254;
			font-weight: 700;
			padding: 1.4rem;
			border-radius: 1.4rem;
			font-size: 1.18rem;
			box-shadow: 0 8px 32px rgba(44,34,84,0.14);
			transition: background 0.2s, color 0.2s, box-shadow 0.2s;
			cursor: pointer;
		}
		.friend-panel button:hover, .accept-btn:hover, .reject-btn:hover {
			background: linear-gradient(90deg,#818cf8 0%,#f8fafc 100%);
			color: #fff;
			box-shadow: 0 12px 40px rgba(44,34,84,0.22);
		}
	`;
	document.head.appendChild(cloudStyles);

	// Sparkle and star animation (canvas)
	setTimeout(() => {
		const canvas = document.getElementById('magic-sparkles') as HTMLCanvasElement;
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.willChange = 'transform';
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Sparkles (reduced for performance)
		const sparkles = Array.from({ length: 18 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 1.5 + Math.random() * 2.5,
			dx: (Math.random() - 0.5) * 0.4,
			dy: (Math.random() - 0.5) * 0.4,
			alpha: 0.7 + Math.random() * 0.3,
			color: `rgba(${200 + Math.floor(Math.random() * 55)},${180 + Math.floor(Math.random() * 55)},255,`
		}));

		// Stars (reduced for performance)
		const stars = Array.from({ length: 24 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 0.7 + Math.random() * 1.6,
			baseAlpha: 0.5 + Math.random() * 0.5,
			twinkleSpeed: 0.008 + Math.random() * 0.012,
			twinklePhase: Math.random() * Math.PI * 2,
			color: `rgba(255,255,255,`
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

	document.getElementById('back-to-profile')!.addEventListener('click', async () => {
		const { renderProfilePage } = await import('./renderProfilePage.js');
		await renderProfilePage(container);
	});

	loadPendingRequests(token);
}

async function loadPendingRequests(token: string) {
	try {
		const response = await fetch('/api/friends/pending', {
			headers: { 'Authorization': `Bearer ${token}` }
		});

		if (response.ok) {
			const data = await response.json();
			const pendingRequests = data.pending || [];

			if (pendingRequests.length > 0) {
				document.getElementById('pending-list')!.innerHTML = `
					<div style="display: flex; flex-direction: column; gap: 18px;">
						${pendingRequests.map((request: any, i: number) => `
							<div class="pending-request" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-radius: 2.2rem; background: linear-gradient(90deg, #e3e7f1 0%, #f8fafc 100%); box-shadow: 0 4px 24px 0 rgba(44,34,84,0.10); opacity:0; animation: fadeInCard 0.7s ${0.2 + i * 0.12}s cubic-bezier(.6,.2,.3,1) forwards;">
								<div style="display:flex;flex-direction:column;gap:2px;">
									<strong style="font-size:1.18rem;color:#2c2254;font-family:'Inter','EB Garamond',serif;font-weight:700;">${request.display_name || request.name}</strong>
									<span style="font-size:0.98rem;color:#b6a6ca;">@${request.username}</span>
									<span style="font-size:0.92rem;color:#b6a6ca;">${t.team}: ${request.team}</span>
									<span style="font-size:0.92rem;color:#b6a6ca;">${t.sent}: ${new Date(request.created_at).toLocaleDateString()}</span>
								</div>
								<div style="display: flex; gap: 10px;">
									<button class="accept-btn" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}"
										style="background:linear-gradient(90deg,#a5b4fc 0%,#f8fafc 100%);border:2px solid #2c2254;color:#2c2254;font-weight:700;padding:1.4rem;border-radius:1.4rem;font-size:1.18rem;box-shadow:0 8px 32px rgba(44,34,84,0.14);transition:background 0.2s,color 0.2s,box-shadow 0.2s;cursor:pointer;display:flex;align-items:center;gap:6px;"
										title="${t.acceptFriendRequest}">
										${svgAcceptIcon()} <span>${t.accept}</span>
									</button>
									<button class="reject-btn" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}"
										style="background:linear-gradient(90deg,#a5b4fc 0%,#f8fafc 100%);border:2px solid #2c2254;color:#2c2254;font-weight:700;padding:1.4rem;border-radius:1.4rem;font-size:1.18rem;box-shadow:0 8px 32px rgba(44,34,84,0.14);transition:background 0.2s,color 0.2s,box-shadow 0.2s;cursor:pointer;display:flex;align-items:center;gap:6px;"
										title="${t.rejectFriendRequest}">
										${svgRejectIcon()} <span>${t.reject}</span>
									</button>
								</div>
							</div>
						`).join('')}
					</div>
				`;
				// Add dreamy card fade-in animation
				const dreamyCardStyles = document.createElement('style');
				dreamyCardStyles.textContent = `
					@keyframes fadeInCard {
						from { opacity: 0; transform: translateY(24px) scale(0.98); }
						to { opacity: 1; transform: translateY(0) scale(1); }
					}
				`;
				document.head.appendChild(dreamyCardStyles);

				setupPendingRequestButtons(token);
			} else {
				document.getElementById('pending-list')!.innerHTML = `<p style="color:#2c2254;font-size:1.18rem;font-weight:600;">${t.noPendingRequests}</p>`;
			}
		} else {
			document.getElementById('pending-list')!.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;">${t.failedToLoadRequests}</p>`;
		}
	} catch (error) {
		document.getElementById('pending-list')!.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;">${t.networkError}</p>`;
	}
}

function setupPendingRequestButtons(token: string) {
	document.querySelectorAll('.accept-btn').forEach(btn => {
		btn.addEventListener('click', async () => {
			const friendId = parseInt(btn.getAttribute('data-friend-id')!);
			const friendName = btn.getAttribute('data-friend-name')!;

			try {
				const response = await fetch('/api/friends/accept', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ friendId })
				});

				if (response.ok) {
					showNotification(`${friendName} ${t.friendAdded}`, 'success');
					loadPendingRequests(token);
					updateFriendRequestsBadge();
				} else {
					const result = await response.json();
					showNotification(result.error || t.failedToAcceptRequest, 'error');
				}
			} catch (error) {
				showNotification(t.networkError, 'error');
			}
		});
	});

	document.querySelectorAll('.reject-btn').forEach(btn => {
		btn.addEventListener('click', async () => {
			const friendId = parseInt(btn.getAttribute('data-friend-id')!);
			const friendName = btn.getAttribute('data-friend-name')!;

			const confirmed = confirm(`${t.confirmRejectRequest} ${friendName}?`);
			if (!confirmed) return;

			try {
				const response = await fetch('/api/friends/reject', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ friendId })
				});

				if (response.ok) {
					showNotification(`${t.requestFrom} ${friendName} ${t.requestRejected}`, 'success');
					loadPendingRequests(token);
					updateFriendRequestsBadge();
				} else {
					const result = await response.json();
					showNotification(result.error || t.failedToRejectRequest, 'error');
				}
			} catch (error) {
				showNotification(t.networkError, 'error');
			}
		});
	});
}

function showNotification(message: string, type: 'success' | 'error') {
	const notification = document.getElementById('notification') as HTMLDivElement;
	notification.textContent = message;
	notification.style.background = type === 'success'
		? 'linear-gradient(90deg,#a5b4fc 0%,#f8fafc 100%)'
		: 'linear-gradient(90deg,#ff5c5c 0%,#f8fafc 100%)';
	notification.style.color = type === 'success' ? '#2c2254' : '#fff';
	notification.style.display = 'block';

	setTimeout(() => {
		notification.style.display = 'none';
	}, 3000);
}
