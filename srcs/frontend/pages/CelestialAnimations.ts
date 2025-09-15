// srcs/frontend/pages/CelestialAnimations.ts - Gris-inspired celestial effects for main menu (multi-canvas)

export class CelestialAnimations {
	private backgroundCanvas: HTMLCanvasElement;
	private starsCanvas: HTMLCanvasElement;
	private milkyWayCanvas: HTMLCanvasElement;
	private orbsCanvas: HTMLCanvasElement;
	private ctxBg: CanvasRenderingContext2D;
	private ctx: CanvasRenderingContext2D;
	private ctxMw: CanvasRenderingContext2D;
	private ctxOrbs: CanvasRenderingContext2D;
	private animationId: number = 0;

	// Animation state
	private randomArray: number[] = [];
	private hueArray: number[] = [];
	private StarsArray: any[] = [];
	private ShootingStarsArray: any[] = [];
	private randomArrayLength = 1000;
	private randomArrayIterator = 0;
	private hueArrayLength = 1000;

	// Orbs state
	private orbs: Orb[] = [];
	private orbCount = 8;
	private isDestroyed = false;

	constructor(backgroundCanvas: HTMLCanvasElement, starsCanvas: HTMLCanvasElement, milkyWayCanvas: HTMLCanvasElement, orbsCanvas: HTMLCanvasElement) {
		this.backgroundCanvas = backgroundCanvas;
		this.starsCanvas = starsCanvas;
		this.milkyWayCanvas = milkyWayCanvas;
		this.orbsCanvas = orbsCanvas;

		const bgCtx = backgroundCanvas.getContext('2d');
		const starsCtx = starsCanvas.getContext('2d');
		const mwCtx = milkyWayCanvas.getContext('2d');
		const orbsCtx = orbsCanvas.getContext('2d');

		if (!bgCtx || !starsCtx || !mwCtx || !orbsCtx) {
			throw new Error('Failed to get canvas contexts');
		}

		this.ctxBg = bgCtx;
		this.ctx = starsCtx;
		this.ctxMw = mwCtx;
		this.ctxOrbs = orbsCtx;

		this.resizeCanvases();
		window.addEventListener('resize', () => {
			if (!this.isDestroyed) {
				this.resizeCanvases();
			}
		});
		this.init();
		this.animate();
	}

	private resizeCanvases() {
		if (this.isDestroyed) return;

		const dpr = window.devicePixelRatio || 1;
		[this.backgroundCanvas, this.starsCanvas, this.milkyWayCanvas, this.orbsCanvas].forEach(canvas => {
			if (canvas) {
				canvas.width = window.innerWidth * dpr;
				canvas.height = window.innerHeight * dpr;
				canvas.style.width = window.innerWidth + 'px';
				canvas.style.height = window.innerHeight + 'px';
			}
		});

		// Reset transforms and scale
		[this.ctxBg, this.ctx, this.ctxMw, this.ctxOrbs].forEach(ctx => {
			if (ctx) {
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.scale(dpr, dpr);
			}
		});

		this.init();
	}

	// Animation configuration
	private sNumber = 600;
	private sSize = 0.3;
	private sSizeR = 0.6;
	private sAlphaR = 0.7; // Make stars a bit brighter
	private sMaxHueProportion = 0.6;
	private shootingStarDensity = 0.01;
	private shootingStarBaseXspeed = 30;
	private shootingStarBaseYspeed = 15;
	private shootingStarBaseLength = 8;
	private shootingStarBaseLifespan = 60;
	private shootingStarsColors = ["#a1ffba", "#a1d2ff", "#fffaa1", "#ffa1a1"];
	private mwStarCount = 100000;
	private mwRandomStarProp = 0.2;
	private mwClusterCount = 300;
	private mwClusterStarCount = 1500;
	private mwClusterSize = 120;
	private mwClusterSizeR = 80;
	private mwClusterLayers = 10;
	private mwAngle = 0.6;
	private mwHueMin = 180; // More blue/purple
	private mwHueMax = 280;
	private mwWhiteProportionMin = 65; // Brighter clusters
	private mwWhiteProportionMax = 80;

	private class_Star = class {
		x: number; y: number; size: number; alpha: number; baseHue: number; baseHueProportion: number;
		randomIndexa: number; randomIndexh: number; randomValue: number; color: string;

		constructor(x: number, y: number, size: number, randomArray: number[], hueArray: number[], hueArrayLength: number, randomArrayLength: number) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.alpha = size / (0.3 + 0.6);
			this.baseHue = hueArray[Math.floor(Math.random() * hueArrayLength)];
			this.baseHueProportion = Math.random();
			this.randomIndexa = Math.floor(Math.random() * randomArrayLength);
			this.randomIndexh = this.randomIndexa;
			this.randomValue = randomArray[this.randomIndexa];
			this.color = "";
		}

		draw(ctx: CanvasRenderingContext2D, randomArray: number[], hueArray: number[], hueArrayLength: number, randomArrayLength: number, sAlphaR: number) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
			let rAlpha = this.alpha + Math.min((this.randomValue - 0.5) * sAlphaR, 1);
			let rHue = randomArray[this.randomIndexh] > this.baseHueProportion ? hueArray[this.randomIndexa] : this.baseHue;
			this.color = `hsla(${rHue},100%,90%,${rAlpha})`; // Brighter stars
			ctx.fillStyle = this.color;
			ctx.fill();
		}

		update(ctx: CanvasRenderingContext2D, randomArray: number[], hueArray: number[], hueArrayLength: number, randomArrayLength: number, sAlphaR: number) {
			this.randomIndexh = this.randomIndexa;
			this.randomIndexa = (this.randomIndexa >= randomArrayLength - 1) ? 0 : this.randomIndexa + 1;
			this.randomValue = randomArray[this.randomIndexa];
			this.draw(ctx, randomArray, hueArray, hueArrayLength, randomArrayLength, sAlphaR);
		}
	}

	private class_ShootingStar = class {
		x: number; y: number; speedX: number; speedY: number; framesLeft: number; color: string;

		constructor(x: number, y: number, speedX: number, speedY: number, color: string, lifespan: number) {
			this.x = x;
			this.y = y;
			this.speedX = speedX;
			this.speedY = speedY;
			this.framesLeft = lifespan;
			this.color = color;
		}

		goingOut() {
			return this.framesLeft <= 0;
		}

		ageModifier(baseLifespan: number) {
			let halfLife = baseLifespan / 2.0;
			return Math.pow(1.0 - Math.abs(this.framesLeft - halfLife) / halfLife, 2);
		}

		draw(ctx: CanvasRenderingContext2D, baseLength: number, baseLifespan: number) {
			let am = this.ageModifier(baseLifespan);
			let endX = this.x - this.speedX * baseLength * am;
			let endY = this.y - this.speedY * baseLength * am;
			let gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
			gradient.addColorStop(0, "#fff");
			gradient.addColorStop(Math.min(am, 0.7), this.color);
			gradient.addColorStop(1, "rgba(0,0,0,0)");
			ctx.strokeStyle = gradient;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(endX, endY);
			ctx.stroke();
		}

		update(ctx: CanvasRenderingContext2D, baseLength: number, baseLifespan: number) {
			this.framesLeft--;
			this.x += this.speedX;
			this.y += this.speedY;
			this.draw(ctx, baseLength, baseLifespan);
		}
	}

	private class_MwStarCluster = class {
		x: number; y: number; size: number; hue: number; baseWhiteProportion: number; brightnessModifier: number;

		constructor(x: number, y: number, size: number, hue: number, baseWhiteProportion: number, brightnessModifier: number) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.hue = hue;
			this.baseWhiteProportion = baseWhiteProportion;
			this.brightnessModifier = brightnessModifier;
		}

		draw(ctxMw: CanvasRenderingContext2D, mwClusterStarCount: number, mwClusterLayers: number) {
			let starsPerLayer = Math.floor(mwClusterStarCount / mwClusterLayers);
			for (let layer = 1; layer < mwClusterLayers; layer++) {
				let layerRadius = this.size * layer / mwClusterLayers;
				for (let i = 1; i < starsPerLayer; i++) {
					let posX = this.x + 2 * layerRadius * (Math.random() - 0.5);
					let posY = this.y + 2 * Math.sqrt(Math.pow(layerRadius, 2) - Math.pow(this.x - posX, 2)) * (Math.random() - 0.5);
					let size = 0.05 + Math.random() * 0.15;
					let alpha = 0.3 + Math.random() * 0.4;
					let whitePercentage = this.baseWhiteProportion + 15 + 15 * this.brightnessModifier + Math.floor(Math.random() * 10);
					ctxMw.beginPath();
					ctxMw.arc(posX, posY, size, 0, Math.PI * 2, false);
					ctxMw.fillStyle = `hsla(260,100%,98%,${alpha})`; // Soft purple-white
					ctxMw.fill();
				}
			}
			let gradient = ctxMw.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
			gradient.addColorStop(0, `hsla(${this.hue},100%,${this.baseWhiteProportion}%,0.008)`);
			gradient.addColorStop(0.25, `hsla(${this.hue},100%,${this.baseWhiteProportion + 30}%,${0.03 + 0.01 * this.brightnessModifier})`);
			gradient.addColorStop(0.4, `hsla(${this.hue},100%,${this.baseWhiteProportion + 15}%,0.012)`);
			gradient.addColorStop(1, "rgba(0,0,0,0)");
			ctxMw.beginPath();
			ctxMw.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
			ctxMw.fillStyle = gradient;
			ctxMw.fill();
		}
	}

	private MilkyWayX() {
		return Math.floor(Math.random() * window.innerWidth);
	}

	private MilkyWayYFromX(xPos: number, mode: string) {
		let offset = ((window.innerWidth / 2) - xPos) * this.mwAngle;
		if (mode === "star") {
			return Math.floor(Math.pow(Math.random(), 1.2) * window.innerHeight * (Math.random() - 0.5) + window.innerHeight / 2 + (Math.random() - 0.5) * 100) + offset;
		} else {
			return Math.floor(Math.pow(Math.random(), 1.5) * window.innerHeight * 0.6 * (Math.random() - 0.5) + window.innerHeight / 2 + (Math.random() - 0.5) * 100) + offset;
		}
	}

	private DrawMilkyWayCanvas() {
		if (this.isDestroyed) return;

		this.ctxMw.clearRect(0, 0, window.innerWidth, window.innerHeight);

		// Draw random stars
		for (let i = 0; i < this.mwStarCount; i++) {
			this.ctxMw.beginPath();
			let xPos = this.MilkyWayX();
			let yPos = Math.random() < this.mwRandomStarProp ? Math.floor(Math.random() * window.innerHeight) : this.MilkyWayYFromX(xPos, "star");
			let size = Math.random() * 0.27;
			this.ctxMw.arc(xPos, yPos, size, 0, Math.PI * 2, false);
			let alpha = 0.6 + Math.random() * 0.4;
			this.ctxMw.fillStyle = `hsla(260,100%,98%,${alpha})`; // Soft purple-white
			this.ctxMw.fill();
		}

		// Draw clusters
		for (let i = 0; i < this.mwClusterCount; i++) {
			let xPos = this.MilkyWayX();
			let yPos = this.MilkyWayYFromX(xPos, "cluster");
			let distToCenter = (1 - (Math.abs(xPos - window.innerWidth / 2) / (window.innerWidth / 2))) * (1 - (Math.abs(yPos - window.innerHeight / 2) / (window.innerHeight / 2)));
			let size = this.mwClusterSize + Math.random() * this.mwClusterSizeR;
			let hue = this.mwHueMin + Math.floor((Math.random() * 0.5 + distToCenter * 0.5) * (this.mwHueMax - this.mwHueMin));
			let baseWhiteProportion = this.mwWhiteProportionMin + Math.random() * (this.mwWhiteProportionMax - this.mwWhiteProportionMin);
			new this.class_MwStarCluster(xPos, yPos, size, hue, baseWhiteProportion, distToCenter).draw(this.ctxMw, this.mwClusterStarCount, this.mwClusterLayers);
		}
	}

	private init() {
		if (this.isDestroyed) return;

		// Initialize random arrays
		this.randomArray = [];
		for (let i = 0; i < this.randomArrayLength; i++) {
			this.randomArray[i] = Math.random();
		}

		this.hueArray = [];
		for (let i = 0; i < this.hueArrayLength; i++) {
			let rHue = Math.floor(Math.random() * 160);
			if (rHue > 60) rHue += 110;
			this.hueArray[i] = rHue;
		}

		// Initialize stars
		this.StarsArray = [];
		for (let i = 0; i < this.sNumber; i++) {
			let size = (Math.random() * this.sSizeR) + this.sSize;
			let x = Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2;
			let y = Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2;
			this.StarsArray.push(new this.class_Star(x, y, size, this.randomArray, this.hueArray, this.hueArrayLength, this.randomArrayLength));
		}

		this.ShootingStarsArray = [];
		this.DrawMilkyWayCanvas();

		// Initialize orbs with improved distribution
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const orbConfigs = [
			{ r: 32, color: '#fff', glow: 32, angle: Math.random() * Math.PI * 2, speed: 0.008, distance: 280 },
			{ r: 24, color: '#fff', glow: 24, angle: Math.random() * Math.PI * 2, speed: -0.006, distance: 320 },
			{ r: 16, color: '#fff', glow: 18, angle: Math.random() * Math.PI * 2, speed: 0.012, distance: 260 },
			{ r: 12, color: '#fff', glow: 12, angle: Math.random() * Math.PI * 2, speed: -0.014, distance: 340 },
			{ r: 8, color: '#fff', glow: 8, angle: Math.random() * Math.PI * 2, speed: 0.018, distance: 240 },
			{ r: 20, color: '#fff', glow: 20, angle: Math.random() * Math.PI * 2, speed: 0.010, distance: 360 },
			{ r: 14, color: '#fff', glow: 14, angle: Math.random() * Math.PI * 2, speed: -0.008, distance: 300 },
			{ r: 10, color: '#fff', glow: 10, angle: Math.random() * Math.PI * 2, speed: 0.015, distance: 220 },
		];

		this.orbs = orbConfigs.map(cfg => new Orb(centerX, centerY, cfg.r, cfg.color, cfg.glow, cfg.angle, cfg.speed, cfg.distance));
	}

	private frameCount = 0;
	private animate = () => {
		if (this.isDestroyed) return;

		try {
			// Clear canvases
			this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

			// Update stars
			for (let i = 0; i < this.StarsArray.length; i++) {
				this.StarsArray[i].update(this.ctx, this.randomArray, this.hueArray, this.hueArrayLength, this.randomArrayLength, this.sAlphaR);
			}

			// Generate shooting stars
			if (this.randomArray[this.randomArrayIterator] < this.shootingStarDensity) {
				let posX = Math.floor(Math.random() * this.starsCanvas.width);
				let posY = Math.floor(Math.random() * 150);
				let speedX = Math.floor((Math.random() - 0.5) * this.shootingStarBaseXspeed);
				let speedY = Math.floor(Math.random() * this.shootingStarBaseYspeed);
				let color = this.shootingStarsColors[Math.floor(Math.random() * this.shootingStarsColors.length)];
				this.ShootingStarsArray.push(new this.class_ShootingStar(posX, posY, speedX, speedY, color, this.shootingStarBaseLifespan));
			}

			// Update shooting stars
			let arrayIterator = this.ShootingStarsArray.length - 1;
			while (arrayIterator >= 0) {
				if (this.ShootingStarsArray[arrayIterator].goingOut()) {
					this.ShootingStarsArray.splice(arrayIterator, 1);
				} else {
					this.ShootingStarsArray[arrayIterator].update(this.ctx, this.shootingStarBaseLength, this.shootingStarBaseLifespan);
				}
				arrayIterator--;
			}

			// Update random array iterator
			if (this.randomArrayIterator + 1 >= this.randomArrayLength) {
				this.randomArrayIterator = 0;
			} else {
				this.randomArrayIterator++;
			}

			// Animate orbs
			this.ctxOrbs.clearRect(0, 0, window.innerWidth, window.innerHeight);
			const cx = window.innerWidth / 2;
			const cy = window.innerHeight / 2;

			for (const orb of this.orbs) {
				orb.update(cx, cy);
				orb.draw(this.ctxOrbs);
			}

			this.frameCount++;
			this.animationId = requestAnimationFrame(this.animate);
		} catch (error) {
			console.error('Animation error:', error);
			this.stopAnimation();
		}
	}

	public startAnimation() {
		if (this.isDestroyed) return;

		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
		this.animate();
	}

	public stopAnimation() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = 0;
		}
	}

	public destroy() {
		this.isDestroyed = true;
		this.stopAnimation();

		// Clean up event listeners
		window.removeEventListener('resize', this.resizeCanvases);

		// Clear arrays
		this.StarsArray = [];
		this.ShootingStarsArray = [];
		this.orbs = [];
		this.randomArray = [];
		this.hueArray = [];

		console.log('CelestialAnimations destroyed');
	}
}

// Orb class for glowing orbs with improved movement
class Orb {
	x: number;
	y: number;
	r: number;
	color: string;
	glow: number;
	angle: number;
	speed: number;
	distance: number;
	pulsePhase: number;

	constructor(x: number, y: number, r: number, color: string, glow: number, angle: number, speed: number, distance: number = 220) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
		this.glow = glow;
		this.angle = angle;
		this.speed = speed;
		this.distance = distance;
		this.pulsePhase = Math.random() * Math.PI * 2;
	}

	update(centerX: number, centerY: number) {
		this.angle += this.speed;
		this.pulsePhase += 0.02;

		// Move in a circle around center with slight pulsing
		const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.1;
		this.x = centerX + Math.cos(this.angle) * (this.distance * pulseFactor);
		this.y = centerY + Math.sin(this.angle) * (this.distance * pulseFactor);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// Pulsing alpha effect
		const pulseAlpha = 0.7 + Math.sin(this.pulsePhase) * 0.3;
		ctx.globalAlpha = pulseAlpha;

		// Enhanced glow effect
		ctx.shadowColor = this.color;
		ctx.shadowBlur = this.glow + Math.sin(this.pulsePhase * 2) * 5;

		// Draw main orb
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();

		// Add inner glow
		const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.restore();
	}
}

// Initialize celestial animations for main menu
export function initializeCelestialAnimations(): CelestialAnimations | null {
	try {
		const backgroundCanvas = document.getElementById('backgroundCanvas') as HTMLCanvasElement;
		const starsCanvas = document.getElementById('starsCanvas') as HTMLCanvasElement;
		const milkyWayCanvas = document.getElementById('milkyWayCanvas') as HTMLCanvasElement;
		const orbsCanvas = document.getElementById('orbsCanvas') as HTMLCanvasElement;

		if (!backgroundCanvas || !starsCanvas || !milkyWayCanvas || !orbsCanvas) {
			console.warn('Celestial canvases not found');
			return null;
		}

		return new CelestialAnimations(backgroundCanvas, starsCanvas, milkyWayCanvas, orbsCanvas);
	} catch (error) {
		console.error('Failed to initialize celestial animations:', error);
		return null;
	}
}
