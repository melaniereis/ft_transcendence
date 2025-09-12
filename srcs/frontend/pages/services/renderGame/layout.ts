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
            padding: ${GRIS_SPACING[4]};
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
                margin-bottom: ${GRIS_SPACING[6]};
                position: relative;
                z-index: 2;
            ">
                <h1 style="
                    color: ${GRIS_COLORS.primary};
                    font-size: ${GRIS_TYPOGRAPHY.scale['3xl']};
                    font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                    margin-bottom: ${GRIS_SPACING[3]};
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">GRIS Pong</h1>
                <div class="game-oracle" style="
                    color: ${GRIS_COLORS.secondary};
                    font-size: ${GRIS_TYPOGRAPHY.scale.lg};
                    font-weight: ${GRIS_TYPOGRAPHY.weights.medium};
                ">Round ${config.round} • ${config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}</div>
            </div>

            <!-- Responsive Game Layout -->
            <div class="game-constellation" style="
                display: grid;
                grid-template-columns: 1fr 2fr 1fr;
                gap: ${GRIS_SPACING[4]};
                max-width: 1200px;
                margin: 0 auto;
                position: relative;
                z-index: 2;
            ">
                <!-- Player 1 Sanctuary -->
                <div class="player-sanctuary left-sanctuary" style="
                    background: ${GRIS_COLORS.gradients.ocean};
                    border-radius: ${GRIS_SPACING[3]};
                    padding: ${GRIS_SPACING[4]};
                    box-shadow: ${GRIS_SHADOWS.lg};
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(127, 199, 217, 0.3);
                    transition: transform 0.3s ease;
                ">
                    <div class="player-avatar" style="
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: ${GRIS_COLORS.surface};
                        margin: 0 auto ${GRIS_SPACING[3]};
                        border: 3px solid ${GRIS_COLORS.depression};
                        background-image: url('${config.player1.avatarUrl || '/assets/avatar/default.png'}');
                        background-size: cover;
                        background-position: center;
                    "></div>
                    <h3 style="
                        text-align: center;
                        color: ${GRIS_COLORS.background};
                        font-size: ${GRIS_TYPOGRAPHY.scale.lg};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                        margin-bottom: ${GRIS_SPACING[2]};
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    ">${config.player1.nickname}</h3>
                    <div class="mystical-score left-score" style="
                        text-align: center;
                        font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                        color: ${GRIS_COLORS.background};
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        transition: transform 0.3s ease;
                    ">${config.score1}</div>
                </div>

                <!-- Game Arena -->
                <div class="game-arena" style="
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: ${GRIS_SPACING[3]};
                    padding: ${GRIS_SPACING[4]};
                    box-shadow: ${GRIS_SHADOWS.xl};
                    backdrop-filter: blur(15px);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: ${GRIS_SPACING[3]};
                ">
                    <div class="canvas-container" style="
                        position: relative;
                        border-radius: ${GRIS_SPACING[2]};
                        overflow: hidden;
                        box-shadow: ${GRIS_SHADOWS.cool};
                        background: linear-gradient(135deg, #000 0%, #1a1a2e 100%);
                    ">
                        <canvas id="${config.canvasId}" width="800" height="480" style="
                            display: block;
                            max-width: 100%;
                            height: auto;
                        "></canvas>
                    </div>

                    ${config.showControls ? `
                        <div class="mystical-controls" style="
                            display: flex;
                            gap: ${GRIS_SPACING[3]};
                            margin-top: ${GRIS_SPACING[2]};
                        ">
                            <button class="gris-game-pause-btn" style="
                                background: ${GRIS_COLORS.gradients.mist};
                                border: 2px solid ${GRIS_COLORS.secondary};
                                border-radius: ${GRIS_SPACING[2]};
                                padding: ${GRIS_SPACING[2]} ${GRIS_SPACING[4]};
                                color: ${GRIS_COLORS.primary};
                                font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: ${GRIS_SHADOWS.sm};
                                font-size: ${GRIS_TYPOGRAPHY.scale.base};
                            ">⏸️ Pause</button>
                        </div>
                    ` : ''}
                </div>

                <!-- Player 2 Sanctuary -->
                <div class="player-sanctuary right-sanctuary" style="
                    background: ${GRIS_COLORS.gradients.sunrise};
                    border-radius: ${GRIS_SPACING[3]};
                    padding: ${GRIS_SPACING[4]};
                    box-shadow: ${GRIS_SHADOWS.lg};
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(230, 199, 156, 0.3);
                    transition: transform 0.3s ease;
                ">
                    <div class="player-avatar" style="
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: ${GRIS_COLORS.surface};
                        margin: 0 auto ${GRIS_SPACING[3]};
                        border: 3px solid ${GRIS_COLORS.acceptance};
                        background-image: url('${config.player2.avatarUrl || '/assets/avatar/default.png'}');
                        background-size: cover;
                        background-position: center;
                    "></div>
                    <h3 style="
                        text-align: center;
                        color: ${GRIS_COLORS.primary};
                        font-size: ${GRIS_TYPOGRAPHY.scale.lg};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                        margin-bottom: ${GRIS_SPACING[2]};
                        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    ">${config.player2.nickname}</h3>
                    <div class="mystical-score right-score" style="
                        text-align: center;
                        font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                        font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                        color: ${GRIS_COLORS.primary};
                        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                        transition: transform 0.3s ease;
                    ">${config.score2}</div>
                </div>
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
