// types/friendship.ts
export interface Friendship {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_name?: string;
  friend_username?: string;
  friend_display_name?: string;
  friend_avatar?: string;
  friend_online?: boolean;
}