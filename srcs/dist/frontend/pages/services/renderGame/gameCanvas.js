export function drawRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
export function drawCircle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}
export function drawText(ctx, text, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.font = `${size} monospace`;
    ctx.fillText(text, x, y);
}
export function drawNet(ctx, canvas) {
    const netWidth = 4;
    const netHeight = 20;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < canvas.height; i += netHeight * 2)
        ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
}
