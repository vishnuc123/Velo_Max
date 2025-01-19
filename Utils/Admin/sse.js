// Store SSE clients
const clients = {};

// Function to handle SSE connections
export function sseConnect(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('data: connected\n\n'); // Initial connection message

  const clientId = Date.now();
  clients[clientId] = res;

  req.on('close', () => {
    delete clients[clientId]; // Remove client if the connection is closed
  });
}

// Function to notify all connected clients
export function notifyClients(message) {
    console.log(`Notifying clients with message: ${message}`);
    Object.values(clients).forEach(client => {
      client.write(`data: ${message}\n\n`);
    });
  }
  