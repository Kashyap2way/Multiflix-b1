const ioClient = require("socket.io-client");

// Use the Socket.IO endpoint
const socket = ioClient("https://multiflix-b1.azurewebsites.net", {
    transports: ['websocket'], // Use WebSocket for connection
    reconnection: true,
});

// Log connection attempts and errors
socket.on('connect', () => {
    console.log('Connected to Socket.IO server');

    // Create a party
    socket.emit('createParty');
});

// Handle connection errors
socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

// Listen for party creation event
socket.on('partyCreated', (data) => {
    console.log('Party created with ID:', data.partyId);

    // Join the party
    socket.emit('joinParty', data.partyId);
});

// Listen for join party response
socket.on('partyJoined', (response) => {
    console.log('Join party response:', response);
});

// Handle disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
});

// Handle error events
socket.on('error', (error) => {
    console.error('Socket error:', error);
});
