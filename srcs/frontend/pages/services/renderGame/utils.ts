//renderGame/utils.ts

import { GRIS_COLORS } from './constants.js';

/**
 * Optimized utility functions for GRIS-inspired game
 * - Performance-first approach
 * - Clean and efficient implementations
 */

export function safeAudioPlay(audio: HTMLAudioElement) {
    if (typeof (window as any).safePlayAudio === 'function') {
        (window as any).safePlayAudio(audio);
    } else {
        audio.play().catch((err) => {
            console.error('Audio play failed - user interaction required or error occurred:', err);
        });

        // Add error event listener for other playback errors
        audio.addEventListener('error', (e) => {
            console.error('Audio playback error event:', e);
        });
    }
}


export function showNotification(
	message: string,
	color: string = GRIS_COLORS.acceptance,
	duration: number = 2000
) {
	let notif = document.getElementById('gris-game-notification');

	if (!notif) {
		notif = document.createElement('div');
		notif.id = 'gris-game-notification';
		notif.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: ${color};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 3000;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
		document.body.appendChild(notif);
	}

	notif.textContent = message;
	notif.style.background = color;

	// Animate in
	requestAnimationFrame(() => {
		notif!.style.transform = 'translateX(0)';
	});

	// Auto hide
	setTimeout(() => {
		if (notif) {
			notif.style.transform = 'translateX(100%)';
			setTimeout(() => {
				if (notif && notif.parentNode) {
					notif.parentNode.removeChild(notif);
				}
			}, 300);
		}
	}, duration);
}

export function playGameSound(type: 'score' | 'win' | 'pause' | 'resume', volume: number = 0.2) {
	const soundMap: Record<string, string> = {
		score: '/assets/sounds/score.mp3',
		win: '/assets/sounds/win.mp3',
		pause: '/assets/sounds/pause.mp3',
		resume: '/assets/sounds/resume.mp3'
	};

	const src = soundMap[type];
	if (src) {
		const audio = new Audio(src);
		audio.volume = volume;
		safeAudioPlay(audio);
	}
}

export function formatTime(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes > 0) {
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	return `${remainingSeconds}s`;
}

export function lerp(start: number, end: number, factor: number): number {
	return start + (end - start) * factor;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: number | null = null;
	let lastExecTime = 0;

	return (...args: Parameters<T>) => {
		const currentTime = Date.now();

		if (currentTime - lastExecTime > delay) {
			func(...args);
			lastExecTime = currentTime;
		} else {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = window.setTimeout(() => {
				func(...args);
				lastExecTime = Date.now();
			}, delay - (currentTime - lastExecTime));
		}
	};
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: number | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => func(...args), delay);
	};
}
