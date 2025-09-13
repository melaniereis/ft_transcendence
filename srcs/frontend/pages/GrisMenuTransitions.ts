// GrisMenuTransitions.ts - Smooth transitions and effects for the Gris menu

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
	 * Fade in an element with Gris-style animation
	 */
	public fadeIn(element: HTMLElement, config: TransitionConfig = {}): Promise<void> {
		const { duration = 800, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;

		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		// Set initial state
		element.style.opacity = '0';
		element.style.transform = 'translateY(20px)';
		element.style.visibility = 'visible';

		return new Promise((resolve) => {
			setTimeout(() => {
				const animation = element.animate([
					{
						opacity: '0',
						transform: 'translateY(20px)',
						filter: 'blur(5px)'
					},
					{
						opacity: '1',
						transform: 'translateY(0)',
						filter: 'blur(0px)'
					}
				], {
					duration,
					easing,
					fill: 'forwards'
				});

				this.activeTransitions.set(element, animation);

				animation.addEventListener('finish', () => {
					element.style.opacity = '1';
					element.style.transform = 'translateY(0)';
					element.style.filter = 'blur(0px)';
					this.activeTransitions.delete(element);
					resolve();
				});
			}, delay);
		});
	}

	/**
	 * Fade out an element with Gris-style animation
	 */
	public fadeOut(element: HTMLElement, config: TransitionConfig = {}): Promise<void> {
		const { duration = 600, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config;

		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		return new Promise((resolve) => {
			setTimeout(() => {
				const animation = element.animate([
					{
						opacity: '1',
						transform: 'translateY(0)',
						filter: 'blur(0px)'
					},
					{
						opacity: '0',
						transform: 'translateY(-20px)',
						filter: 'blur(5px)'
					}
				], {
					duration,
					easing,
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
	 * Button press animation for Gris-style buttons
	 */
	public buttonPress(button: HTMLElement): Promise<void> {
		// Cancel any existing animation on this element
		this.cancelAnimation(button);

		return new Promise((resolve) => {
			const animation = button.animate([
				{ transform: 'scale(1) translateY(0)', boxShadow: '0 8px 25px rgba(232, 213, 255, 0.2)' },
				{ transform: 'scale(0.95) translateY(2px)', boxShadow: '0 4px 15px rgba(232, 213, 255, 0.1)' },
				{ transform: 'scale(1) translateY(0)', boxShadow: '0 8px 25px rgba(232, 213, 255, 0.2)' }
			], {
				duration: 200,
				easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
			});

			this.activeTransitions.set(button, animation);

			animation.addEventListener('finish', () => {
				this.activeTransitions.delete(button);
				resolve();
			});
		});
	}

	/**
	 * Stagger fade-in animation for multiple elements
	 */
	public staggerFadeIn(elements: HTMLElement[], config: TransitionConfig = {}): Promise<void> {
		const { delay = 100 } = config;
		const promises: Promise<void>[] = [];

		elements.forEach((element, index) => {
			const elementDelay = index * delay;
			promises.push(this.fadeIn(element, { ...config, delay: elementDelay }));
		});

		return Promise.all(promises).then(() => { });
	}

	/**
	 * Scale in animation with glow effect
	 */
	public scaleInWithGlow(element: HTMLElement, config: TransitionConfig = {}): Promise<void> {
		const { duration = 600, easing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', delay = 0 } = config;

		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		// Set initial state
		element.style.transform = 'scale(0)';
		element.style.opacity = '0';
		element.style.visibility = 'visible';

		return new Promise((resolve) => {
			setTimeout(() => {
				const animation = element.animate([
					{
						transform: 'scale(0)',
						opacity: '0',
						filter: 'brightness(0.5) blur(3px)',
						boxShadow: '0 0 0 rgba(232, 213, 255, 0)'
					},
					{
						transform: 'scale(1.1)',
						opacity: '0.8',
						filter: 'brightness(1.2) blur(1px)',
						boxShadow: '0 0 20px rgba(232, 213, 255, 0.4)'
					},
					{
						transform: 'scale(1)',
						opacity: '1',
						filter: 'brightness(1) blur(0px)',
						boxShadow: '0 4px 15px rgba(232, 213, 255, 0.2)'
					}
				], {
					duration,
					easing,
					fill: 'forwards'
				});

				this.activeTransitions.set(element, animation);

				animation.addEventListener('finish', () => {
					element.style.transform = 'scale(1)';
					element.style.opacity = '1';
					element.style.filter = 'brightness(1) blur(0px)';
					this.activeTransitions.delete(element);
					resolve();
				});
			}, delay);
		});
	}

	/**
	 * Floating animation for orbital elements
	 */
	public floatingAnimation(element: HTMLElement, amplitude: number = 10, duration: number = 3000): void {
		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		const animation = element.animate([
			{ transform: 'translateY(0px)' },
			{ transform: `translateY(-${amplitude}px)` },
			{ transform: 'translateY(0px)' },
			{ transform: `translateY(${amplitude / 2}px)` },
			{ transform: 'translateY(0px)' }
		], {
			duration,
			iterations: Infinity,
			easing: 'cubic-bezier(0.4, 0, 0.6, 1)'
		});

		this.activeTransitions.set(element, animation);
	}

	/**
	 * Pulse glow animation
	 */
	public pulseGlow(element: HTMLElement, color: string = '#e8d5ff'): void {
		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		const animation = element.animate([
			{
				boxShadow: `0 0 5px ${color}40`,
				filter: 'brightness(1)'
			},
			{
				boxShadow: `0 0 20px ${color}80`,
				filter: 'brightness(1.1)'
			},
			{
				boxShadow: `0 0 5px ${color}40`,
				filter: 'brightness(1)'
			}
		], {
			duration: 2000,
			iterations: Infinity,
			easing: 'cubic-bezier(0.4, 0, 0.6, 1)'
		});

		this.activeTransitions.set(element, animation);
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

	/**
	 * Shimmer effect for loading states
	 */
	public shimmer(element: HTMLElement): void {
		// Cancel any existing animation on this element
		this.cancelAnimation(element);

		// Create shimmer gradient
		element.style.background = `
            linear-gradient(
                90deg,
                rgba(232, 213, 255, 0.1) 0%,
                rgba(232, 213, 255, 0.3) 50%,
                rgba(232, 213, 255, 0.1) 100%
            )
        `;
		element.style.backgroundSize = '200% 100%';

		const animation = element.animate([
			{ backgroundPosition: '-200% 0' },
			{ backgroundPosition: '200% 0' }
		], {
			duration: 1500,
			iterations: Infinity,
			easing: 'linear'
		});

		this.activeTransitions.set(element, animation);
	}
}

// Export singleton instance
export const grisTransitions = GrisMenuTransitions.getInstance();
