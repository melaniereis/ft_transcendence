export function renderTournamentBracket(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  players: { id: number; name: string }[],
  winners: { semifinal1?: number; semifinal2?: number; final?: number }
) {
  if (!ctx || players.length !== 4) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16px Arial';
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';

  const positions = {
    p1: { x: 50, y: 50 },
    p2: { x: 50, y: 150 },
    p3: { x: 50, y: 250 },
    p4: { x: 50, y: 350 },
    semi1: { x: 200, y: 100 },
    semi2: { x: 200, y: 300 },
    final: { x: 350, y: 200 }
  };

  // Draw player names
  ['p1', 'p2', 'p3', 'p4'].forEach((key, index) => {
    const pos = positions[key as keyof typeof positions];
    const player = players[index];
    if (pos && player) {
      ctx.fillText(player.name, pos.x, pos.y);
    }
  });

  // Draw lines to semifinals
  ctx.beginPath();
  ctx.moveTo(positions.p1.x + 100, positions.p1.y);
  ctx.lineTo(positions.semi1.x - 10, positions.semi1.y);
  ctx.moveTo(positions.p2.x + 100, positions.p2.y);
  ctx.lineTo(positions.semi1.x - 10, positions.semi1.y);
  ctx.moveTo(positions.p3.x + 100, positions.p3.y);
  ctx.lineTo(positions.semi2.x - 10, positions.semi2.y);
  ctx.moveTo(positions.p4.x + 100, positions.p4.y);
  ctx.lineTo(positions.semi2.x - 10, positions.semi2.y);
  ctx.stroke();

  // Draw semifinal winners
  if (winners.semifinal1) {
    const winnerName = players.find(p => p.id === winners.semifinal1)?.name || 'Winner';
    ctx.fillText(winnerName, positions.semi1.x + 10, positions.semi1.y - 10);
  }

  if (winners.semifinal2) {
    const winnerName = players.find(p => p.id === winners.semifinal2)?.name || 'Winner';
    ctx.fillText(winnerName, positions.semi2.x + 10, positions.semi2.y - 10);
  }

  // Draw lines to final
  if (winners.semifinal1 && winners.semifinal2) {
    ctx.beginPath();
    ctx.moveTo(positions.semi1.x + 100, positions.semi1.y);
    ctx.lineTo(positions.final.x - 10, positions.final.y);
    ctx.moveTo(positions.semi2.x + 100, positions.semi2.y);
    ctx.lineTo(positions.final.x - 10, positions.final.y);
    ctx.stroke();
  }

  // Draw final winner
  if (winners.final) {
    const winnerName = players.find(p => p.id === winners.final)?.name || 'Champion';
    ctx.fillText(`🏆 ${winnerName}`, positions.final.x + 10, positions.final.y - 10);
  }
}
