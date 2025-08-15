// types/User.ts

export type User = {
  id: number;
  name: string;
  username: string;
  team: string;
  password: string; // This will be the hashed password
};
