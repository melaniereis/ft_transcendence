import { translations } from '../language/translations.js';
import { GRIS_COLORS } from '../renderGame/constants.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderTournamentBracket(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
players: { id: number; name: string }[], winners: { semifinal1?: number; semifinal2?: number; final?: number },
onNext?: () => void) {
	if (!ctx || players.length !== 4) return;

	// Modern GRIS-inspired bracket background
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	bgGradient.addColorStop(0, 'rgba(255,251,230,0.98)');
	bgGradient.addColorStop(0.5, GRIS_COLORS.surface);
	bgGradient.addColorStop(1, 'rgba(182,166,202,0.25)');
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Responsive layout constants
	const w = canvas.width;
	const h = canvas.height;
	const marginX = w * 0.06;
	const marginY = h * 0.08;
	const slotW = w * 0.22;
	const slotH = h * 0.11;
	const roundGap = w * 0.28;
	const semiGap = h * 0.19;

	ctx.font = `bold ${Math.max(16, Math.round(h * 0.07))}px "Poppins", sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineWidth = Math.max(2, w * 0.008);

	const positions = {
		p1: { x: marginX, y: marginY },
		p2: { x: marginX, y: marginY + semiGap },
		p3: { x: marginX, y: marginY + semiGap * 2 },
		p4: { x: marginX, y: marginY + semiGap * 3 },
		semi1: { x: marginX + roundGap, y: marginY + semiGap / 2 },
		semi2: { x: marginX + roundGap, y: marginY + semiGap * 2.5 },
		final: { x: marginX + roundGap * 2, y: marginY + semiGap * 1.5 },
	};

	// Draw player slots: large, rounded, with soft shadow
	(['p1', 'p2', 'p3', 'p4'] as (keyof typeof positions)[]).forEach((key, idx) => {
		const pos = positions[key];
		const player = players[idx];
		if (pos && player) {
			ctx.save();
			ctx.shadowColor = 'rgba(182,166,202,0.22)';
			ctx.shadowBlur = 18;
			ctx.fillStyle = 'rgba(255,255,255,0.98)';
			ctx.strokeStyle = GRIS_COLORS.primary;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y - slotH / 2);
			ctx.lineTo(pos.x + slotW, pos.y - slotH / 2);
			ctx.quadraticCurveTo(pos.x + slotW + 18, pos.y, pos.x + slotW, pos.y + slotH / 2);
			ctx.lineTo(pos.x, pos.y + slotH / 2);
			ctx.quadraticCurveTo(pos.x - 18, pos.y, pos.x, pos.y - slotH / 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.shadowBlur = 0;
			ctx.fillStyle = GRIS_COLORS.primary;
			ctx.font = 'bold 22px "Poppins", sans-serif';
			ctx.fillText(player.name, pos.x + slotW / 2, pos.y);
			ctx.restore();
		}
	});

	// Draw bracket lines with smooth curves and GRIS gradient
	const lineGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	lineGradient.addColorStop(0, GRIS_COLORS.secondary);
	lineGradient.addColorStop(1, GRIS_COLORS.tertiary);
	ctx.strokeStyle = lineGradient;
	ctx.lineWidth = 4;
	ctx.beginPath();
	// p1 -> semi1
	ctx.moveTo(positions.p1.x + slotW, positions.p1.y);
	ctx.bezierCurveTo(
		positions.p1.x + slotW + 40, positions.p1.y,
		positions.semi1.x - 40, positions.semi1.y,
		positions.semi1.x, positions.semi1.y
	);
	// p2 -> semi1
	ctx.moveTo(positions.p2.x + slotW, positions.p2.y);
	ctx.bezierCurveTo(
		positions.p2.x + slotW + 40, positions.p2.y,
		positions.semi1.x - 40, positions.semi1.y,
		positions.semi1.x, positions.semi1.y
	);
	// p3 -> semi2
	ctx.moveTo(positions.p3.x + slotW, positions.p3.y);
	ctx.bezierCurveTo(
		positions.p3.x + slotW + 40, positions.p3.y,
		positions.semi2.x - 40, positions.semi2.y,
		positions.semi2.x, positions.semi2.y
	);
	// p4 -> semi2
	ctx.moveTo(positions.p4.x + slotW, positions.p4.y);
	ctx.bezierCurveTo(
		positions.p4.x + slotW + 40, positions.p4.y,
		positions.semi2.x - 40, positions.semi2.y,
		positions.semi2.x, positions.semi2.y
	);
	ctx.stroke();

	// Draw semifinal winners with gold highlight and large slot
	if (winners.semifinal1) {
		const winnerName = players.find(p => p.id === winners.semifinal1)?.name || 'Winner';
		const pos = positions.semi1;
		ctx.save();
		ctx.shadowColor = GRIS_COLORS.acceptanceGold;
		ctx.shadowBlur = 22;
		ctx.fillStyle = 'rgba(255,255,220,0.98)';
		ctx.strokeStyle = GRIS_COLORS.acceptanceGold;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y - slotH / 2);
		ctx.lineTo(pos.x + slotW, pos.y - slotH / 2);
		ctx.quadraticCurveTo(pos.x + slotW + 22, pos.y, pos.x + slotW, pos.y + slotH / 2);
		ctx.lineTo(pos.x, pos.y + slotH / 2);
		ctx.quadraticCurveTo(pos.x - 22, pos.y, pos.x, pos.y - slotH / 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;
		ctx.fillStyle = GRIS_COLORS.acceptanceGold;
		ctx.font = 'bold 22px "Poppins", sans-serif';
		ctx.fillText(winnerName, pos.x + slotW / 2, pos.y);
		ctx.restore();
	}
	if (winners.semifinal2) {
		const winnerName = players.find(p => p.id === winners.semifinal2)?.name || 'Winner';
		const pos = positions.semi2;
		ctx.save();
		ctx.shadowColor = GRIS_COLORS.acceptanceGold;
		ctx.shadowBlur = 22;
		ctx.fillStyle = 'rgba(255,255,220,0.98)';
		ctx.strokeStyle = GRIS_COLORS.acceptanceGold;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y - slotH / 2);
		ctx.lineTo(pos.x + slotW, pos.y - slotH / 2);
		ctx.quadraticCurveTo(pos.x + slotW + 22, pos.y, pos.x + slotW, pos.y + slotH / 2);
		ctx.lineTo(pos.x, pos.y + slotH / 2);
		ctx.quadraticCurveTo(pos.x - 22, pos.y, pos.x, pos.y - slotH / 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;
		ctx.fillStyle = GRIS_COLORS.acceptanceGold;
		ctx.font = 'bold 22px "Poppins", sans-serif';
		ctx.fillText(winnerName, pos.x + slotW / 2, pos.y);
		ctx.restore();
	}

	// Draw lines to final with smooth curves
	if (winners.semifinal1 && winners.semifinal2) {
		ctx.strokeStyle = lineGradient;
		ctx.lineWidth = 4.5;
		ctx.beginPath();
		ctx.moveTo(positions.semi1.x + slotW, positions.semi1.y);
		ctx.bezierCurveTo(
			positions.semi1.x + slotW + 40, positions.semi1.y,
			positions.final.x - 40, positions.final.y,
			positions.final.x, positions.final.y
		);
		ctx.moveTo(positions.semi2.x + slotW, positions.semi2.y);
		ctx.bezierCurveTo(
			positions.semi2.x + slotW + 40, positions.semi2.y,
			positions.final.x - 40, positions.final.y,
			positions.final.x, positions.final.y
		);
		ctx.stroke();
	}

	// Draw final winner with trophy and gold highlight
	if (winners.final) {
		const winnerName = players.find(p => p.id === winners.final)?.name || 'Champion';
		const pos = positions.final;
		ctx.save();
		ctx.shadowColor = GRIS_COLORS.acceptanceGold;
		ctx.shadowBlur = 32;
		ctx.fillStyle = 'rgba(255,255,220,0.99)';
		ctx.strokeStyle = GRIS_COLORS.acceptanceGold;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y - slotH / 1.2);
		ctx.lineTo(pos.x + slotW + 20, pos.y - slotH / 1.2);
		ctx.quadraticCurveTo(pos.x + slotW + 38, pos.y, pos.x + slotW + 20, pos.y + slotH / 1.2);
		ctx.lineTo(pos.x, pos.y + slotH / 1.2);
		ctx.quadraticCurveTo(pos.x - 38, pos.y, pos.x, pos.y - slotH / 1.2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;
		ctx.fillStyle = GRIS_COLORS.acceptanceGold;
		ctx.font = 'bold 26px "Poppins", sans-serif';
		ctx.fillText(`🏆 ${winnerName}`, pos.x + (slotW + 20) / 2, pos.y);
		ctx.restore();
	}

	// Create button
	const parent = document.getElementById('bracket-wrapper');
	if (!parent) return;

	const existingButton = parent.querySelector('.next-match-btn');
	if (existingButton) existingButton.remove();

	const button = document.createElement('button');
	if (!winners.semifinal1 && !winners.semifinal2 && !winners.final)
		button.textContent = t.startTournament;
	else if ((winners.semifinal1 && !winners.semifinal2) || (!winners.semifinal1 && winners.semifinal2))
		button.textContent = t.nextSemifinal;
	else if (winners.semifinal1 && winners.semifinal2 && !winners.final)
		button.textContent = t.goToFinal;
	else if (winners.final)
		button.textContent = t.tournamentFinished;

	button.className = 'next-match-btn';
	button.style.display = 'block';
	button.style.margin = '10px auto';
	button.style.padding = '10px 22px';
	button.style.fontSize = '18px';
	button.style.background = GRIS_COLORS.gradients.sunrise;
	button.style.color = GRIS_COLORS.primary;
	button.style.border = `2px solid ${GRIS_COLORS.primary}`;
	button.style.borderRadius = '1rem';
	button.style.boxShadow = '0 4px 16px rgba(44,34,84,0.10)';
	button.style.cursor = 'pointer';
	button.style.transition = 'background 0.3s, color 0.3s';

	button.onmouseover = () => {
		button.style.background = GRIS_COLORS.gradients.ocean;
		button.style.color = '#fff';
	};
	button.onmouseleave = () => {
		button.style.background = GRIS_COLORS.gradients.sunrise;
		button.style.color = GRIS_COLORS.primary;
	};

	button.onclick = () => {
		button.remove();
		if (onNext) onNext();
	};

	parent.appendChild(button);
}