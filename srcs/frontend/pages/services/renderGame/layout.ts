//renderGame/layout.ts

import { GRIS_COLORS, GRIS_SPACING, GRIS_SHADOWS, GRIS_TYPOGRAPHY } from './constants.js';

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
                background: ${GRIS_COLORS.gradients.ethereal};
                padding: ${GRIS_SPACING[2]};
                font-family: ${GRIS_TYPOGRAPHY.fonts.body};
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
                    <canvas id="gris-bg-particles" style="
                        position: absolute;
                        inset: 0;
                        opacity: 0.4;
                    "></canvas>
                </div>

                <!-- Game Header -->
                <div class="ethereal-header" style="
                    text-align: center;
                    margin-bottom: ${GRIS_SPACING[4]};
                    position: relative;
                    z-index: 2;
                ">
                    <h1 style="
                        color: ${GRIS_COLORS.primary};
                        font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                        margin-bottom: ${GRIS_SPACING[2]};
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">GRIS Pong</h1>
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
                    align-items: center;
                    max-width: 900px;
                    margin: 0 auto 12px auto;
                    gap: 8px;
                ">
                    <div class="player-sanctuary left-sanctuary" style="
                        background: ${GRIS_COLORS.gradients.ocean};
                        border-radius: 16px;
                        padding: 8px 12px;
                        min-width: 120px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <div class="player-avatar" style="
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background: ${GRIS_COLORS.surface};
                            border: 2px solid ${GRIS_COLORS.depression};
                            background-image: url('${config.player1.avatarUrl || '/assets/avatar/default.png'}');
                            background-size: cover;
                            background-position: center;
                        "></div>
                        <span style="
                            color: ${GRIS_COLORS.background};
                            font-size: 1rem;
                            font-weight: 600;
                            margin-right: 8px;
                        ">${config.player1.nickname}</span>
                        <span style="
                            font-size: 1.2rem;
                            font-weight: bold;
                            color: ${GRIS_COLORS.background};
                            margin-left: auto;
                        ">${config.score1}</span>
                    </div>
                    <div class="player-sanctuary right-sanctuary" style="
                        background: ${GRIS_COLORS.gradients.sunrise};
                        border-radius: 16px;
                        padding: 8px 12px;
                        min-width: 120px;
                        max-width: 45%;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <div class="player-avatar" style="
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background: ${GRIS_COLORS.surface};
                            border: 2px solid ${GRIS_COLORS.acceptance};
                            background-image: url('${config.player2.avatarUrl || '/assets/avatar/default.png'}');
                            background-size: cover;
                            background-position: center;
                        "></div>
                        <span style="
                            color: ${GRIS_COLORS.primary};
                            font-size: 1rem;
                            font-weight: 600;
                            margin-right: 8px;
                        ">${config.player2.nickname}</span>
                        <span style="
                            font-size: 1.2rem;
                            font-weight: bold;
                            color: ${GRIS_COLORS.primary};
                            margin-left: auto;
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
                    background: rgba(255,255,255,0.08);
                    border-radius: 18px;
                    box-shadow: ${GRIS_SHADOWS.xl};
                    padding: 16px;
                ">
                    <div class="canvas-container" style="
                        position: relative;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: ${GRIS_SHADOWS.cool};
                        background: linear-gradient(135deg, #000 0%, #1a1a2e 100%);
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
                            ">⏸️ Pause</button>
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
