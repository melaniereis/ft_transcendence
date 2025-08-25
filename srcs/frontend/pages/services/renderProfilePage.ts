export async function renderProfilePage(container: HTMLElement) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        container.innerHTML = '<p>Please log in to view your profile.</p>';
        return;
    }

    const response = await fetch('/api/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        container.innerHTML = '<p>Failed to fetch user profile.</p>';
        return;
    }

    const p = await response.json();
    container.innerHTML = `
        <h2>Profile</h2>
        <img src="${p.avatar_url}" width="100"/>
        <p>@${p.username}</p>
        <p>${p.display_name||p.name}</p>
        <p>Email: ${p.email||'–'}</p>
        <p>Team: ${p.team}</p>

        <h3>Stats</h3>
        <div id="stats"></div>
        <h3>History</h3>
        <ul id="history"></ul>
    `;
    //stats
    const s = await fetch('/api/stats/${p.id}');
    const st = await s.json();
    document.getElementById('stats')!.innerHTML = `
        Matches: ${st.matches}, Wins: ${st.wins}, Losses: ${st.losses}, Win Rate: ${st.win_rate}%
    `;
    //history
    const h = await fetch('/api/match-history', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const hi = await h.json();
    document.getElementById('history')!.innerHTML = hi.map((m: any) => `<li>${m.opponent}: ${m.winner ? 'Win' : 'Loss'}</li>`).join('');
}