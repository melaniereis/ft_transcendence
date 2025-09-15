//renderGame/layout.ts

import { GRIS_COLORS, GRIS_SPACING, GRIS_SHADOWS, GRIS_TYPOGRAPHY } from './constants.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '') 
  ? localStorage.getItem('preferredLanguage') 
  : 'en') as keyof typeof translations;

const t = translations[lang];
export interface GameLayoutConfig {
	player1: { nickname: string; avatarUrl?: string };
	player2: { nickname: string; avatarUrl?: string };
	score1: number;
	score2: number;
	round: number;
	mode: string;
	avatar1?: string;
	avatar2?: string;
	canvasId: string;
	showControls: boolean;
	modalsHtml: string;
}

export function renderGameLayout(config: GameLayoutConfig): string {
	return `
            <div class="gris-game-universe" style="
                min-height: 100vh;
                background: transparent;
                padding: ${GRIS_SPACING[3]};
                position: relative;
                overflow: hidden;
            ">
                <!-- Optimized Background -->
                <div class="gris-atmosphere" style="
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                ">
                    <canvas id="gris-bg-particles" width="" height="" style="
                        position: absolute;
                        inset: 0;
                        opacity: 0.5;
                        background: transparent;
                    "></canvas>
                </div>

                <!-- Game Header -->
                <div class="ethereal-header" style="
                    text-align: center;
                    margin-bottom: ${GRIS_SPACING[4]};
                    position: relative;
                    z-index: 2;
                ">
                    <div class="game-oracle" style="
                        color: ${GRIS_COLORS.secondary};
                        font-size: ${GRIS_TYPOGRAPHY.scale.base};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.medium};
                    ">Round ${config.round} • ${config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}</div>
                </div>

                <!-- Players Top Bar -->
                <div class="gris-players-topbar" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    max-width: 900px;
                    margin: 0 auto 18px auto;
                    gap: 18px;
                ">
                    <div class="player-sanctuary left-sanctuary" style="
                        background: linear-gradient(120deg, #7fc7d9 0%, #b6a6ca 100%);
                        border-radius: 20px;
                        padding: 16px 18px;
                        min-width: 140px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        box-shadow: 0 2px 12px rgba(44,34,84,0.08);
                        border: 1.5px solid #b6a6ca;
                    ">
                        <div class="player-avatar" style="
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            background: #fff;
                            border: 2.5px solid ${GRIS_COLORS.depression};
                            box-shadow: 0 1px 6px rgba(44,34,84,0.10);
                            background-image: url('${config.player1.avatarUrl || '/assets/avatar/default.png'}');
                            background-size: cover;
                            background-position: center;
                        "></div>
                        <span style="
                            color: #2c2254;
                            font-size: 1.08rem;
                            font-weight: 700;
                            margin-right: 10px;
                            letter-spacing: 0.02em;
                        ">${config.player1.nickname}</span>
                        <span style="
                            font-size: 1.32rem;
                            font-weight: bold;
                            color: #2c2254;
                            margin-left: auto;
                            text-shadow: 0 1px 6px rgba(44,34,84,0.10);
                        ">${config.score1}</span>
                    </div>
                    <div class="player-sanctuary right-sanctuary" style="
                        background: linear-gradient(120deg, #f7b267 0%, #b6a6ca 100%);
                        border-radius: 20px;
                        padding: 16px 18px;
                        min-width: 140px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        box-shadow: 0 2px 12px rgba(44,34,84,0.08);
                        border: 1.5px solid #f7b267;
                    ">
                        <div class="player-avatar" style="
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            background: #fff;
                            border: 2.5px solid ${GRIS_COLORS.acceptance};
                            box-shadow: 0 1px 6px rgba(44,34,84,0.10);
                            background-image: url('${config.player2.avatarUrl || '/default.png'}');
                            background-size: cover;
                            background-position: center;
                        "></div>
                        <span style="
                            color: #2c2254;
                            font-size: 1.08rem;
                            font-weight: 700;
                            margin-right: 10px;
                            letter-spacing: 0.02em;
                        ">${config.player2.nickname}</span>
                        <span style="
                            font-size: 1.32rem;
                            font-weight: bold;
                            color: #2c2254;
                            margin-left: auto;
                            text-shadow: 0 1px 6px rgba(44,34,84,0.10);
                        ">${config.score2}</span>
                    </div>
                </div>

                <!-- Game Arena Centralizada -->
                <div class="gris-game-arena" style="
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(120deg, #fffbe6 0%, #e9e4f0 100%);
                    border-radius: 24px;
                    box-shadow: 0 4px 24px 0 rgba(44,34,84,0.10);
                    padding: 28px 18px;
                ">
                    <div class="canvas-container" style="
                        position: relative;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 2px 12px rgba(44,34,84,0.10);
                        background: transparent;
                        width: 100%;
                        aspect-ratio: 5 / 3;
                        max-width: 900px;
                        min-width: 400px;
                        min-height: 240px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <canvas id="${config.canvasId}" width="800" height="480" style="
                            display: block;
                            width: 100%;
                            height: 100%;
                            max-width: 100%;
                            max-height: 100%;
                        "></canvas>
                    </div>

                    ${config.showControls ? `
                        <div class="mystical-controls" style="
                            display: flex;
                            gap: 16px;
                            margin-top: 12px;
                        ">
                            <button class="gris-game-pause-btn" style="
                                background: ${GRIS_COLORS.gradients.mist};
                                border: 2px solid ${GRIS_COLORS.secondary};
                                border-radius: 8px;
                                padding: 8px 16px;
                                color: ${GRIS_COLORS.primary};
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: ${GRIS_SHADOWS.sm};
                                font-size: 1rem;
                            ">${(t as any)["pauseButton"] || 'Pause'}
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Modals Container -->
                ${config.modalsHtml}
            </div>

        <!-- Optimized Responsive Styles -->
        <style>
            .player-sanctuary:hover {
                transform: translateY(-2px);
            }

            .gris-game-pause-btn:hover {
                background: ${GRIS_COLORS.gradients.ocean};
                color: white;
                transform: translateY(-1px);
            }

            .mystical-score.score-update {
                transform: scale(1.1);
            }

            /* Mobile-first responsive design */
            @media (max-width: 768px) {
                .gris-game-universe {
                    padding: ${GRIS_SPACING[2]} !important;
                }

                .game-constellation {
                    grid-template-columns: 1fr !important;
                    gap: ${GRIS_SPACING[3]} !important;
                }

                .player-sanctuary {
                    display: flex !important;
                    align-items: center !important;
                    gap: ${GRIS_SPACING[3]} !important;
                    padding: ${GRIS_SPACING[3]} !important;
                }

                .player-avatar {
                    width: 50px !important;
                    height: 50px !important;
                    margin: 0 !important;
                }

                .ethereal-header h1 {
                    font-size: ${GRIS_TYPOGRAPHY.scale['2xl']} !important;
                }

                .mystical-score {
                    font-size: ${GRIS_TYPOGRAPHY.scale.xl} !important;
                }

                .canvas-container {
                    width: 100% !important;
                }

                #${config.canvasId} {
                    max-width: 100% !important;
                    height: auto !important;
                }
            }

            @media (max-width: 480px) {
                .ethereal-header h1 {
                    font-size: ${GRIS_TYPOGRAPHY.scale.xl} !important;
                }

                .mystical-score {
                    font-size: ${GRIS_TYPOGRAPHY.scale.lg} !important;
                }

                .player-sanctuary {
                    padding: ${GRIS_SPACING[2]} !important;
                }

                .game-arena {
                    padding: ${GRIS_SPACING[2]} !important;
                }
            }

            /* Accessibility and performance */
            @media (prefers-reduced-motion: reduce) {
                .player-sanctuary,
                .gris-game-pause-btn,
                .mystical-score {
                    transition: none !important;
                }

                .gris-atmosphere {
                    display: none !important;
                }
            }

            @media (prefers-contrast: high) {
                .player-sanctuary,
                .game-arena {
                    border-width: 3px !important;
                    border-color: #000 !important;
                }
            }

            /* Performance optimization */
            .player-sanctuary,
            .game-arena,
            .mystical-controls button {
                will-change: transform;
            }

            /* Smooth canvas scaling */
            #${config.canvasId} {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }
        </style>
    `;
}
