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
// Notify clients with a message, including productId if needed
export function notifyClients(message, productId = null) {
  console.log(`Notifying clients with message: ${message}, productId: ${productId}`);

  // Construct the event message to include productId if it's provided
  const eventMessage = productId
    ? JSON.stringify({ event: message, productId: productId }) // Include productId
    : JSON.stringify({ event: message }); // If no productId, just send event name

  // Send message to all connected clients
  Object.values(clients).forEach(client => {
    client.write(`data: ${eventMessage}\n\n`);
  });
}
