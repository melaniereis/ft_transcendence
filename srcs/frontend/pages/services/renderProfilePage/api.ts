// renderProfilePage/api.ts - FIXED VERSION
import { Friend, Match, Profile, Stats } from './types.js';
import { state } from './state.js';
import { DEFAULT_STATS } from './types.js';

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${state.token}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function apiSend<T>(url: string, method: string, body?: object): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${state.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export async function loadProfile(): Promise<Profile> {
  return apiGet<Profile>('/api/profile');
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

// FIX: Load match history with usernames
export async function loadHistory(): Promise<Match[]> {
  try {
    const matches = await apiGet<any[]>('/api/match-history');
    
    // Fetch usernames for opponents
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        try {
          // Get opponent username
          const opponent = await apiGet<any>(`/api/users/${match.opponent_id}`);
          return {
            ...match,
            opponent_username: opponent.username || opponent.display_name || `Player ${match.opponent_id}`
          };
        } catch {
          return {
            ...match,
            opponent_username: `Player ${match.opponent_id}`
          };
        }
      })
    );
    
    return enrichedMatches;
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
}): Promise<Partial<Profile>> {
  return apiSend<Partial<Profile>>('/api/profile', 'PUT', payload);
}

// FIX: Correct parameter names for password change
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiSend<void>('/api/profile/change-password', 'POST', { 
    currentPassword, // Fixed parameter name
    newPassword      // Fixed parameter name
  });
}

export async function addFriendApi(username: string): Promise<void> {
  await apiSend<void>('/api/friends/request', 'POST', { friendUsername: username });
}

// FIX: Improved remove friend functionality
export async function removeFriendApi(friendId: string): Promise<void> {
  const response = await fetch(`/api/friends/${friendId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${state.token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove friend: ${errorText}`);
  }
}

export async function loadMoreMatches(offset: number, limit: number = 10): Promise<Match[]> {
  try {
    const response = await apiGet<Match[]>(`/api/match-history?offset=${offset}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error loading more matches:', error);
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
    const response = await fetch(`/api/match-history-paginated?offset=${offset}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    
    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    return {
      matches: data.matches || [],
      totalCount: data.totalCount || 0,
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error('Error loading paginated matches:', error);
    return {
      matches: [],
      totalCount: 0,
      hasMore: false
    };
  }
}
