import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerUser, loginUser, verifyToken } from '../services/authService.js';

interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  team: string;
  display_name?: string;
  email?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // 📝 Registration Route
  fastify.post('/api/register', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password, name, team, display_name, email } = req.body as RegisterRequest;

      if (!username || !password || !name || !team) {
        return reply.status(400).send({
          error: 'Campos obrigatórios: username, password, name, team'
        });
      }

      const result = await registerUser({
        username,
        password,
        name,
        team,
        display_name,
        email
      });

      reply.send({ success: true, userId: result.id });
    } catch (err: any) {
      console.error('Registration error:', err);
      reply.status(400).send({
        error: 'Falha no registo',
        details: err.message
      });
    }
  });

  // 🔐 Login Route
  fastify.post('/api/login', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password } = req.body as LoginRequest;

      if (!username || !password) {
        return reply.status(400).send({
          error: 'Username e password são obrigatórios'
        });
      }

      const result = await loginUser(username, password);

      if (!result || !result.token || !result.user) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      reply.send({
        token: result.token,
        user: {
          id: result.user.id,
          username: result.user.username
        },
        message: 'Login bem-sucedido'
      });
    } catch (err: any) {
      console.error('Login error:', err);
      reply.status(500).send({ error: 'Erro interno no servidor' });
    }
  });

  // 🔒 Protected Route Example
  fastify.get('/api/protected', async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: 'Header de autorização em falta' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return reply.status(401).send({ error: 'Token em falta no header' });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return reply.status(401).send({ error: 'Token inválido' });
    }

    reply.send({ message: `Utilizador autenticado: ${userId}` });
  });
}
