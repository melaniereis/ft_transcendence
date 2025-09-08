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

	// 🔥 Initial HTML
	container.innerHTML = `
		<h2>👥 Friend Requests</h2>
		
		<div id="pending-requests" style="margin: 20px 0;">
			<h3>📥 Pending Requests</h3>
			<div id="pending-list">
				<p>Loading pending requests...</p>
			</div>
		</div>

		<!-- Back to Profile Button -->
		<button id="back-to-profile" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
			← Back to Profile
		</button>

		<!-- 🔥 NOTIFICATION AREA -->
		<div id="notification" style="display: none; position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 1000;"></div>
	`;

	// 🔥 Setup back button
	document.getElementById('back-to-profile')!.addEventListener('click', async () => {
		const { renderProfilePage } = await import('./renderProfilePage.js');
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
					<div style="display: flex; flex-direction: column; gap: 10px;">
						${pendingRequests.map((request: any) => `
							<div class="pending-request" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
								<div>
									<strong>${request.display_name || request.name}</strong> (@${request.username})
									<pt><small>Team: ${request.team}</small>
									<pt><small>Sent: ${new Date(request.created_at).toLocaleDateString()}</small>
								</div>
								<div style="display: flex; gap: 10px;">
									<button class="accept-btn" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}" 
											style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;" 
											title="Accept friend request">
										✓ Accept
									</button>
									<button class="reject-btn" data-friend-id="${request.user_id}" data-friend-name="${request.display_name || request.name}"
											style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;"
											title="Reject friend request">
										✕ Reject
									</button>
								</div>
							</div>
						`).join('')}
					</div>
				`;

				// 🔥 Setup accept/reject buttons
				setupPendingRequestButtons(token);
			} else {
				document.getElementById('pending-list')!.innerHTML = '<p>No pending friend requests.</p>';
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

