export interface RegisterRequest {
	username: string;
	password: string;
	name: string;
	team: string;
	display_name?: string;
	email?: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}