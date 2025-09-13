// srcs/frontend/pages/GrisMenuController.ts - Simplified controller without complex animations

import { CelestialAnimations, initializeCelestialAnimations } from './CelestialAnimations.js';
import { grisTransitions } from './GrisMenuTransitions.js';

// Define custom event types
interface GrisNavigateEvent extends CustomEvent {
	detail: { path: string };
}

interface GrisLanguageChangeEvent extends CustomEvent {
	detail: { language: Language };
}

// Language type
type Language = 'en' | 'es' | 'pt';

// Fallback translations interface
interface TranslationSet {
	login: string;
	register: string;
	language: string;
}

export interface GrisMenuConfig {
	enableAnimations?: boolean;
	enableParticles?: boolean;
	enableSound?: boolean;
	language?: Language;
}

export class GrisMenuController {
	private static instance: GrisMenuController;
	private celestialAnimations: CelestialAnimations | null = null;
	private menuElement: HTMLElement | null = null;
	private isActive: boolean = false;
	private config: GrisMenuConfig;
	private eventListeners: Map<string, EventListener> = new Map();

	constructor(config: GrisMenuConfig = {}) {
		this.config = {
			enableAnimations: true,
			enableParticles: true,
			enableSound: true,
			language: 'en',
			...config
		};
	}

	public static getInstance(config?: GrisMenuConfig): GrisMenuController {
		if (!GrisMenuController.instance) {
			GrisMenuController.instance = new GrisMenuController(config);
		}
		return GrisMenuController.instance;
	}

	/**
	 * Initialize the Gris menu system
	 */
	public async initialize(): Promise<void> {
		this.menuElement = document.getElementById('gris-main-menu');
		if (!this.menuElement) {
			console.error('Gris main menu element not found');
			return;
		}

		// Setup event listeners
		this.setupEventListeners();

		// Initialize language
		this.updateLanguage(this.config.language || 'en');

		console.log('Gris Menu Controller initialized');
	}

	/**
	 * Show the Gris menu - SIMPLIFIED
	 */
	public async show(): Promise<void> {
		if (!this.menuElement || this.isActive) return;

		this.isActive = true;
		this.menuElement.classList.add('active');

		// Simple fade in if animations enabled
		if (this.config.enableAnimations) {
			const elements = this.menuElement.querySelectorAll('.gris-menu-content > *') as NodeListOf<HTMLElement>;
			for (let i = 0; i < elements.length; i++) {
				await grisTransitions.fadeIn(elements[i], { delay: i * 100 });
			}
		}

		// Initialize celestial animations
		if (this.config.enableParticles) {
			setTimeout(() => {
				this.initializeCelestialEffects();
			}, 300);
		}
	}

	/**
	 * Hide the Gris menu - SIMPLIFIED
	 */
	public async hide(): Promise<void> {
		if (!this.menuElement || !this.isActive) return;

		if (this.config.enableAnimations) {
			const elements = this.menuElement.querySelectorAll('.gris-menu-content > *') as NodeListOf<HTMLElement>;
			for (const el of elements) {
				await grisTransitions.fadeOut(el as HTMLElement, { duration: 200 });
			}
		}

		this.isActive = false;
		this.menuElement.classList.remove('active');

		// Stop celestial animations
		if (this.celestialAnimations) {
			this.celestialAnimations.stopAnimation();
		}
	}

	/**
	 * Toggle menu visibility
	 */
	public async toggle(): Promise<void> {
		if (this.isActive) {
			await this.hide();
		} else {
			await this.show();
		}
	}

	/**
	 * Update the menu language
	 */
	public updateLanguage(language: Language): void {
		// Fallback translations
		const fallbackTranslations: Record<Language, TranslationSet> = {
			en: { login: 'Login', register: 'Register', language: 'Language' },
			es: { login: 'Iniciar Sesión', register: 'Registrarse', language: 'Idioma' },
			pt: { login: 'Entrar', register: 'Registrar', language: 'Idioma' }
		};

		let t: TranslationSet;
		try {
			const translations = (window as any).translations;
			t = translations?.[language] || fallbackTranslations[language] || fallbackTranslations.en;
		} catch {
			t = fallbackTranslations[language] || fallbackTranslations.en;
		}

		// Update button texts
		const loginBtn = document.getElementById('gris-login');
		const registerBtn = document.getElementById('gris-register');
		const languageBtn = document.getElementById('gris-language-btn');

		if (loginBtn) loginBtn.innerHTML = `🔑 ${t.login}`;
		if (registerBtn) registerBtn.innerHTML = `📝 ${t.register}`;
		if (languageBtn) languageBtn.innerHTML = `🌐 ${t.language}`;

		this.config.language = language;
	}

	/**
	 * Initialize celestial background effects
	 */
	private initializeCelestialEffects(): void {
		if (this.celestialAnimations) {
			this.celestialAnimations.startAnimation();
			return;
		}

		try {
			this.celestialAnimations = initializeCelestialAnimations();
			if (!this.celestialAnimations) {
				console.warn('Failed to initialize celestial animations');
			}
		} catch (error) {
			console.warn('Error initializing celestial animations:', error);
		}
	}

	/**
	 * Setup event listeners for menu interactions
	 */
	private setupEventListeners(): void {
		// Button click handlers
		const loginBtn = document.getElementById('gris-login');
		const registerBtn = document.getElementById('gris-register');
		const languageBtn = document.getElementById('gris-language-btn');
		const languageOptions = document.getElementById('gris-language-options');

		if (loginBtn) {
			const loginHandler = async (e: Event) => {
				e.preventDefault();
				if (this.config.enableAnimations) {
					await grisTransitions.buttonPress(loginBtn);
				}
				this.navigateToLogin();
			};
			loginBtn.addEventListener('click', loginHandler);
			this.eventListeners.set('gris-login-click', loginHandler);
		}

		if (registerBtn) {
			const registerHandler = async (e: Event) => {
				e.preventDefault();
				if (this.config.enableAnimations) {
					await grisTransitions.buttonPress(registerBtn);
				}
				this.navigateToRegister();
			};
			registerBtn.addEventListener('click', registerHandler);
			this.eventListeners.set('gris-register-click', registerHandler);
		}

		if (languageBtn && languageOptions) {
			const languageHandler = (e: Event) => {
				e.stopPropagation();
				languageOptions.classList.toggle('hidden');
			};
			languageBtn.addEventListener('click', languageHandler);
			this.eventListeners.set('gris-language-click', languageHandler);

			// Language option handlers
			const languageOptionHandlers = languageOptions.querySelectorAll('button');
			languageOptionHandlers.forEach(btn => {
				const optionHandler = () => {
					const selectedLang = btn.getAttribute('data-lang') as Language || 'en';
					try {
						localStorage.setItem('preferredLanguage', selectedLang);
					} catch (error) {
						console.warn('Failed to save language preference:', error);
					}
					this.updateLanguage(selectedLang);
					languageOptions.classList.add('hidden');

					// Trigger global language update
					const event = new CustomEvent('gris-language-changed', {
						detail: { language: selectedLang }
					}) as GrisLanguageChangeEvent;
					window.dispatchEvent(event);
				};
				btn.addEventListener('click', optionHandler);
			});
		}

		// Close language dropdown on outside click
		const outsideClickHandler = (e: Event) => {
			if (languageOptions && languageBtn) {
				const target = e.target as Node;
				if (!languageOptions.contains(target) && target !== languageBtn) {
					languageOptions.classList.add('hidden');
				}
			}
		};
		document.addEventListener('click', outsideClickHandler);
		this.eventListeners.set('outside-click', outsideClickHandler);

		// Keyboard navigation
		const keyboardHandler = (e: KeyboardEvent) => {
			if (!this.isActive) return;

			switch (e.key) {
				case 'Escape':
					this.hide();
					break;
				case 'Enter':
					// Focus the first button if none is focused
					const focusedElement = document.activeElement;
					if (!focusedElement || !this.menuElement?.contains(focusedElement)) {
						const firstButton = this.menuElement?.querySelector('.gris-btn') as HTMLElement;
						firstButton?.focus();
					}
					break;
			}
		};
		document.addEventListener('keydown', keyboardHandler);
		this.eventListeners.set('keyboard', keyboardHandler as EventListener);
	}

	/**
	 * Navigate to login page
	 */
	private navigateToLogin(): void {
		const event = new CustomEvent('gris-navigate', {
			detail: { path: '/login' }
		}) as GrisNavigateEvent;
		window.dispatchEvent(event);
	}

	/**
	 * Navigate to registration page
	 */
	private navigateToRegister(): void {
		const event = new CustomEvent('gris-navigate', {
			detail: { path: '/register' }
		}) as GrisNavigateEvent;
		window.dispatchEvent(event);
	}

	/**
	 * Update configuration
	 */
	public updateConfig(newConfig: Partial<GrisMenuConfig>): void {
		this.config = { ...this.config, ...newConfig };

		if (newConfig.language) {
			this.updateLanguage(newConfig.language);
		}

		if (newConfig.enableParticles === false && this.celestialAnimations) {
			this.celestialAnimations.stopAnimation();
		} else if (newConfig.enableParticles === true && !this.celestialAnimations) {
			this.initializeCelestialEffects();
		}
	}

	/**
	 * Get current menu state
	 */
	public getState(): { isActive: boolean; config: GrisMenuConfig } {
		return {
			isActive: this.isActive,
			config: { ...this.config }
		};
	}

	/**
	 * Cleanup resources and event listeners
	 */
	public destroy(): void {
		// Stop animations
		if (this.celestialAnimations) {
			this.celestialAnimations.destroy();
			this.celestialAnimations = null;
		}

		grisTransitions.cancelAllAnimations();

		// Remove event listeners
		this.eventListeners.forEach((listener, key) => {
			if (key.includes('click')) {
				const elementId = key.split('-')[1];
				const element = document.getElementById(`gris-${elementId}`);
				element?.removeEventListener('click', listener);
			} else if (key === 'outside-click') {
				document.removeEventListener('click', listener);
			} else if (key === 'keyboard') {
				document.removeEventListener('keydown', listener);
			}
		});

		this.eventListeners.clear();
		this.isActive = false;

		console.log('Gris Menu Controller destroyed');
	}
}

// Export singleton instance creator
export function createGrisMenuController(config?: GrisMenuConfig): GrisMenuController {
	return GrisMenuController.getInstance(config);
}
