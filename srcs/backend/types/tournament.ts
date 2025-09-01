//types/tournament.ts
export interface Tournament {
	id: number;
	name: string;
	player1_id: number;
	player2_id: number;
	player3_id: number;
	player4_id: number;
	semifinal1_player1_id: number;
	semifinal1_player2_id: number;
	semifinal1_winner_id: number;
	semifinal2_player1_id: number;
	semifinal2_player2_id: number;
	semifinal2_winner_id: number;
	final_player1_id: number;
	final_player2_id: number;
	winner_id: number;
	size: number;
	date_created: string;
}