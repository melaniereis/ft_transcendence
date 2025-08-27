// renderProfilePage/api.ts
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

export async function loadHistory(): Promise<Match[]> {
  try {
    return await apiGet<Match[]>('/api/match-history');
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
}): Promise<Profile> {
  return apiSend<Profile>('/api/profile', 'PUT', payload);
}

export async function changePassword(current_password: string, new_password: string): Promise<void> {
  await apiSend<void>('/api/change-password', 'POST', { current_password, new_password });
}

export async function addFriendApi(username: string): Promise<void> {
  await apiSend<void>('/api/friends', 'POST', { username });
}

export async function removeFriendApi(friendId: string): Promise<void> {
  await apiSend<void>(`/api/friends/${friendId}`, 'DELETE');
}