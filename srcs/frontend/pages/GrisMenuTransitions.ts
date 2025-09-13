// srcs/frontend/pages/GrisMenuTransitions.ts - Simplified transitions

export interface TransitionConfig {
	duration?: number;
	easing?: string;
	delay?: number;
}

export class GrisMenuTransitions {
	private static instance: GrisMenuTransitions;
	private activeTransitions: Map<HTMLElement, Animation> = new Map();

	public static getInstance(): GrisMenuTransitions {
		if (!GrisMenuTransitions.instance) {
			GrisMenuTransitions.instance = new GrisMenuTransitions();
		}
		return GrisMenuTransitions.instance;
	}

	/**
	 * Simple fade in
	 */
	public fadeIn(element: HTMLElement, config: TransitionConfig = {}): Promise<void> {
		const { duration = 300, delay = 0 } = config;

		// Cancel any existing animation
		this.cancelAnimation(element);

		element.style.opacity = '0';
		element.style.visibility = 'visible';

		return new Promise((resolve) => {
			setTimeout(() => {
				const animation = element.animate([
					{ opacity: '0' },
					{ opacity: '1' }
				], {
					duration,
					easing: 'ease-out',
					fill: 'forwards'
				});

				this.activeTransitions.set(element, animation);
				animation.addEventListener('finish', () => {
					element.style.opacity = '1';
					this.activeTransitions.delete(element);
					resolve();
				});
			}, delay);
		});
	}

	/**
	 * Simple fade out
	 */
	public fadeOut(element: HTMLElement, config: TransitionConfig = {}): Promise<void> {
		const { duration = 300, delay = 0 } = config;

		// Cancel any existing animation
		this.cancelAnimation(element);

		return new Promise((resolve) => {
			setTimeout(() => {
				const animation = element.animate([
					{ opacity: '1' },
					{ opacity: '0' }
				], {
					duration,
					easing: 'ease-in',
					fill: 'forwards'
				});

				this.activeTransitions.set(element, animation);
				animation.addEventListener('finish', () => {
					element.style.visibility = 'hidden';
					this.activeTransitions.delete(element);
					resolve();
				});
			}, delay);
		});
	}

	/**
	 * Simple button press effect
	 */
	public buttonPress(button: HTMLElement): Promise<void> {
		// Cancel any existing animation
		this.cancelAnimation(button);

		return new Promise((resolve) => {
			const animation = button.animate([
				{ transform: 'scale(1)' },
				{ transform: 'scale(0.95)' },
				{ transform: 'scale(1)' }
			], {
				duration: 150,
				easing: 'ease-out'
			});

			this.activeTransitions.set(button, animation);
			animation.addEventListener('finish', () => {
				this.activeTransitions.delete(button);
				resolve();
			});
		});
	}

	/**
	 * Cancel animation on an element
	 */
	public cancelAnimation(element: HTMLElement): void {
		const animation = this.activeTransitions.get(element);
		if (animation) {
			animation.cancel();
			this.activeTransitions.delete(element);
		}
	}

	/**
	 * Cancel all active animations
	 */
	public cancelAllAnimations(): void {
		this.activeTransitions.forEach((animation) => {
			animation.cancel();
		});
		this.activeTransitions.clear();
	}
}

// Export singleton instance
export const grisTransitions = GrisMenuTransitions.getInstance();
