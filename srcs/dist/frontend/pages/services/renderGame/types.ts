export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    score: number;
    upKey: string;
    downKey: string;
    nickname: string;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    initialSpeed: number;
    dx: number;
    dy: number;
}