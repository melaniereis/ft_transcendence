// routes/websockets.ts
import type { FastifyInstance, FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import websocketPlugin from '@fastify/websocket';

import { websocketService } from '../services/websockets.js';
import type { ClientId, WSIncoming, SocketStream } from '../types/websockets.js';

/**
 * Accept either SocketStream (an object with `.socket`) or a raw `WebSocket`.
 * This avoids TypeScript overload issues where Fastify may pass one shape or the other.
 */
type MaybeSocketStream = SocketStream | import('ws').WebSocket;

export const WebSocketPlugin: FastifyPluginCallback = (fastify: FastifyInstance, _opts, done) => {
  // Register the official websocket plugin so Fastify can accept websocket connections.
  fastify.register(websocketPlugin);

  // Define the websocket route at /ws
  // The options object may sometimes cause type complaints, so we keep `as any` here.
  fastify.get(
    '/ws',
    { websocket: true } as any,
    // Handler accepts either a SocketStream or a raw WebSocket (we handle both below).
    (connection: MaybeSocketStream, request: FastifyRequest<{ Querystring: { id?: string } }>) => {
      // Normalize to a `socket` variable of type `ws.WebSocket` regardless of the incoming shape.
      const socket: import('ws').WebSocket =
        typeof connection === 'object' && 'socket' in connection
          ? (connection as SocketStream).socket
          : (connection as import('ws').WebSocket);

      // Read client id from query string, or generate a random one if not provided.
      const id: ClientId = request.query.id || `client_${Math.random().toString(36).slice(2, 9)}`;

      // Add this client to the shared WebSocket service (keeps a Map of connected clients).
      websocketService.addClient(id, socket);

      // Send a welcome/connected message with the assigned id.
      try {
        socket.send(JSON.stringify({ type: 'connected', id }));
      } catch {
        // ignore send errors
      }

      // Handle incoming messages from this socket.
      socket.on('message', (raw: Buffer) => {
        let message: WSIncoming;

        // Parse JSON safely — if invalid, ignore the message.
        try {
          message = JSON.parse(raw.toString());
        } catch {
          return;
        }

        // If there is no 'type' field, we don't know how to handle it.
        if (!message?.type) return;

        // Route behavior based on the message `type`.
        switch (message.type) {
          case 'ping':
            // Simple heartbeat reply.
            socket.send(JSON.stringify({ type: 'pong' }));
            break;

          case 'broadcast':
            // Send the payload to all connected clients except the sender.
            websocketService.broadcast(
              { type: 'broadcast', from: id, payload: message.payload },
              id
            );
            break;

          case 'sendTo':
            // Send a direct/private message to another client if `to` is provided.
            if (message.to) {
              websocketService.sendTo(message.to, {
                type: 'message',
                from: id,
                payload: message.payload,
              });
            }
            break;

          case 'input':
            // Similar to broadcast — useful for things like "user typing" events.
            websocketService.broadcast({ type: 'input', from: id, payload: message.payload }, id);
            break;

          // You can add more message types here as your app needs them.
        }
      });

      // When the socket closes, remove the client from the service.
      socket.on('close', () => websocketService.removeClient(id));

      // On socket error, also remove the client to avoid stale references.
      socket.on('error', () => websocketService.removeClient(id));
    }
  );

  // Signal Fastify that the plugin registration is done.
  done();
};

export default fp(WebSocketPlugin);