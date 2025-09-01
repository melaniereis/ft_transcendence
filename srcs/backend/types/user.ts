//types/user.ts
export type User = {
	id: number;
	name: string;
	username: string;
	team: string;
	password: string;
	display_name?: string;
	email?: string;
	avatar_url: string;
	online_status: number;
	last_seen: string;
	created_at: string;
};