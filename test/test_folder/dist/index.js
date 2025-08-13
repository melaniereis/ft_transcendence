"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
const crud_1 = require("./backend/crud/crud.js");
const fastify = (0, fastify_1.default)({ logger: true });
// 📦 Serve static files from /public
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, 'public'),
    prefix: '/',
});
const register_js_1 = require("./backend/register.js");
const playBtn = document.getElementById('play-btn');
const nameInput = document.getElementById('player-name');
playBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name)
        return alert('Please enter your name');
    (0, register_js_1.renderRegistrationForm)(name);
});
// 🟢 Create a new user
fastify.post('/users', async (request, reply) => {
    const { name, username, team } = request.body;
    try {
        await (0, crud_1.createUser)(name, username, team);
        reply.code(201).send({ message: 'User created' });
    }
    catch (err) {
        const error = err;
        reply.code(500).send({ error: error.message });
    }
});
// 🔵 Get all users
fastify.get('/users', async (request, reply) => {
    try {
        const users = await (0, crud_1.getAllUsers)();
        reply.send(users);
    }
    catch (err) {
        const error = err;
        reply.code(500).send({ error: error.message });
    }
});
// 🚀 Start the server
fastify.listen({ port: 3000 }, (err, address) => {
    if (err)
        throw err;
    console.log(`Server running at ${address}`);
});
//# sourceMappingURL=index.js.map