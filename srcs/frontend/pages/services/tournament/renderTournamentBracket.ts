import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
    ? localStorage.getItem('preferredLanguage')
    : 'en') as keyof typeof translations;
const t = translations[lang];

export function renderTournamentBracket(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    players: { id: number; name: string }[],
    winners: { semifinal1?: number; semifinal2?: number; final?: number },
    onNext?: () => void
) {
    if (!ctx || players.length !== 4) return;

    const bg = new Image();
    bg.src = 'assets/gris.jpg';

    bg.onload = () => {
        // Draw background image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // Set styles for bracket drawing
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px "Poppins", sans-serif'; // Better font style
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        const horizontalSpacing = 120; // Adjusted spacing for better alignment
        const verticalOffset = 20;

        const positions = {
            p1: { x: 50, y: 80 },
            p2: { x: 50, y: 160 },
            p3: { x: 50, y: 240 },
            p4: { x: 50, y: 320 },
            semi1: { x: 250, y: 130 },
            semi2: { x: 250, y: 290 },
            final: { x: 450, y: 210 }
        };

        // Draw player names with shadow
        ['p1', 'p2', 'p3', 'p4'].forEach((key, index) => {
            const pos = positions[key as keyof typeof positions];
            const player = players[index];
            if (pos && player) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 5;
                ctx.fillText(player.name, pos.x + horizontalSpacing, pos.y);
                ctx.shadowColor = 'transparent'; // Reset shadow
            }
        });

        // Draw lines to semifinals with a gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(positions.p1.x + horizontalSpacing, positions.p1.y);
        ctx.lineTo(positions.semi1.x, positions.semi1.y - verticalOffset);
        ctx.moveTo(positions.p2.x + horizontalSpacing, positions.p2.y);
        ctx.lineTo(positions.semi1.x, positions.semi1.y + verticalOffset);
        ctx.moveTo(positions.p3.x + horizontalSpacing, positions.p3.y);
        ctx.lineTo(positions.semi2.x, positions.semi2.y - verticalOffset);
        ctx.moveTo(positions.p4.x + horizontalSpacing, positions.p4.y);
        ctx.lineTo(positions.semi2.x, positions.semi2.y + verticalOffset);
        ctx.stroke();

        // Draw semifinal winners with bold font and highlight
        if (winners.semifinal1) {
            const winnerName = players.find(p => p.id === winners.semifinal1)?.name || 'Winner';
            ctx.fillStyle = 'gold';
            ctx.fillText(winnerName, positions.semi1.x + 10, positions.semi1.y);
            ctx.fillStyle = '#fff'; // Reset text color
        }
        if (winners.semifinal2) {
            const winnerName = players.find(p => p.id === winners.semifinal2)?.name || 'Winner';
            ctx.fillStyle = 'gold';
            ctx.fillText(winnerName, positions.semi2.x + 10, positions.semi2.y);
            ctx.fillStyle = '#fff'; // Reset text color
        }

        // Draw lines to final
        if (winners.semifinal1 && winners.semifinal2) {
            ctx.beginPath();
            ctx.moveTo(positions.semi1.x + horizontalSpacing, positions.semi1.y);
            ctx.lineTo(positions.final.x, positions.final.y - verticalOffset);
            ctx.moveTo(positions.semi2.x + horizontalSpacing, positions.semi2.y);
            ctx.lineTo(positions.final.x, positions.final.y + verticalOffset);
            ctx.stroke();
        }

        // Draw final winner
        if (winners.final) {
            const winnerName = players.find(p => p.id === winners.final)?.name || 'Champion';
            ctx.fillStyle = 'gold';
            ctx.fillText(`🏆 ${winnerName}`, positions.final.x + 10, positions.final.y);
            ctx.fillStyle = '#fff'; // Reset text color
        }

        // Create button
        const parent = document.getElementById('bracket-wrapper');
        if (!parent) return;

        const existingButton = parent.querySelector('.next-match-btn');
        if (existingButton) existingButton.remove();

		const button = document.createElement('button');
        if (!winners.semifinal1 && !winners.semifinal2 && !winners.final)
            button.textContent = t.startTournament; // Translation for 'Start Tournament'
        else if ((winners.semifinal1 && !winners.semifinal2) || (!winners.semifinal1 && winners.semifinal2))
            button.textContent = t.nextSemifinal; // Translation for 'Next Semifinal'
        else if (winners.semifinal1 && winners.semifinal2 && !winners.final)
            button.textContent = t.goToFinal; // Translation for 'Go to Final'
        else if (winners.final)
            button.textContent = t.tournamentFinished; 

        button.className = 'next-match-btn';
        button.style.display = 'block';
        button.style.margin = '10px auto';
        button.style.padding = '8px 16px';
        button.style.fontSize = '18px';
        button.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s ease';
        
        button.onmouseover = () => {
            button.style.backgroundColor = '#28a745';
        };
        
        button.onmouseleave = () => {
            button.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
        };

        button.onclick = () => {
            button.remove();
            if (onNext) onNext();
        };

        parent.appendChild(button);
    };
}
