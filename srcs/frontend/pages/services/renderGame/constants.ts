//renderGame/constants.ts

// Optimized GRIS Emotional Color Journey
export const GRIS_COLORS = {
	// Primary Emotional Palette (simplified for performance)
	denial: '#f4f6fa',
	anger: '#e67e80',
	bargaining: '#a3d9b1',
	depression: '#7fc7d9',
	acceptance: '#e6c79c',
	acceptanceGold: '#dab883',
	acceptanceWarm: '#f0d6b3',

	// Supporting Aesthetic Palette
	primary: '#6b7a8f',
	secondary: '#b6a6ca',
	tertiary: '#9eb3c2',

	background: '#fffbe6',
	surface: '#f8f9fb',
	overlay: '#ffffff',

	muted: '#eaeaea',
	accent: '#c7a8cc',
	highlight: '#faf0e6',

	success: '#a3d9b1',
	warning: '#f2d089',
	error: '#faaca8',
	info: '#b8d4f0',

	// Optimized Gradients (fewer complex gradients)
	gradients: {
		sunrise: 'linear-gradient(135deg, #fffbe6 0%, #f0d6b3 30%, #e6c79c 100%)',
		ocean: 'linear-gradient(135deg, #7fc7d9 0%, #a8d8e6 50%)',
		forest: 'linear-gradient(135deg, #a3d9b1 0%, #c1e6ca 50%)',
		mist: 'linear-gradient(135deg, #f4f6fa 0%, #f8f9fb 50%)',
		ethereal: 'radial-gradient(circle, rgba(255,251,230,0.9) 0%, rgba(244,246,250,0.7) 100%)',
	},

	// Semantic Color Mappings
	semantic: {
		player1: '#7fc7d9',
		player2: '#e6c79c',
		neutral: '#b6a6ca',
		active: '#a3d9b1',
		inactive: '#eaeaea',
		danger: '#faaca8',
	}
};

// Optimized Animation System
export const GRIS_ANIMATIONS = {
	curves: {
		organic: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
		gentle: 'cubic-bezier(0.77, 0.2, 0.25, 1)',
		swift: 'cubic-bezier(0.2, 0.0, 0.38, 0.9)',
		grief: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	},

	duration: {
		instant: 150,
		swift: 300,
		gentle: 600,
		slow: 900,
		epic: 1200,
	},

	presets: {
		fadeIn: 'opacity 300ms cubic-bezier(0.77, 0.2, 0.25, 1)',
		slideUp: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
		scaleIn: 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	}
};

// Optimized Typography Scale
export const GRIS_TYPOGRAPHY = {
	fonts: {
		display: "'Cormorant Garamond', 'Times New Roman', serif",
		heading: "'Cormorant Garamond', 'Georgia', serif",
		body: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
		mono: "'JetBrains Mono', 'Consolas', monospace",
	},

	scale: {
		xs: '0.8rem',
		sm: '0.9rem',
		base: '1rem',
		lg: '1.25rem',
		xl: '1.563rem',
		'2xl': '1.953rem',
		'3xl': '2.441rem',
	},

	weights: {
		light: 300,
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},

	tracking: {
		tight: '-0.025em',
		normal: '0em',
		wide: '0.025em',
	}
};

// Optimized Spacing System (8px base grid)
export const GRIS_SPACING = {
	0: '0',
	1: '0.25rem',    // 4px
	2: '0.5rem',     // 8px
	3: '0.75rem',    // 12px
	4: '1rem',       // 16px
	5: '1.25rem',    // 20px
	6: '1.5rem',     // 24px
	8: '2rem',       // 32px
	10: '2.5rem',    // 40px
	12: '3rem',      // 48px
	16: '4rem',      // 64px
	20: '5rem',      // 80px
};

// Optimized Shadow System
export const GRIS_SHADOWS = {
	xs: '0 1px 2px 0 rgba(182, 166, 202, 0.05)',
	sm: '0 1px 3px 0 rgba(182, 166, 202, 0.1)',
	base: '0 4px 6px -1px rgba(182, 166, 202, 0.1)',
	lg: '0 10px 15px -3px rgba(182, 166, 202, 0.1)',
	xl: '0 20px 25px -5px rgba(182, 166, 202, 0.1)',
	'2xl': '0 25px 50px -12px rgba(182, 166, 202, 0.25)',

	// Colored emotional shadows
	warm: '0 8px 20px rgba(230, 199, 156, 0.2)',
	cool: '0 8px 20px rgba(127, 199, 217, 0.2)',
	mystical: '0 10px 25px rgba(182, 166, 202, 0.3)',

	// No shadow
	none: 'none',
};

// Performance Settings
export const PERFORMANCE = {
	lowFPSThreshold: 45,
	maxParticles: 24,  // Slightly increased for richer effect
	particleUpdateRate: 60,
	enableComplexAnimations: true,
	enableParticles: true,
	targetFPS: 60,
};

// Z-Index Management
export const GRIS_ZINDEX = {
	base: 0,
	docked: 10,
	dropdown: 1000,
	overlay: 1040,
	modal: 1050,
	toast: 1080,
	tooltip: 1090,
};

// Optimized Blur Effects
export const GRIS_BLUR = {
	none: '0',
	sm: '4px',
	base: '8px',
	lg: '16px',
	xl: '24px',
};

// Opacity Scale
export const GRIS_OPACITY = {
	0: '0',
	10: '0.1',
	20: '0.2',
	40: '0.4',
	50: '0.5',
	60: '0.6',
	80: '0.8',
	100: '1',
};

// Export design system
export const GRIS_DESIGN_SYSTEM = {
	colors: GRIS_COLORS,
	animations: GRIS_ANIMATIONS,
	typography: GRIS_TYPOGRAPHY,
	spacing: GRIS_SPACING,
	shadows: GRIS_SHADOWS,
	zIndex: GRIS_ZINDEX,
	blur: GRIS_BLUR,
	opacity: GRIS_OPACITY,
	performance: PERFORMANCE,
};
