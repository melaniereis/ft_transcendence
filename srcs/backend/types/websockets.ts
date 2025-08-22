// types/websocket.ts
export type ClientId = string;

export type WSMessage = {
    type: string;
    payload?: any;
    to?: ClientId;
    from?: ClientId;
    id?: ClientId; // used for connected messages
};

export type WSIncoming = WSMessage;

export type WSEvent =
    | 'connected'
    | 'ping'
    | 'pong'
    | 'broadcast'
    | 'message'
    | 'input';

export interface IWebsocketService {
    addClient(id: ClientId, socket: any): void;
    removeClient(id: ClientId): void;
    sendTo(id: ClientId, data: WSMessage): boolean;
    broadcast(data: WSMessage, excludeId?: ClientId): void;
    getClientIds(): ClientId[];
}

export type SocketStream = {
  socket: import('ws').WebSocket;
  // sometimes fastify also passes the original HTTP request; we leave it optional
  request?: import('http').IncomingMessage;
};