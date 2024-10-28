const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Enviar a mensagem para todos os outros clientes conectados
        const data = JSON.parse(message);

        if (data.type === 'chat') {
            // Enviar mensagem de chat para outros clientes
            broadcast(JSON.stringify({ type: 'chat', user: ws.username, message: data.message }));
        } else if (data.type === 'set-username') {
            ws.username = data.username; // Armazena o nome de usuário
            broadcast(JSON.stringify({ type: 'system', message: `${ws.username} se juntou ao chat!` }));
        }
    });

    ws.on('close', () => {
        if (ws.username) {
            broadcast(JSON.stringify({ type: 'system', message: `${ws.username} saiu do chat.` }));
        }
    });
});

// Função para enviar mensagem para todos os clientes
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
