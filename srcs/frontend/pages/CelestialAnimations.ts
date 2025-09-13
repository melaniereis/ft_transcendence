
// CelestialAnimations.ts - Gris-inspired celestial effects for main menu (multi-canvas)

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

	constructor(backgroundCanvas: HTMLCanvasElement, starsCanvas: HTMLCanvasElement, milkyWayCanvas: HTMLCanvasElement, orbsCanvas: HTMLCanvasElement) {
		this.backgroundCanvas = backgroundCanvas;
		this.starsCanvas = starsCanvas;
		this.milkyWayCanvas = milkyWayCanvas;
		this.orbsCanvas = orbsCanvas;
		this.ctxBg = backgroundCanvas.getContext('2d')!;
		this.ctx = starsCanvas.getContext('2d')!;
		this.ctxMw = milkyWayCanvas.getContext('2d')!;
		this.ctxOrbs = orbsCanvas.getContext('2d')!;
		this.resizeCanvases();
		window.addEventListener('resize', () => this.resizeCanvases());
		this.init();
		this.animate();
	}

	private resizeCanvases() {
		const dpr = window.devicePixelRatio || 1;
		[this.backgroundCanvas, this.starsCanvas, this.milkyWayCanvas, this.orbsCanvas].forEach(canvas => {
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			canvas.style.width = window.innerWidth + 'px';
			canvas.style.height = window.innerHeight + 'px';
		});
		this.ctxBg.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctxMw.setTransform(1, 0, 0, 1, 0, 0);
		this.ctxOrbs.setTransform(1, 0, 0, 1, 0, 0);
		this.ctxBg.scale(dpr, dpr);
		this.ctx.scale(dpr, dpr);
		this.ctxMw.scale(dpr, dpr);
		this.ctxOrbs.scale(dpr, dpr);
		this.init();
	}

	// --- Animation logic from user ---
	private sNumber = 600;
	private sSize = .3;
	private sSizeR = .6;
	private sAlphaR = .5;
	private sMaxHueProportion = .6;
	private shootingStarDensity = 0.01;
	private shootingStarBaseXspeed = 30;
	private shootingStarBaseYspeed = 15;
	private shootingStarBaseLength = 8;
	private shootingStarBaseLifespan = 60;
	private shootingStarsColors = ["#a1ffba", "#a1d2ff", "#fffaa1", "#ffa1a1"];
	private mwStarCount = 100000;
	private mwRandomStarProp = .2;
	private mwClusterCount = 300;
	private mwClusterStarCount = 1500;
	private mwClusterSize = 120;
	private mwClusterSizeR = 80;
	private mwClusterLayers = 10;
	private mwAngle = 0.6;
	private mwHueMin = 150;
	private mwHueMax = 300;
	private mwWhiteProportionMin = 50;
	private mwWhiteProportionMax = 65;

	private class_Star = class {
		x: number; y: number; size: number; alpha: number; baseHue: number; baseHueProportion: number;
		randomIndexa: number; randomIndexh: number; randomValue: number; color: string;
		constructor(x: number, y: number, size: number, randomArray: number[], hueArray: number[], hueArrayLength: number, randomArrayLength: number) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.alpha = size / (.3 + .6);
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
			this.color = `hsla(${rHue},100%,85%,${rAlpha})`;
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
		goingOut() { return this.framesLeft <= 0; }
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
			gradient.addColorStop(Math.min(am, .7), this.color);
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
		x: number; y: number; size: number; hue: number; baseWhiteProportion: number; brigthnessModifier: number;
		constructor(x: number, y: number, size: number, hue: number, baseWhiteProportion: number, brigthnessModifier: number) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.hue = hue;
			this.baseWhiteProportion = baseWhiteProportion;
			this.brigthnessModifier = brigthnessModifier;
		}
		draw(ctxMw: CanvasRenderingContext2D, mwClusterStarCount: number, mwClusterLayers: number) {
			let starsPerLayer = Math.floor(mwClusterStarCount / mwClusterLayers);
			for (let layer = 1; layer < mwClusterLayers; layer++) {
				let layerRadius = this.size * layer / mwClusterLayers;
				for (let i = 1; i < starsPerLayer; i++) {
					let posX = this.x + 2 * layerRadius * (Math.random() - .5);
					let posY = this.y + 2 * Math.sqrt(Math.pow(layerRadius, 2) - Math.pow(this.x - posX, 2)) * (Math.random() - .5);
					let size = .05 + Math.random() * .15;
					let alpha = .3 + Math.random() * .4;
					let whitePercentage = this.baseWhiteProportion + 15 + 15 * this.brigthnessModifier + Math.floor(Math.random() * 10);
					ctxMw.beginPath();
					ctxMw.arc(posX, posY, size, 0, Math.PI * 2, false);
					ctxMw.fillStyle = `hsla(${this.hue},100%,${whitePercentage}%,${alpha})`;
					ctxMw.fill();
				}
			}
			let gradient = ctxMw.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
			gradient.addColorStop(0, `hsla(${this.hue},100%,${this.baseWhiteProportion}%,0.002)`);
			gradient.addColorStop(0.25, `hsla(${this.hue},100%,${this.baseWhiteProportion + 30}%,${0.01 + 0.01 * this.brigthnessModifier})`);
			gradient.addColorStop(0.4, `hsla(${this.hue},100%,${this.baseWhiteProportion + 15}%,0.005)`);
			gradient.addColorStop(1, "rgba(0,0,0,0)");
			ctxMw.beginPath();
			ctxMw.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
			ctxMw.fillStyle = gradient;
			ctxMw.fill();
		}
	}

	private MilkyWayX() { return Math.floor(Math.random() * window.innerWidth); }
	private MilkyWayYFromX(xPos: number, mode: string) {
		let offset = ((window.innerWidth / 2) - xPos) * this.mwAngle;
		if (mode == "star") {
			return Math.floor(Math.pow(Math.random(), 1.2) * window.innerHeight * (Math.random() - .5) + window.innerHeight / 2 + (Math.random() - .5) * 100) + offset;
		} else {
			return Math.floor(Math.pow(Math.random(), 1.5) * window.innerHeight * .6 * (Math.random() - .5) + window.innerHeight / 2 + (Math.random() - .5) * 100) + offset;
		}
	}

	private DrawMilkyWayCanvas() {
		this.ctxMw.clearRect(0, 0, window.innerWidth, window.innerHeight);
		for (let i = 0; i < this.mwStarCount; i++) {
			this.ctxMw.beginPath();
			let xPos = this.MilkyWayX();
			let yPos = Math.random() < this.mwRandomStarProp ? Math.floor(Math.random() * window.innerHeight) : this.MilkyWayYFromX(xPos, "star");
			let size = Math.random() * .27;
			this.ctxMw.arc(xPos, yPos, size, 0, Math.PI * 2, false);
			let alpha = .4 + Math.random() * .6;
			this.ctxMw.fillStyle = `hsla(0,100%,100%,${alpha})`;
			this.ctxMw.fill();
		}
		for (let i = 0; i < this.mwClusterCount; i++) {
			let xPos = this.MilkyWayX();
			let yPos = this.MilkyWayYFromX(xPos, "cluster");
			let distToCenter = (1 - (Math.abs(xPos - window.innerWidth / 2) / (window.innerWidth / 2))) * (1 - (Math.abs(yPos - window.innerHeight / 2) / (window.innerHeight / 2)));
			let size = this.mwClusterSize + Math.random() * this.mwClusterSizeR;
			let hue = this.mwHueMin + Math.floor((Math.random() * .5 + distToCenter * .5) * (this.mwHueMax - this.mwHueMin));
			let baseWhiteProportion = this.mwWhiteProportionMin + Math.random() * (this.mwWhiteProportionMax - this.mwWhiteProportionMin);
			new this.class_MwStarCluster(xPos, yPos, size, hue, baseWhiteProportion, distToCenter).draw(this.ctxMw, this.mwClusterStarCount, this.mwClusterLayers);
		}
	}

	private init() {
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
		this.StarsArray = [];
		for (let i = 0; i < this.sNumber; i++) {
			let size = (Math.random() * this.sSizeR) + this.sSize;
			let x = Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2;
			let y = Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2;
			this.StarsArray.push(new this.class_Star(x, y, size, this.randomArray, this.hueArray, this.hueArrayLength, this.randomArrayLength));
		}
		this.ShootingStarsArray = [];
		this.DrawMilkyWayCanvas();
		// Orbs - friend's style: fixed white glowing orbs, circular movement
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const orbConfigs = [
			{ r: 32, color: '#fff', glow: 32, angle: Math.random() * Math.PI * 2, speed: 0.008 },
			{ r: 24, color: '#fff', glow: 24, angle: Math.random() * Math.PI * 2, speed: -0.006 },
			{ r: 16, color: '#fff', glow: 18, angle: Math.random() * Math.PI * 2, speed: 0.012 },
			{ r: 12, color: '#fff', glow: 12, angle: Math.random() * Math.PI * 2, speed: -0.014 },
			{ r: 8, color: '#fff', glow: 8, angle: Math.random() * Math.PI * 2, speed: 0.018 },
		];
		this.orbs = orbConfigs.map(cfg => new Orb(centerX, centerY, cfg.r, cfg.color, cfg.glow, cfg.angle, cfg.speed));
	}

	private frameCount = 0;
	private animate = () => {
		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		for (let i = 0; i < this.StarsArray.length; i++) {
			this.StarsArray[i].update(this.ctx, this.randomArray, this.hueArray, this.hueArrayLength, this.randomArrayLength, this.sAlphaR);
		}
		if (this.randomArray[this.randomArrayIterator] < this.shootingStarDensity) {
			let posX = Math.floor(Math.random() * this.starsCanvas.width);
			let posY = Math.floor(Math.random() * 150);
			let speedX = Math.floor((Math.random() - .5) * this.shootingStarBaseXspeed);
			let speedY = Math.floor(Math.random() * this.shootingStarBaseYspeed);
			let color = this.shootingStarsColors[Math.floor(Math.random() * this.shootingStarsColors.length)];
			this.ShootingStarsArray.push(new this.class_ShootingStar(posX, posY, speedX, speedY, color, this.shootingStarBaseLifespan));
		}
		let arrayIterator = this.ShootingStarsArray.length - 1;
		while (arrayIterator >= 0) {
			if (this.ShootingStarsArray[arrayIterator].goingOut() == true) {
				this.ShootingStarsArray.splice(arrayIterator, 1);
			} else {
				this.ShootingStarsArray[arrayIterator].update(this.ctx, this.shootingStarBaseLength, this.shootingStarBaseLifespan);
			}
			arrayIterator--;
		}
		if (this.randomArrayIterator + 1 >= this.randomArrayLength) {
			this.randomArrayIterator = 0;
		} else {
			this.randomArrayIterator++;
		}
		// Orbs animation - friend's style
		this.ctxOrbs.clearRect(0, 0, window.innerWidth, window.innerHeight);
		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;
		for (const orb of this.orbs) {
			orb.update(cx, cy);
			orb.draw(this.ctxOrbs);
		}
		this.animationId = requestAnimationFrame(this.animate);
	}

	public startAnimation() {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		this.animate();
	}
	public stopAnimation() {
		if (this.animationId) cancelAnimationFrame(this.animationId);
		this.animationId = 0;
	}
	public destroy() {
		this.stopAnimation();
		window.removeEventListener('resize', () => this.resizeCanvases());
	}
}

// Orb class for glowing orbs
// Orb animation system matching friend's style
class Orb {
	x: number;
	y: number;
	r: number;
	color: string;
	glow: number;
	angle: number;
	speed: number;

	constructor(x: number, y: number, r: number, color: string, glow: number, angle: number, speed: number) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
		this.glow = glow;
		this.angle = angle;
		this.speed = speed;
	}

	update(centerX: number, centerY: number) {
		this.angle += this.speed;
		// Move in a circle around center
		this.x = centerX + Math.cos(this.angle) * (220 + this.r * 2);
		this.y = centerY + Math.sin(this.angle) * (220 + this.r * 2);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = 0.85;
		ctx.shadowColor = this.color;
		ctx.shadowBlur = this.glow;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}
}

// Initialize celestial animations for main menu
export function initializeCelestialAnimations(): CelestialAnimations | null {
	const backgroundCanvas = document.getElementById('backgroundCanvas') as HTMLCanvasElement;
	const starsCanvas = document.getElementById('starsCanvas') as HTMLCanvasElement;
	const milkyWayCanvas = document.getElementById('milkyWayCanvas') as HTMLCanvasElement;
	const orbsCanvas = document.getElementById('orbsCanvas') as HTMLCanvasElement;
	if (!backgroundCanvas || !starsCanvas || !milkyWayCanvas || !orbsCanvas) {
		console.warn('Celestial canvases not found');
		return null;
	}
	return new CelestialAnimations(backgroundCanvas, starsCanvas, milkyWayCanvas, orbsCanvas);
}
