//renderGame/modals.ts

import { GRIS_COLORS, GRIS_TYPOGRAPHY, GRIS_SHADOWS } from './constants.js';

/**
 * Optimized GRIS-inspired modals
 * - Lightweight and performant
 * - Beautiful aesthetic
 * - Responsive design
 */

export function renderPauseModal(): string {
	return `
        <div id="gris-game-pause-overlay" class="gris-game-modal" style="
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(182, 166, 202, 0.8);
            z-index: 2000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1.5rem;
                box-shadow: ${GRIS_SHADOWS.xl};
                text-align: center;
                min-width: 300px;
                max-width: 90vw;
                font-family: ${GRIS_TYPOGRAPHY.fonts.body};
            ">
                <h2 style="
                    color: ${GRIS_COLORS.primary};
                    font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                    margin-bottom: 1.5rem;
                    font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                ">Game Paused</h2>
                <button class="gris-game-pause-btn" style="
                    background: ${GRIS_COLORS.acceptance};
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 0.75rem;
                    font-size: ${GRIS_TYPOGRAPHY.scale.base};
                    font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                ">Resume Game</button>
            </div>
        </div>
    `;
}

export function renderAchievementsModal(achievements: string[]): string {
	return `
        <div id="gris-game-achievements-modal" class="gris-game-modal" style="
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(230, 199, 156, 0.8);
            z-index: 2000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1.5rem;
                box-shadow: ${GRIS_SHADOWS.xl};
                text-align: center;
                min-width: 300px;
                max-width: 90vw;
                font-family: ${GRIS_TYPOGRAPHY.fonts.body};
            ">
                <h2 style="
                    color: ${GRIS_COLORS.acceptance};
                    font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                    margin-bottom: 1.5rem;
                    font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                ">Achievements</h2>
                <ul style="
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    color: ${GRIS_COLORS.secondary};
                ">
                    ${achievements.length
			? achievements.map(a => `<li style="margin-bottom: 0.5rem;">${a}</li>`).join('')
			: '<li style="color: #999;">No achievements yet.</li>'}
                </ul>
                <button class="gris-game-modal-close" style="
                    background: ${GRIS_COLORS.secondary};
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 0.75rem;
                    font-size: ${GRIS_TYPOGRAPHY.scale.base};
                    font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                ">Close</button>
            </div>
        </div>
    `;
}

export function renderSettingsModal(settingsHtml: string): string {
	return `
        <div id="gris-game-settings-modal" class="gris-game-modal" style="
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(127, 199, 217, 0.8);
            z-index: 2000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1.5rem;
                box-shadow: ${GRIS_SHADOWS.xl};
                text-align: center;
                min-width: 300px;
                max-width: 90vw;
                font-family: ${GRIS_TYPOGRAPHY.fonts.body};
            ">
                <h2 style="
                    color: ${GRIS_COLORS.depression};
                    font-size: ${GRIS_TYPOGRAPHY.scale['2xl']};
                    margin-bottom: 1.5rem;
                    font-weight: ${GRIS_TYPOGRAPHY.weights.bold};
                ">Settings</h2>
                <div style="text-align: left; margin-bottom: 1.5rem;">
                    ${settingsHtml}
                </div>
                <button class="gris-game-modal-close" style="
                    background: ${GRIS_COLORS.depression};
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 0.75rem;
                    font-size: ${GRIS_TYPOGRAPHY.scale.base};
                    font-weight: ${GRIS_TYPOGRAPHY.weights.semibold};
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                ">Close</button>
            </div>
        </div>
    `;
}
