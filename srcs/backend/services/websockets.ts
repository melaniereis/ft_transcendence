// services/websockets.ts
import WebSocket from 'ws';
import type { ClientId, WSMessage, IWebsocketService } from '../types/websockets';

export class WebsocketService implements IWebsocketService {
    private clients = new Map<ClientId, WebSocket>();

    addClient(id: ClientId, socket: WebSocket): void {
        this.clients.set(id, socket);
    }

    removeClient(id: ClientId): void {
        const socket = this.clients.get(id);
        if (socket) {
            try { 
                socket.close(); 
            } catch {}
        }
        this.clients.delete(id);
    }

    sendTo(id: ClientId, data: WSMessage): boolean {
        const socket = this.clients.get(id);
        if (!socket || socket.readyState !== WebSocket.OPEN) return false;
        
        try {
            socket.send(JSON.stringify(data));
            return true;
        } catch {
            return false;
        }
    }

    broadcast(data: WSMessage, excludeId?: ClientId): void {
        const message = JSON.stringify(data);
        
        for (const [id, socket] of this.clients.entries()) {
            if (excludeId && id === excludeId) continue;
            if (socket.readyState !== WebSocket.OPEN) continue;
            
            try {
                socket.send(message);
            } catch {
                // Ignore send errors
            }
        }
    }

    getClientIds(): ClientId[] {
        return Array.from(this.clients.keys());
    }
}

export const websocketService = new WebsocketService();