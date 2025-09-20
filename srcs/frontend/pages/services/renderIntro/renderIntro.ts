// srcs/frontend/pages/services/renderIntro/renderIntro.ts - Responsive Gris-inspired intro screen with improved positioning

import { translations } from '../language/translations.js';
import { initializeCelestialAnimations } from './CelestialAnimations.js';
import { applyLanguage } from '../../index.js';

export function renderIntroScreen(container: HTMLElement, onNavigate: (route: string) => void): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
        <style>
            /* Base intro wrapper */
            #intro-wrapper {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                min-width: 100vw;
                min-height: 100vh;
                background: url('/Background5.png') center center / cover no-repeat;
                overflow: hidden;
                z-index: 1;
            }

            /* Celestial canvases - keep them at base z-index */
            #backgroundCanvas, #milkyWayCanvas, #starsCanvas, #orbsCanvas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
            }
            #backgroundCanvas { z-index: 1001; }
            #milkyWayCanvas { z-index: 1001; }
            #starsCanvas { z-index: 1101; }
            #orbsCanvas { z-index: 1001; }

            /* Enhanced SVG with proper responsive scaling */
            #intro-svg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1001;
                pointer-events: none;
                filter: drop-shadow(0 0 15px rgba(232, 213, 255, 0.8))
                        drop-shadow(0 0 30px rgba(232, 213, 255, 0.5))
                        drop-shadow(0 0 45px rgba(232, 213, 255, 0.3));
                min-width: 100vw;
                min-height: 100vh;
            }

            /* Orbital rings with improved responsiveness */
            .orbital-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 21;
                pointer-events: none;
            }

            .orbital-ring {
                position: absolute;
                border: 1px solid rgba(232, 213, 255, 0.2);
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .orbital-ring.ring1 {
                width: min(300px, 20vw);
                height: min(300px, 20vw);
                animation: rotate-slow 20s linear infinite;
            }

            .orbital-ring.ring2 {
                width: min(450px, 30vw);
                height: min(450px, 30vw);
                animation: rotate-slow 30s linear infinite reverse;
            }

            .orbital-ring.ring3 {
                width: min(600px, 40vw);
                height: min(600px, 40vw);
                animation: rotate-slow 40s linear infinite;
            }

            .orbital-ring.ring4 {
                width: min(750px, 50vw);
                height: min(750px, 50vw);
                animation: rotate-slow 60s linear infinite;
            }

            .orbital-ring.ring5 {
                width: min(900px, 60vw);
                height: min(900px, 60vw);
                animation: rotate-slow 80s linear infinite reverse;
            }

            .orbit-dot {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #e8d5ff;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(232, 213, 255, 0.8);
            }

            /* IMPROVED DIAMOND LAYOUT - Using CSS Grid for perfect positioning */
            #diamond-layout {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr 1fr;
                gap: 0;
                z-index: 1002;
                pointer-events: auto;
            }

            /* Title positioned in center */
            #intro-title {
                grid-column: 2;
                grid-row: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: clamp(2.2rem, 6vw, 3.2rem);
                font-weight: 400;
                color: #e8d5ff;
                text-shadow:
                    0 0 20px rgba(232, 213, 255, 0.3),
                    0 4px 32px #2d1b4e,
                    0 2px 12px #2d1b4e;
                letter-spacing: 0.3em;
                margin: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                pointer-events: none;
                z-index: 2000;
            }

            .play-container {
                position: relative;
                grid-column: 2;
                grid-row: 3;
                align-self: start;
                justify-self: center;
                margin-top: 2rem;
            }

            /* Slight adjustment for dropdown positioning */
            #play-options {
                top: 100%;
                margin-top: 0.5rem;
            }

            #play-options {
                display: none; /* shown via JS */
                position: absolute;
                top: 100%;     /* just below Play button */
                left: 50%;
                transform: translateX(-50%);
                background: rgba(44, 34, 84, 0.9);
                border-radius: 0.5rem;
                box-shadow: 0 0 12px rgba(108, 79, 163, 0.7);
                padding: 0.5rem 0;
                z-index: 50;
                min-width: 160px;
                margin-top: 0.5rem; /* minor vertical spacing */
            }

            #play-options button {
                width: 100%;
                margin: 0.25rem 0;
                border-radius: 0.5rem;
                background: rgba(44, 34, 84, 0.1);
                color: #e8d5ff;
                cursor: pointer;
                text-transform: uppercase;
                font-weight: 400;
                transition: background 0.2s ease;
            }

            #play-options button:hover {
                background: #6c4fa3;
                color: #fff;
            }

            /* Diamond button base style */
            .diamond-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: clamp(140px, 18vw, 220px);
                height: clamp(40px, 5vw, 56px);
                background: rgba(44,34,84,0.10);
                border: none;
                color: #e8d5ff;
                font-size: clamp(0.9rem, 2vw, 1.15rem);
                font-weight: 400;
                border-radius: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 16px rgba(44, 34, 84, 0.10), 0 1px 4px rgba(44, 34, 84, 0.08);
                text-transform: uppercase;
                letter-spacing: 0.12em;
                text-align: center;
                outline: none;
                pointer-events: auto;
                margin: auto;
                opacity: 0.75;
            }

            .diamond-btn:hover {
                background: #6c4fa3;
                color: #fff;
                box-shadow: 0 6px 32px 0 rgba(108,79,163,0.45), 0 2px 8px rgba(44,34,84,0.18);
                opacity: 1;
                filter: brightness(1.08) drop-shadow(0 0 8px #6c4fa3);
                transform: scale(1.08) translateY(-2px);
            }

            .diamond-btn:active {
                background: linear-gradient(90deg, #2d1b4e 0%, #6c4fa3 100%);
                color: #e8d5ff;
                box-shadow: 0 2px 8px rgba(44, 34, 84, 0.18);
                transform: scale(1.0) translateY(0);
            }

            /* Perfect diamond positioning using CSS Grid */
            #intro-login {
                grid-column: 2;
                grid-row: 1;
                align-self: end;
                margin-bottom: 2rem;
            }

            #intro-register {
                grid-column: 3;
                grid-row: 2;
                align-self: center;
                justify-self: start;
                margin-left: 2rem;
            }

            #intro-quickplay {
                grid-column: 2;
                grid-row: 3;
                align-self: start;
                margin-top: 2rem;
            }
            #intro-quicktournament {
                grid-column: 2;
                grid-row: 4; /* one row below quickplay which is at row 3 */
                align-self: start;
                margin-top: 2rem;
            }

            .language-container {
                grid-column: 1;
                grid-row: 2;
                align-self: center;
                justify-self: end;
                margin-right: 2rem;
                position: relative;
            }

            /* Language dropdown styling */
            #intro-language-options {
                display: none;
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 0.5rem;
                background: rgba(45, 27, 78, 0.9);
                border: 1px solid rgba(232, 213, 255, 0.2);
                border-radius: 0.5rem;
                padding: 0.5rem;
                backdrop-filter: blur(10px);
                min-width: 140px;
                z-index: 50;
            }

            .language-option {
                display: block;
                width: 100%;
                padding: 0.5rem;
                background: none;
                border: none;
                color: #e8d5ff;
                cursor: pointer;
                text-align: left;
                border-radius: 0.25rem;
                transition: background 0.2s ease;
            }

            .language-option:hover {
                background: rgba(232, 213, 255, 0.1);
            }

            /* Responsive adjustments */
            @media (max-width: 1200px) {
                #intro-login { margin-bottom: 1.5rem; }
                #intro-register { margin-left: 1.5rem; }
                #intro-quickplay { margin-top: 1.5rem; }
                .language-container { margin-right: 1.5rem; }

                .orbital-ring.ring1 { width: min(250px, 25vw); height: min(250px, 25vw); }
                .orbital-ring.ring2 { width: min(350px, 35vw); height: min(350px, 35vw); }
                .orbital-ring.ring3 { width: min(450px, 45vw); height: min(450px, 45vw); }
            }

            @media (max-width: 900px) {
                #intro-login { margin-bottom: 1rem; }
                #intro-register { margin-left: 1rem; }
                #intro-quickplay { margin-top: 1rem; }
                .language-container { margin-right: 1rem; }

                .orbital-ring.ring1 { width: min(180px, 30vw); height: min(180px, 30vw); }
                .orbital-ring.ring2 { width: min(270px, 40vw); height: min(270px, 40vw); }
                .orbital-ring.ring3 { width: min(360px, 50vw); height: min(360px, 50vw); }
            }

            @media (max-width: 600px) {
                /* Stack buttons vertically on very small screens */
                #diamond-layout {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto auto auto auto auto;
                    gap: 1rem;
                    padding: 2rem;
                    box-sizing: border-box;
                }

                #intro-title {
                    grid-column: 1;
                    grid-row: 3;
                    font-size: clamp(1.5rem, 8vw, 2.2rem);
					z-index: 1200;
                }

                #intro-login {
                    grid-column: 1;
                    grid-row: 1;
                    margin: 0;
                    align-self: center;
                    justify-self: center;
                }

                #intro-register {
                    grid-column: 1;
                    grid-row: 2;
                    margin: 0;
                    align-self: center;
                    justify-self: center;
                }

                #intro-quickplay {
                    grid-column: 1;
                    grid-row: 4;
                    margin: 0;
                    align-self: center;
                    justify-self: center;
                }

                #intro-quicktournament {
                    grid-column: 1;
                    grid-row: 5;
                    align-self: start;
                    justify-self: start;
                    margin-top: 2rem;
                }

                .language-container {
                    grid-column: 1;
                    grid-row: 5;
                    margin: 0;
                    align-self: center;
                    justify-self: center;
                }

                .diamond-btn {
                    width: min(280px, 80vw);
                    height: 50px;
                }

                .orbital-ring.ring1 { width: 120px; height: 120px; }
                .orbital-ring.ring2 { width: 180px; height: 180px; }
                .orbital-ring.ring3 { width: 240px; height: 240px; }
            }

            /* Animation keyframes */
            @keyframes orbit {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes rotate-slow {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
        </style>

        <div id="intro-wrapper">
            <!-- Multi-layer celestial canvases -->
            <canvas id="backgroundCanvas"></canvas>
            <canvas id="milkyWayCanvas"></canvas>
            <canvas id="starsCanvas"></canvas>
            <canvas id="orbsCanvas"></canvas>

            <!-- Enhanced orbital rings -->
            <div class="orbital-container">
                <div class="orbital-ring ring1">
                    <div class="orbit-dot" style="top:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;left:-2px;transform:translateY(-50%);"></div>
                    <div class="orbit-dot" style="bottom:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;right:-2px;transform:translateY(-50%);"></div>
                </div>
                <div class="orbital-ring ring2">
                    <div class="orbit-dot" style="top:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:20%;left:80%;"></div>
                    <div class="orbit-dot" style="top:80%;left:20%;"></div>
                    <div class="orbit-dot" style="top:50%;right:-2px;transform:translateY(-50%);"></div>
                </div>
                <div class="orbital-ring ring3">
                    <div class="orbit-dot" style="top:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:10%;left:90%;"></div>
                    <div class="orbit-dot" style="top:90%;left:10%;"></div>
                    <div class="orbit-dot" style="bottom:-2px;left:50%;transform:translateX(-50%);"></div>
                </div>
                <div class="orbital-ring ring4">
                    <div class="orbit-dot" style="top:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;left:-2px;transform:translateY(-50%);"></div>
                    <div class="orbit-dot" style="bottom:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;right:-2px;transform:translateY(-50%);"></div>
                </div>
                <div class="orbital-ring ring5">
                    <div class="orbit-dot" style="top:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;left:-2px;transform:translateY(-50%);"></div>
                    <div class="orbit-dot" style="bottom:-2px;left:50%;transform:translateX(-50%);"></div>
                    <div class="orbit-dot" style="top:50%;right:-2px;transform:translateY(-50%);"></div>
                </div>
            </div>

            <!-- Enhanced responsive SVG -->
            <svg id="intro-svg" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <!-- Massive outer circles -->
                <circle cx="960" cy="540" r="920" stroke="#fff" fill="none" opacity="0.6" stroke-width="1.2" />
                <circle cx="960" cy="540" r="890" stroke="#fff" fill="none" opacity="0.8" stroke-width="3"
                    style="filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));" />
                <circle cx="1850" cy="540" r="6" fill="#fff" stroke="none" opacity="0.9"
                    style="animation: orbit 120s linear infinite; transform-origin: 960px 540px;
                           filter: drop-shadow(0 0 8px rgba(255,255,255,0.8));" />
                <circle cx="960" cy="540" r="880" stroke="#fff" fill="none" opacity="0.5" stroke-width="1" />

                <!-- Bigger outer circles -->
                <circle cx="960" cy="540" r="750" stroke="#fff" fill="none" opacity="0.7" stroke-width="1.5"
                    stroke-dasharray="2" style="animation: orbit 90s linear infinite; transform-origin: center;" />
                <circle cx="960" cy="540" r="700" stroke="#fff" fill="none" opacity="0.8" stroke-width="1.8" />
                <circle cx="1660" cy="540" r="12" fill="#fff" stroke="none" opacity="0.9"
                    style="animation: orbit 90s linear infinite; transform-origin: 960px 540px;" />
                <circle cx="1660" cy="540" r="16" stroke="#fff" fill="none" stroke-width="2" opacity="0.8"
                    style="animation: orbit 90s linear infinite; transform-origin: 960px 540px;" />

                <!-- Satellite orbit animation -->
                <g style="animation: orbit 90s linear infinite; transform-origin: 960px 540px;">
                    <g style="animation: orbit 15s linear infinite; transform-origin: 1660px 540px;">
                        <circle cx="1676" cy="540" r="2" stroke="#fff" fill="none" stroke-width="2" opacity="0.7" />
                    </g>
                </g>
                <circle cx="1660" cy="540" r="24" stroke="#fff" fill="none" stroke-width="2" opacity="0.6"
                    style="animation: orbit 90s linear infinite; transform-origin: 960px 540px;" />

                <!-- Main concentric circles -->
                <circle cx="960" cy="540" r="320" stroke="#fff" fill="none" stroke-width="4"
                    style="filter: drop-shadow(0 0 4px rgba(255,255,255,0.6));" />
                <circle cx="1280" cy="540" r="16" stroke="#fff" fill="none" stroke-width="2" opacity="0.8" />
                <circle cx="960" cy="540" r="265" stroke="#fff" fill="none" stroke-width="2" />
                <circle cx="960" cy="540" r="190" stroke="#fff" fill="none" stroke-width="4" />
                <circle cx="1150" cy="540" r="8" fill="#fff" stroke="none"
                    style="animation: orbit 60s linear infinite; animation-delay: -3s; transform-origin: 960px 540px;" />
                <circle cx="1150" cy="540" r="16" stroke="#fff" fill="none" stroke-width="2"
                    style="animation: orbit 60s linear infinite; animation-delay: -7s; transform-origin: 960px 540px;" />
                <circle cx="960" cy="540" r="182" stroke="#fff" fill="none" stroke-width="2.25" />
                <circle cx="960" cy="540" r="155" stroke="#fff" fill="none" stroke-width="2.25" />
                <circle cx="1115" cy="540" r="8" fill="#fff" stroke="none"
                    style="animation: orbit 30s linear infinite; transform-origin: 960px 540px;" />
                <circle cx="1115" cy="540" r="16" stroke="#fff" fill="none" stroke-width="2"
                    style="animation: orbit 30s linear infinite; transform-origin: 960px 540px;" />
                <circle cx="960" cy="540" r="130" stroke="#fff" fill="none" stroke-width="2.25"
                    stroke-dasharray="3.5" style="animation: orbit 30s linear infinite reverse; transform-origin: center;" />

                <!-- Decorative off-center circles -->
                <circle cx="300" cy="200" r="80" stroke="#fff" fill="none" stroke-width="1.5" opacity="0.6" />
                <circle cx="1700" cy="900" r="60" stroke="#fff" fill="none" stroke-width="1.5" opacity="0.6" />
                <circle cx="400" cy="900" r="40" stroke="#fff" fill="none" stroke-width="1" opacity="0.5" />
                <circle cx="1600" cy="300" r="150" stroke="#fff" fill="none" stroke-width="1.2" opacity="0.5" />
                <circle cx="200" cy="800" r="120" stroke="#fff" fill="none" stroke-width="1" opacity="0.6" />
                <circle cx="1500" cy="750" r="90" stroke="#fff" fill="none" stroke-width="1" opacity="0.7" />
                <circle cx="450" cy="150" r="120" stroke="#fff" fill="none" stroke-width="1.1" opacity="0.6" />

                <!-- Enhanced squares with glow effect -->
                <g stroke="#fff" stroke-width="1.2" fill="none" opacity="0.85"
                   style="filter: drop-shadow(0 0 15px rgba(255,255,255,0.7))
                                  drop-shadow(0 0 30px rgba(255,255,255,0.4));">
                    <rect x="735" y="315" width="450" height="450" transform="rotate(45 960 540)" stroke-dasharray="3.5" />
                    <rect x="735" y="315" width="450" height="450" transform="rotate(0 960 540)" stroke-dasharray="3.5" />
                </g>
            </svg>

            <!-- Perfect diamond layout using CSS Grid -->
           <div id="diamond-layout">
            <h1 id="intro-title">GRIS PONG</h1>
            <button id="intro-login" class="diamond-btn">${t.login}</button>
            <button id="intro-register" class="diamond-btn">${t.register}</button>
            <div class="play-container">
                <button id="intro-play-btn" class="diamond-btn">${t.play}</button>
                <div id="play-options" class="play-options">
                    <button id="intro-quickplay" class="diamond-btn">${t.quickPlay}</button>
                    <button id="intro-quicktournament" class="diamond-btn">${t.quickTournament}</button>
                </div>
            </div>
            <div class="language-container">
                <button id="intro-language-btn" class="diamond-btn">${t.language}</button>
                <div id="intro-language-options">
                    <button data-lang="en" class="language-option">English</button>
                    <button data-lang="es" class="language-option">Español</button>
                    <button data-lang="pt" class="language-option">Português</button>
                </div>
            </div>
        </div>
    `;

	// Initialize celestial animations with enhanced error handling
	initializeCelestialEffects();

	// Setup event listeners
	setupIntroEventListeners(onNavigate);
}

function initializeCelestialEffects(): void {
	setTimeout(() => {
		try {
			const celestialAnimations = initializeCelestialAnimations();
			if (celestialAnimations) {
				celestialAnimations.startAnimation();
				console.log('✨ Celestial animations initialized successfully');
			} else {
				console.warn('⚠️ Celestial animations could not be initialized - retrying...');
				// Retry after a short delay
				setTimeout(() => {
					try {
						const retryAnimations = initializeCelestialAnimations();
						if (retryAnimations) {
							retryAnimations.startAnimation();
							console.log('✨ Celestial animations initialized on retry');
						}
					} catch (error) {
						console.warn('⚠️ Celestial animations retry failed:', error);
					}
				}, 1000);
			}
		} catch (error) {
			console.warn('⚠️ Could not initialize celestial animations:', error);
		}
	}, 100);
}

function setupIntroEventListeners(onNavigate: (route: string) => void): void {
	const introLogin = document.getElementById('intro-login');
	const introRegister = document.getElementById('intro-register');
	const introQuickplay = document.getElementById('intro-quickplay');
	const quickTournamentBtn = document.getElementById('intro-quicktournament');
	const introLanguageBtn = document.getElementById('intro-language-btn');
	const introLanguageOptions = document.getElementById('intro-language-options');
	const playDropdown = document.getElementById('play-options');
	const introPlayBtn = document.getElementById('intro-play-btn');

	function addButtonPressEffect(button: HTMLElement) {
		if (!button) return;
		button.addEventListener('mousedown', () => {
			button.style.transform = 'scale(0.95)';
		});
		button.addEventListener('mouseup', () => {
			button.style.transform = 'scale(1)';
		});
		button.addEventListener('mouseleave', () => {
			button.style.transform = 'scale(1)';
		});
	}

	if (introLogin) {
		addButtonPressEffect(introLogin);
		introLogin.addEventListener('click', () => {
			console.log('🔑 Intro login clicked');
			onNavigate('/login');
		});
	}

	if (introRegister) {
		addButtonPressEffect(introRegister);
		introRegister.addEventListener('click', () => {
			console.log('📝 Intro register clicked');
			onNavigate('/register');
		});
	}

	if (introPlayBtn && playDropdown) {
		addButtonPressEffect(introPlayBtn);
		introPlayBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isHidden = playDropdown.style.display === 'none' || !playDropdown.style.display;
			playDropdown.style.display = isHidden ? 'block' : 'none';
			console.log('🎮 Play dropdown toggled:', isHidden ? 'opened' : 'closed');
		});

		// Clicking outside closes the dropdown
		document.addEventListener('click', (e) => {
			if (
				!playDropdown.contains(e.target as Node) &&
				!introPlayBtn.contains(e.target as Node)
			) {
				playDropdown.style.display = 'none';
			}
		});
	}

	if (introQuickplay) {
		addButtonPressEffect(introQuickplay);
		introQuickplay.addEventListener('click', () => {
			console.log('⚡ Intro quickplay clicked');
			onNavigate('/quick-play');
			playDropdown!.style.display = 'none';
		});
	}

	if (quickTournamentBtn) {
		addButtonPressEffect(quickTournamentBtn);
		quickTournamentBtn.addEventListener('click', () => {
			console.log('🏆 Quick tournament clicked');
			onNavigate('/quick-tournament');
			playDropdown!.style.display = 'none';
		});
	}


	if (quickTournamentBtn) {
		addButtonPressEffect(quickTournamentBtn);
		quickTournamentBtn.addEventListener('click', () => {
			console.log('🏆 Quick tournament button clicked');
			onNavigate('/quick-tournament');
		});
	}

	if (introLanguageBtn && introLanguageOptions) {
		addButtonPressEffect(introLanguageBtn);

		introLanguageBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isHidden = introLanguageOptions.style.display === 'none';
			introLanguageOptions.style.display = isHidden ? 'block' : 'none';
			console.log('🌐 Language menu toggled:', isHidden ? 'opened' : 'closed');
		});

		introLanguageOptions.querySelectorAll('button').forEach((btn) => {
			addButtonPressEffect(btn);

			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const selectedLang = btn.getAttribute('data-lang') || 'en';
				console.log(`Language changed to: ${selectedLang}`);
				localStorage.setItem('preferredLanguage', selectedLang);

				setTimeout(() => {
					introLanguageOptions.style.display = 'none';
				}, 150);

				applyLanguage(selectedLang);

				const container = document.getElementById('app');
				if (container) {
					container.style.transition = 'opacity 0.3s ease';
					container.style.opacity = '0.5';
					setTimeout(() => {
						renderIntroScreen(container, onNavigate);
						container.style.opacity = '1';
					}, 300);
				}
			});
		});

		// Close dropdown on outside click
		document.addEventListener('click', (e) => {
			if (
				!introLanguageOptions.contains(e.target as Node) &&
				!introLanguageBtn.contains(e.target as Node)
			) {
				introLanguageOptions.style.display = 'none';
			}
		});
	}
}
