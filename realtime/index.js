const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Guarda os clientes conectados, agrupados por pollId
const rooms = new Map();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pollId = url.searchParams.get('pollId');

    if (!pollId) {
        ws.close(1008, 'pollId é obrigatório');
        return;
    }

    if (!rooms.has(pollId)) {
        rooms.set(pollId, new Set());
    }
    rooms.get(pollId).add(ws);

    console.log(`Cliente conectado na enquete ${pollId}`);

    ws.on('close', () => {
        rooms.get(pollId)?.delete(ws);
        console.log(`Cliente desconectado da enquete ${pollId}`);
    });
});

// Rota interna que o Laravel vai chamar quando alguém votar
app.post('/broadcast/:pollId', (req, res) => {
    const { pollId } = req.params;
    const payload = JSON.stringify(req.body);

    const clients = rooms.get(pollId);

    if (clients) {
        clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        });
    }

    res.json({ success: true, notified: clients?.size ?? 0 });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Servidor realtime rodando na porta ${PORT}`);
});