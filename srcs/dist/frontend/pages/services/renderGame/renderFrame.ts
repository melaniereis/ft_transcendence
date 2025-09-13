import { Paddle, Ball } from './types';
import { drawRect, drawCircle, drawText, drawNet } from './gameCanvas.js';

export function renderFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement,
    left: Paddle,right: Paddle, ball: Ball) {
    drawRect(ctx, 0, 0, canvas.width, canvas.height, '#000');
    drawNet(ctx, canvas);
    drawRect(ctx, left.x, left.y, left.width, left.height, '#fff');
    drawRect(ctx, right.x, right.y, right.width, right.height, '#fff');
    drawCircle(ctx, ball.x, ball.y, ball.radius, '#fff');
    drawText(ctx, `${left.nickname}: ${left.score}`, canvas.width / 4 - 50, 50, '24px', '#fff');
    drawText(ctx, `${right.nickname}: ${right.score}`, (canvas.width / 4) * 3 - 50, 50, '24px', '#fff');
}