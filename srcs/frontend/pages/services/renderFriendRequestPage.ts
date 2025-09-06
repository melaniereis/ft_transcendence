//services/renderFriendRequestPage.ts
import { updateFriendRequestsBadge } from '../index.js';
// Import team logos and SVG icon helpers from profile page templates
// Team logo mapping (copied from templates.ts)
const TEAM_LOGOS = {
	'HACKTIVISTS': '/assets/hacktivists.png',
	'BUG BUSTERS': '/assets/bugbusters.png',
	'LOGIC LEAGUE': '/assets/logicleague.png',
	'CODE ALLIANCE': '/assets/codealliance.png'
};

// SVG ICON HELPERS (local, for requests page)
function svgInboxIcon() {
	return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b6a6ca" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>`;
}
function svgBackIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
}
function svgAcceptIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}
function svgRejectIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`;
}

export async function renderFriendRequestsPage(container: HTMLElement) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = '<p>Please log in to view friend requests.</p>';
		return;
	}

	// OUTSTANDING VISUALS: Gradient, glassmorphism, avatars, SVG icons, custom CSS
	container.innerHTML = `
        <div class="amazing-friend-requests-bg" style="min-height:100vh;padding:0;margin:0;position:relative;background:linear-gradient(135deg,#7fc7d9 0%,#e6c79c 100%);">
            <div style="max-width:700px;margin:40px auto 0 auto;padding:32px 24px 48px 24px;border-radius:32px;background:rgba(255,255,255,0.55);box-shadow:0 16px 48px #b6a6ca33,0 2px 12px #7fc7d933;backdrop-filter:blur(12px) saturate(1.2);border:2px solid #eaeaea;position:relative;">
                <h2 style="text-align:center;font-size:2.4rem;font-weight:900;color:#6b7a8f;letter-spacing:1px;margin-bottom:18px;text-shadow:0 2px 16px #e6c79c88;">👥 Friend Requests</h2>
                <div id="pending-requests" style="margin: 20px 0;">
                    <h3 style="font-size:1.3rem;font-weight:700;color:#b6a6ca;margin-bottom:18px;text-align:center;">${svgInboxIcon()} Pending Requests</h3>
                    <div id="pending-list">
                        <div class="amazing-loader" style="text-align:center;padding:32px 0;color:#b6a6ca;font-size:18px;">Loading pending requests...</div>
                    </div>
                </div>
                                <button id="back-to-profile" class="envelope-btn" title="Back to Profile" style="display:block;margin:32px auto 0 auto;background:transparent;border:none;cursor:pointer;">
                                    <span style="display:inline-block;">
                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="8" y="16" width="48" height="32" rx="8" fill="#f8f9f8" stroke="#b6a6ca" stroke-width="3"/>
                                            <polyline points="8,16 32,40 56,16" fill="none" stroke="#7fc7d9" stroke-width="3"/>
                                            <polyline points="8,48 32,28 56,48" fill="none" stroke="#e6c79c" stroke-width="3"/>
                                            <circle cx="32" cy="32" r="3.5" fill="#b6a6ca"/>
                                        </svg>
                                    </span>
                                </button>
                <div id="notification" style="display:none;position:fixed;top:32px;right:32px;background:linear-gradient(90deg,#a3d9b1 0%,#e6c79c 100%);color:#23272f;padding:18px 32px;border-radius:16px;box-shadow:0 4px 24px #7fc7d988;z-index:1000;font-size:1.1rem;font-weight:700;letter-spacing:0.5px;opacity:0.98;"></div>
            </div>
            <style>
				.envelope-btn {
					background: transparent;
					border: none;
					cursor: pointer;
					transition: transform 0.18s, box-shadow 0.18s;
					display: block;
					margin: 32px auto 0 auto;
					outline: none;
				}
				.envelope-btn:hover svg {
					transform: scale(1.08) rotate(-2deg);
					box-shadow: 0 8px 32px #b6a6ca44;
					filter: drop-shadow(0 4px 16px #7fc7d988);
				}
				.envelope-btn:active svg {
					transform: scale(0.98);
					filter: brightness(0.95);
				}
				.amazing-request-card {
                    background: rgba(255,255,255,0.75);
                    border-radius: 22px;
                    box-shadow: 0 8px 32px 0 #b6a6ca33, 0 1.5px 8px #7fc7d933;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 18px 22px 18px 18px;
                    position: relative;
                    min-height: 90px;
                    overflow: hidden;
                    backdrop-filter: blur(8px) saturate(1.2);
                    border: 1.5px solid #eaeaea;
                    transition: box-shadow 0.25s, transform 0.18s;
                    cursor: pointer;
                    z-index: 1;
                }
                .amazing-request-card:hover {
                    box-shadow: 0 16px 48px 0 #b6a6ca55, 0 2px 12px #7fc7d955;
                    transform: translateY(-2px) scale(1.035) rotate(-0.5deg);
                    border-color: #b6a6ca;
                }
                .amazing-avatar-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 56px;
                }
                .amazing-avatar {
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #b6a6ca;
                    box-shadow: 0 2px 8px #b6a6ca22;
                    width: 56px;
                    height: 56px;
                    background: #fff;
                    transition: border 0.2s, box-shadow 0.2s;
                }
                .amazing-request-card:hover .amazing-avatar {
                    border: 3px solid #7fc7d9;
                    box-shadow: 0 4px 16px #7fc7d955;
                }
                .amazing-team-logo {
                    position: absolute;
                    bottom: -8px;
                    right: -14px;
                    border-radius: 50%;
                    border: 2.5px solid #fff;
                    background: #fff;
                    box-shadow: 0 2px 8px #b6a6ca22;
                    width: 30px;
                    height: 30px;
                    z-index: 2;
                    transition: transform 0.18s;
                }
                .amazing-request-card:hover .amazing-team-logo {
                    transform: scale(1.08) rotate(-8deg);
                }
                .amazing-status-dot {
                    position: absolute;
                    left: -7px;
                    bottom: 2px;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    border: 2.5px solid #fff;
                    z-index: 2;
                    transition: background 0.2s, box-shadow 0.2s;
                }
                .amazing-request-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .amazing-request-name {
                    font-weight: 800;
                    font-size: 18px;
                    color: #6b7a8f;
                    letter-spacing: 0.2px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    text-shadow: 0 1px 8px #fff8;
                }
                .amazing-request-username {
                    font-size: 13px;
                    color: #b6a6ca;
                    opacity: 0.85;
                    font-weight: 600;
                    letter-spacing: 0.1px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                .amazing-action-btn {
                    background: linear-gradient(90deg,#a3d9b1 0%,#7fc7d9 100%);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    padding: 10px 18px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 2px 8px #7fc7d988;
                    margin-left: 8px;
                    transition: background 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .amazing-action-btn.reject {
                    background: linear-gradient(90deg,#ff5c5c 0%,#e6a06c 100%);
                }
                .amazing-action-btn:hover {
                    background: #00e68a;
                    box-shadow: 0 4px 16px #00d56388;
                }
                .amazing-action-btn.reject:hover {
                    background: #ff2d2d;
                    box-shadow: 0 4px 16px #ff5c5c55;
                }
                @media (max-width: 700px) {
                    .amazing-request-card {padding: 14px 10px 14px 10px;}
                    .amazing-avatar {width: 44px;height: 44px;}
                    .amazing-team-logo {width: 22px;height: 22px;}
                    .amazing-request-name {font-size: 16px;}
                    .amazing-request-username {font-size: 12px;}
                }
                @media (max-width: 480px) {
                    .amazing-request-card {flex-direction: column;align-items: flex-start;padding: 10px 4px;}
                    .amazing-avatar {width: 36px;height: 36px;}
                    .amazing-team-logo {width: 16px;height: 16px;}
                    .amazing-request-name {font-size: 14px;}
                    .amazing-request-username {font-size: 11px;}
                }
            </style>
        </div>
        </div>
        `;

	// 🔥 Setup back button
	document.getElementById('back-to-profile')!.addEventListener('click', async () => {
		const { renderProfilePage } = await import('./renderProfilePage/profile.js');
		container.innerHTML = '';
		renderProfilePage(container);
	});

	// 🔥 Load pending requests
	loadPendingRequests(token);
}

// 🔥 Load Pending Requests
async function loadPendingRequests(token: string) {
	try {
		const response = await fetch('/api/friends/pending', {
			headers: { 'Authorization': `Bearer ${token}` }
		});

		if (response.ok) {
			const data = await response.json();
			const pendingRequests = data.pending || [];

			if (pendingRequests.length > 0) {
				document.getElementById('pending-list')!.innerHTML = `
                                    <div style="display:flex;flex-direction:column;gap:18px;">
                                        ${pendingRequests.map((request: any) => {
					const avatar = request.avatar_url || '/assets/avatar/default.png';
					const team = request.team ? request.team.toUpperCase() : '';
					let teamLogo = '';
					if (team && Object.prototype.hasOwnProperty.call(TEAM_LOGOS as Record<string, string>, team)) {
						teamLogo = (TEAM_LOGOS as Record<string, string>)[team];
					}
					const online = !!request.online_status;
					return `
                                                <div class="amazing-request-card">
                                                    <div class="amazing-avatar-wrap">
                                                        <img src="${avatar}" width="56" height="56" class="amazing-avatar" alt="Avatar"/>
                                                        ${teamLogo ? `<img src="${teamLogo}" width="30" height="30" class="amazing-team-logo" alt="Team Logo"/>` : ''}
                                                        <span class="amazing-status-dot" style="background:${online ? '#4be17b' : '#b6a6ca'};box-shadow:0 0 8px 2px ${online ? '#4be17b88' : '#b6a6ca55'}"></span>
                                                    </div>
                                                    <div class="amazing-request-info">
                                                        <div class="amazing-request-name">${request.display_name || request.name || 'Unknown'}</div>
                                                        <div class="amazing-request-username">@${request.username}</div>
                                                        <div style="font-size:12px;color:#b6a6ca;margin-top:4px;">Team: ${request.team || '—'} • Sent: ${new Date(request.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <div style="display:flex;gap:8px;align-items:center;">
                                                        <button class="accept-btn amazing-action-btn" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}" title="Accept friend request">
                                                            ${svgAcceptIcon()} Accept
                                                        </button>
                                                        <button class="reject-btn amazing-action-btn reject" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}" title="Reject friend request">
                                                            ${svgRejectIcon()} Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            `;
				}).join('')}
                                    </div>
                                `;
				setupPendingRequestButtons(token);
			} else {
				document.getElementById('pending-list')!.innerHTML = `<div style="padding:32px 0;text-align:center;color:#b6a6ca;font-size:16px;letter-spacing:0.5px;">No pending friend requests.</div>`;
			}
		} else {
			document.getElementById('pending-list')!.innerHTML = '<p>Failed to load pending requests.</p>';
		}
	} catch (error) {
		document.getElementById('pending-list')!.innerHTML = '<p>Error loading requests.</p>';
	}
}

// 🔥 Setup Accept/Reject Buttons
function setupPendingRequestButtons(token: string) {
	// Accept buttons
	document.querySelectorAll('.accept-btn').forEach(btn => {
		btn.addEventListener('click', async () => {
			const friendId = parseInt(btn.getAttribute('data-friend-id')!);
			const friendName = btn.getAttribute('data-friend-name')!;

			try {
				const response = await fetch('/api/friends/accept', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ friendId })
				});

				if (response.ok) {
					showNotification(`${friendName} foi adicionado aos teus amigos!`, 'success');
					// Refresh lists
					loadPendingRequests(token);
					updateFriendRequestsBadge();
				} else {
					const result = await response.json();
					showNotification(result.error || 'Failed to accept request', 'error');
				}
			} catch (error) {
				showNotification('Network error occurred', 'error');
			}
		});
	});

	// Reject buttons
	document.querySelectorAll('.reject-btn').forEach(btn => {
		btn.addEventListener('click', async () => {
			const friendId = parseInt(btn.getAttribute('data-friend-id')!);
			const friendName = btn.getAttribute('data-friend-name')!;

			const confirmed = confirm(`Tens a certeza que queres rejeitar o pedido de ${friendName}?`);
			if (!confirmed) return;

			try {
				const response = await fetch('/api/friends/reject', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ friendId })
				});

				if (response.ok) {
					showNotification(`Pedido de ${friendName} foi rejeitado`, 'success');
					// Refresh lists
					loadPendingRequests(token);
					updateFriendRequestsBadge();
				} else {
					const result = await response.json();
					showNotification(result.error || 'Failed to reject request', 'error');
				}
			} catch (error) {
				showNotification('Network error occurred', 'error');
			}
		});
	});
}

// 🔥 Show Notification
function showNotification(message: string, type: 'success' | 'error') {
	const notification = document.getElementById('notification') as HTMLDivElement;
	notification.textContent = message;
	notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
	notification.style.display = 'block';

	setTimeout(() => {
		notification.style.display = 'none';
	}, 3000);
}

