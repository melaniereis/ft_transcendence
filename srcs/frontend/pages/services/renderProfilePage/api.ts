import { Friend, Match, Profile, Stats } from './types.js';
import { state } from './state.js';
import { DEFAULT_STATS } from './types.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

// Network call helpers with error wrapping using translations for error messages
export async function apiGet<T>(url: string): Promise<T> {
	const res = await fetch(url, { headers: { Authorization: `Bearer ${state.token}` } });
	if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
	return res.json();
}

async function apiSend<T>(url: string, method: string, body?: object): Promise<T> {
	const headers: Record<string, string> = { Authorization: `Bearer ${state.token}` };
	if (body !== undefined) headers['Content-Type'] = 'application/json';

	const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });

	if (!res.ok) {
		throw new Error(`${res.status} ${await res.text()}`);
	}

	if (res.status === 204) return undefined as unknown as T;
	const ct = res.headers.get('content-type') || '';
	if (ct.includes('application/json')) return res.json();

	// Fallback for non-JSON responses
	const text = await res.text();
	try { return JSON.parse(text); } catch { return undefined as unknown as T; }
}

// API functions with UI-facing error message translations
export async function loadProfile(): Promise<Profile> {
	try {
		return await apiGet<Profile>('/api/profile');
	} catch (err) {
		throw new Error(t.errorLoadingProfile || "Error loading profile.");
	}
}

export async function loadStats(userId: number): Promise<Stats> {
	try {
		const json = await apiGet<any>(`/stats/${userId}`);
		return {
			matches_played: json.matches_played ?? 0,
			matches_won: json.matches_won ?? 0,
			matches_lost: json.matches_lost ?? 0,
			win_rate: json.win_rate ?? 0,
			points_scored: json.points_scored ?? 0,
			points_conceded: json.points_conceded ?? 0,
			tournaments_won: json.tournaments_won ?? 0,
		};
	} catch {
		return DEFAULT_STATS;
	}
}

export async function loadHistory(): Promise<Match[]> {
	try {
		const matches = await apiGet<any[]>('/api/match-history');
		return matches.map(match => ({
			...match,
			opponent_display_name: match.opponent_display_name || match.opponent_displayName || match.opponent_name || undefined,
			opponent_username: match.opponent_username || match.opponentUsername || undefined
		}));
	} catch {
		return [];
	}
}

export async function loadFriends(): Promise<Friend[]> {
	try {
		const data = await apiGet<any>('/api/friends');
		if (Array.isArray(data)) return data as Friend[];
		if (Array.isArray(data?.friends)) return data.friends as Friend[];
		if (Array.isArray(data?.data)) return data.data as Friend[];
		return [];
	} catch {
		return [];
	}
}

export async function updateProfile(payload: {
	username: string;
	display_name?: string;
	email?: string;
	avatar_url?: string;
	bio?: string;
}): Promise<Partial<Profile>> {
	try {
		return await apiSend<Partial<Profile>>('/api/profile', 'PUT', payload);
	} catch (err) {
		throw new Error(t.errorUpdatingProfile || "Error updating profile.");
	}
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
	try {
		await apiSend<void>('/api/profile/change-password', 'POST', {
			currentPassword,
			newPassword
		});
	} catch (err) {
		throw new Error(t.errorChangingPassword || "Error changing password.");
	}
}

export async function addFriendApi(username: string): Promise<void> {
	try {
		// try legacy endpoint first
		await apiSend<void>('/api/friends/request', 'POST', { friendUsername: username });
	} catch {
		// fallback to new endpoint if legacy fails
		await apiSend<void>('/api/friends', 'POST', { username });
	}
}

export async function removeFriendApi(friendId: string): Promise<void> {
	try {
		await apiSend<void>(`/api/friends/${encodeURIComponent(friendId)}`, 'DELETE');
	} catch (err) {
		throw new Error(t.errorRemovingFriend || "Error removing friend.");
	}
}

export async function loadMoreMatches(offset: number, limit: number = 10): Promise<Match[]> {
	try {
		return await apiGet<Match[]>(`/api/match-history?offset=${offset}&limit=${limit}`);
	} catch (error) {
		console.error(t.errorLoadingMatches || "Error loading more matches:", error);
		return [];
	}
}

export async function loadMatchesWithPagination(page: number = 0, limit: number = 10): Promise<{
	matches: Match[];
	totalCount: number;
	hasMore: boolean;
}> {
	try {
		const offset = page * limit;
		const matches = await loadMoreMatches(offset, limit);
		return {
			matches,
			totalCount: matches.length, // Placeholder
			hasMore: matches.length === limit
		};
	} catch (error) {
		console.error(t.errorLoadingMatches || "Error loading matches with pagination:", error);
		return { matches: [], totalCount: 0, hasMore: false };
	}
}
