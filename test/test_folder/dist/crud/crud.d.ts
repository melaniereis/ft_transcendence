export interface User {
    id: number;
    name: string;
    username: string;
    team: string;
    created_at: string;
}
export declare const createUser: (name: string, username: string, team: string) => Promise<void>;
export declare const getAllUsers: () => Promise<User[]>;
export declare const getUserByUsername: (username: string) => Promise<User | undefined>;
export declare const updateUser: (id: number, name: string, team: string) => Promise<void>;
export declare const deleteUser: (id: number) => Promise<void>;
//# sourceMappingURL=crud.d.ts.map