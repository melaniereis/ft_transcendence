import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderSettingsPage(container: HTMLElement) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = `<p style="color:#e11d48;font-size:1.18rem;font-weight:600;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">${t.loginRequired}</p>`;
		return;
	}

	container.innerHTML = `
		<div class="settings-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;z-index:0;background:transparent;pointer-events:none;">
			<div class="magic-gradient"></div>
			<canvas id="magic-sparkles" style="position:absolute;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;"></canvas>
			<div class="cloud cloud1"></div>
			<div class="cloud cloud2"></div>
			<div class="cloud cloud3"></div>
			<div class="cloud cloud4"></div>
			<div class="cloud cloud5"></div>
			<div class="cloud cloud6"></div>
		</div>
		<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - 96px);width:100vw;padding-top:96px;animation:fadeInPanel 1.2s cubic-bezier(.6,.2,.3,1) forwards;">
			<h2 style="font-size:3.2rem;font-weight:700;color:#fff;margin-bottom:2.8rem;letter-spacing:0.04em;text-shadow:0 6px 32px rgba(44,34,84,0.22);font-family:'Inter','EB Garamond',serif;">${t.playerSettings}</h2>
			<div class="settings-panel" style="background:linear-gradient(120deg,rgba(236,233,244,0.22) 0%,rgba(182,166,202,0.18) 100%);border-radius:2.8rem;box-shadow:0 0 32px 8px #d6d8e8,0 16px 64px 0 rgba(44,34,84,0.08),0 2px 16px 0 rgba(44,34,84,0.04);padding:2.2rem 1.6rem;max-width:480px;width:100%;backdrop-filter:blur(22px);border:1.5px solid rgba(182,166,202,0.22);overflow:hidden;">
				<div class="panel-sparkle" style="pointer-events:none;position:absolute;inset:0;z-index:0;"></div>
				<button id="delete-user" class="delete-btn" style="width:100%;background:linear-gradient(90deg,#ff5c5c 0%,#f8fafc 100%);border:2px solid #2c2254;color:#2c2254;font-weight:700;padding:1.4rem;border-radius:1.4rem;font-size:1.18rem;box-shadow:0 8px 32px rgba(44,34,84,0.14);transition:background 0.2s,color 0.2s,box-shadow 0.2s;cursor:pointer;margin-bottom:1.4rem;">${t.deleteUserBtn}</button>
				<div id="confirmation" class="hidden flex flex-col items-center" style="animation:fadeInCard 0.7s cubic-bezier(.6,.2,.3,1) forwards;">
					<p style="color:#2c2254;font-size:1.18rem;font-weight:600;margin-bottom:1.4rem;">${t.confirmDeleteUser}</p>
					<button id="confirm-delete" style="width:100%;background:linear-gradient(90deg,#e11d48 0%,#f8fafc 100%);border:2px solid #2c2254;color:#2c2254;font-weight:700;padding:1.4rem;border-radius:1.4rem;font-size:1.18rem;box-shadow:0 8px 32px rgba(44,34,84,0.14);transition:background 0.2s,color 0.2s,box-shadow 0.2s;cursor:pointer;">${t.confirmDeleteBtn}</button>
				</div>
				<div id="result" class="result mt-4 text-center" style="color:#e11d48;font-size:1.18rem;font-weight:600;"></div>
			</div>
		</div>
	`;

	// Inject cloud shapes, gradient overlay, sparkles, and new styles
	const cloudStyles = document.createElement('style');
	cloudStyles.id = 'settings-styles';
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
        @keyframes fadeInCard {
            from { opacity: 0; transform: translateY(24px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .settings-panel {
            transition: box-shadow 0.3s, background 0.3s;
        }
        .settings-panel:hover {
            background: rgba(255,255,255,0.78);
            box-shadow: 0 0 48px 16px #a5b4fc, 0 24px 80px 0 rgba(44,34,84,0.28), 0 2px 24px 0 rgba(44,34,84,0.18);
        }
        .delete-btn:hover, #confirm-delete:hover {
            background: linear-gradient(90deg,#818cf8 0%,#f8fafc 100%);
            color: #fff;
            box-shadow: 0 12px 40px rgba(44,34,84,0.22);
        }
        .result {
            color: #2c2254 !important;
        }
        .result.error {
            color: #e11d48 !important;
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

	const result = document.getElementById('result') as HTMLDivElement;
	const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;
	const confirmationBox = document.getElementById('confirmation') as HTMLDivElement;
	const confirmDeleteBtn = document.getElementById('confirm-delete') as HTMLButtonElement;

	deleteBtn.addEventListener('click', () => {
		confirmationBox.classList.remove('hidden');
	});

	confirmDeleteBtn.addEventListener('click', async () => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			result.classList.add('error');
			result.innerText = t.notLoggedIn;
			return;
		}

		try {
			const response = await fetch('/users/me', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error(t.failedToFetchUser);

			const user = await response.json();
			if (!user || !user.id) {
				throw new Error(t.userNotFound);
			}

			const deleteResponse = await fetch(`/users/${user.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!deleteResponse.ok) throw new Error(t.failedToDeleteUser);

			result.innerText = `🗑️ ${t.userDeleted} "${user.username}"`;
			localStorage.removeItem('authToken');
			setTimeout(() => {
				container.innerHTML = `<p style="color:#2c2254;font-size:1.18rem;font-weight:600;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;">${t.loggedOutMessage}</p>`;
			}, 2000);
		} catch (err) {
			result.classList.add('error');
			result.innerText = `${(err as Error).message}`;
		}
	});
}
