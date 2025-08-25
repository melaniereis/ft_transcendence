//services/renderProfilePage.ts
export async function renderProfilePage(container: HTMLElement) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        container.innerHTML = '<p>Please log in to view your profile.</p>';
        return;
    }

    try {
        // 🔥 Buscar perfil do utilizador
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            container.innerHTML = '<p>Failed to fetch user profile.</p>';
            return;
        }

        const profile = await response.json();
        
        // 🔥 Renderizar HTML do perfil
        container.innerHTML = `
            <h2>Profile</h2>
            <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0;">
                <img src="${profile.avatar_url || '/assets/default-avatar.png'}" width="100" alt="Avatar"/>
                <div>
                    <h3>@${profile.username}</h3>
                    <p><strong>Name:</strong> ${profile.display_name || profile.name}</p>
                    <p><strong>Email:</strong> ${profile.email || 'Not provided'}</p>
                    <p><strong>Team:</strong> ${profile.team}</p>
                    <p><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <h3>📊 Statistics</h3>
            <div id="stats" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p>Loading statistics...</p>
            </div>
            
            <h3>🏆 Match History</h3>
            <div id="history" style="margin: 10px 0;">
                <p>Loading match history...</p>
            </div>
        `;

        // 🔥 Buscar estatísticas do utilizador (URL corrigida)
        const statsResponse = await fetch(`/stats/${profile.id}`);
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('stats')!.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div><strong>Matches Played:</strong> ${stats.matches_played}</div>
                    <div><strong>Wins:</strong> ${stats.matches_won}</div>
                    <div><strong>Losses:</strong> ${stats.matches_lost}</div>
                    <div><strong>Win Rate:</strong> ${(stats.win_rate * 100).toFixed(1)}%</div>
                    <div><strong>Points Scored:</strong> ${stats.points_scored}</div>
                    <div><strong>Points Conceded:</strong> ${stats.points_conceded}</div>
                    <div><strong>Tournaments:</strong> ${stats.tournaments_won}</div>
                </div>
            `;
        } else {
            document.getElementById('stats')!.innerHTML = '<p>No statistics available.</p>';
        }

        // 🔥 Buscar histórico de partidas
        const historyResponse = await fetch('/api/match-history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (historyResponse.ok) {
            const history = await historyResponse.json();
            
            if (history.length > 0) {
                document.getElementById('history')!.innerHTML = `
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: #f0f0f0;">
                                <tr>
                                    <th style="padding: 10px; border-bottom: 1px solid #ddd;">Date</th>
                                    <th style="padding: 10px; border-bottom: 1px solid #ddd;">Opponent</th>
                                    <th style="padding: 10px; border-bottom: 1px solid #ddd;">Score</th>
                                    <th style="padding: 10px; border-bottom: 1px solid #ddd;">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.map((match: any) => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px;">${new Date(match.date_played).toLocaleDateString()}</td>
                                        <td style="padding: 8px;">Player ${match.opponent_id}</td>
                                        <td style="padding: 8px;">${match.user_score} - ${match.opponent_score}</td>
                                        <td style="padding: 8px;">
                                            <span style="color: ${match.result === 'win' ? 'green' : 'red'}; font-weight: bold;">
                                                ${match.result.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                document.getElementById('history')!.innerHTML = '<p>No match history available.</p>';
            }
        } else {
            document.getElementById('history')!.innerHTML = '<p>Failed to load match history.</p>';
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        container.innerHTML = '<p>An error occurred while loading your profile.</p>';
    }
}
