// Store SSE clients
const clients = {};

// Function to handle SSE connections
export function sseConnect(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('data: connected\n\n');

  const clientId = Date.now();
  clients[clientId] = res;

  req.on('close', () => {
    delete clients[clientId]; 
  });
}

export function notifyClients(message, productId = null) {
  console.log(`📢 Sending SSE: ${message}, Product ID: ${productId}`);

  const eventMessage = JSON.stringify({ event: message, productId });

  Object.values(clients).forEach(client => {
    console.log(`📩 Sending to client`);
    client.write(`data: ${eventMessage}\n\n`);
  });
}

