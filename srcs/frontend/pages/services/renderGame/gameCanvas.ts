export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

export function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: string, color: string) {
	ctx.fillStyle = color;
	ctx.font = `${size} monospace`;
	ctx.fillText(text, x, y);
}

export function drawNet(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
	const netWidth = 4;
	const netHeight = 20;
	ctx.fillStyle = '#fff';
	for (let i = 0; i < canvas.height; i += netHeight * 2)
		ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
}