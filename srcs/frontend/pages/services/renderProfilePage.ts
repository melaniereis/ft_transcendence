//services/renderProfilePage.ts
import { updateFriendRequestsBadge } from '../index.js';

export async function renderProfilePage(container: HTMLElement) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        container.innerHTML = '<p>Please log in to view your profile.</p>';
        return;
    }

    try {
        // 🔥 Get profile
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
        
        // 🔥 Render HTML
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

            <h3>👥 Friends</h3>
            
            <!-- 🔥 ADD FRIEND SECTION -->
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input 
                        type="text" 
                        id="friend-username-input" 
                        placeholder="Enter username to add friend..." 
                        style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                    >
                    <button 
                        id="add-friend-btn" 
                        style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Add Friend
                    </button>
                </div>
                <div id="add-friend-result" style="margin-top: 10px; font-size: 14px;"></div>
            </div>

            <!-- 🔥 FRIENDS LIST -->
            <div id="friends" style="margin: 10px 0;">
                <p>Loading friends...</p>
            </div>

            <!-- 🔥 NOTIFICATION AREA -->
            <div id="notification" style="display: none; position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 1000;"></div>
        `;

        // 🔥 SETUP ADD FRIEND FUNCTIONALITY
        setupAddFriend(token);

        // 🔥 Get user stats
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

        // 🔥 Get history match
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

        // 🔥 LOAD FRIENDS LIST
        loadFriendsList(token);

    } catch (error) {
        console.error('Error loading profile:', error);
        container.innerHTML = '<p>An error occurred while loading your profile.</p>';
    }
}

// 🔥 SETUP ADD FRIEND FUNCTIONALITY
function setupAddFriend(token: string) {
    const addBtn = document.getElementById('add-friend-btn') as HTMLButtonElement;
    const input = document.getElementById('friend-username-input') as HTMLInputElement;
    const resultDiv = document.getElementById('add-friend-result') as HTMLDivElement;

    const handleAddFriend = async () => {
        const username = input.value.trim();
        if (!username) {
            showResult(resultDiv, 'Please enter a username', 'error');
            return;
        }

        try {
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ friendUsername: username })
            });

            const result = await response.json();

            if (response.ok) {
                showResult(resultDiv, `Friend request sent to ${username}!`, 'success');
                input.value = '';
                // Refresh friends list after adding
                setTimeout(() => loadFriendsList(token), 1000);
            } else {
                showResult(resultDiv, result.error || 'Failed to send friend request', 'error');
            }
        } catch (error) {
            showResult(resultDiv, 'Network error occurred', 'error');
        }
    };

    addBtn.addEventListener('click', handleAddFriend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddFriend();
        }
    });
}

// 🔥 LOAD FRIENDS LIST WITH REMOVE FUNCTIONALITY
async function loadFriendsList(token: string) {
    try {
        const friendsResponse = await fetch('/api/friends', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            const friendsList = friendsData.friends || [];
            
            if (friendsList.length > 0) {
                document.getElementById('friends')!.innerHTML = `
                    <ul style="list-style: none; padding: 0;">
                        ${friendsList.map((friend: any) => `
                            <li class="friend-item" data-friend-id="${friend.friend_id}" data-friend-name="${friend.display_name || friend.name}" 
                                style="padding: 12px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px; position: relative; cursor: pointer; transition: background-color 0.2s;">
                                <div class="friend-info">
                                    <strong>${friend.display_name || friend.name}</strong> (@${friend.username})
                                    <br><small>Team: ${friend.team}</small>
                                    <br><small>Status: ${friend.online_status ? '🟢 Online' : '🔴 Offline'}</small>
                                </div>
                                <button class="remove-friend-btn" 
                                        style="display: none; position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px;"
                                        title="Remove friend">
                                    ×
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                `;

                // 🔥 SETUP HOVER EFFECTS AND REMOVE FUNCTIONALITY
                setupFriendItemHover(token);
            } else {
                document.getElementById('friends')!.innerHTML = '<p>No friends added yet.</p>';
            }
        } else {
            document.getElementById('friends')!.innerHTML = '<p>Failed to load friends list.</p>';
        }
    } catch (error) {
        document.getElementById('friends')!.innerHTML = '<p>Error loading friends.</p>';
    }
}

// 🔥 SETUP FRIEND ITEM HOVER AND REMOVE
function setupFriendItemHover(token: string) {
    const friendItems = document.querySelectorAll('.friend-item');
    
    friendItems.forEach(item => {
        const removeBtn = item.querySelector('.remove-friend-btn') as HTMLButtonElement;
        
        // Show/hide remove button on hover
        item.addEventListener('mouseenter', () => {
            removeBtn.style.display = 'block';
            (item as HTMLElement).style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', () => {
            removeBtn.style.display = 'none';
            (item as HTMLElement).style.backgroundColor = 'white';
        });
        
        // Handle remove friend click
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const friendId = item.getAttribute('data-friend-id');
            const friendName = item.getAttribute('data-friend-name');
            
            if (friendId && friendName) {
                showRemoveConfirmation(friendId, friendName, token);
            }
        });
    });
}

// 🔥 SHOW REMOVE CONFIRMATION POPUP
function showRemoveConfirmation(friendId: string, friendName: string, token: string) {
    const confirmed = confirm(`Tens a certeza que queres remover ${friendName} da tua lista de amigos?`);
    
    if (confirmed) {
        removeFriend(friendId, friendName, token);
    }
}

// 🔥 REMOVE FRIEND API CALL
async function removeFriend(friendId: string, friendName: string, token: string) {
    try {
        const response = await fetch(`/api/friends/${friendId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification(`${friendName} foi removido da tua lista de amigos`, 'success');
            // Refresh friends list
            loadFriendsList(token);
        } else {
            const result = await response.json();
            showNotification(result.error || 'Failed to remove friend', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
    }
}

// 🔥 UTILITY FUNCTIONS
function showResult(element: HTMLElement, message: string, type: 'success' | 'error') {
    element.textContent = message;
    element.style.color = type === 'success' ? 'green' : 'red';
    
    // Clear message after 3 seconds
    setTimeout(() => {
        element.textContent = '';
    }, 3000);
}

function showNotification(message: string, type: 'success' | 'error') {
    const notification = document.getElementById('notification') as HTMLDivElement;
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Refresh friend requests badge)
updateFriendRequestsBadge();
