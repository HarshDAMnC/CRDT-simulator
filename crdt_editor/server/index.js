const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log("🚀 CRDT WebSocket Relay Server running on ws://localhost:8080");

wss.on('connection', (ws) => {
    console.log("🟢 Client connected!");

    ws.on('message', (message) => {
        // We receive JSON payloads as raw Buffers/Strings.
        // Broadcast it to all OTHER connected clients.
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log("🔴 Client disconnected!");
    });
});
