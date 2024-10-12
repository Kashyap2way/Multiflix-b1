const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");

const parties = {};
const server = http.createServer();
const io = socketIo(server);

const generatePartyCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('createParty', () => {
        const partyId = generatePartyCode();
        parties[partyId] = { users: [] };

        socket.join(partyId);
        parties[partyId].users.push(socket.id);

        socket.emit('partyCreated', { partyId });
    });

    socket.on('joinParty', (partyId) => {
        if (parties[partyId]) {
            socket.join(partyId);
            parties[partyId].users.push(socket.id);
            socket.emit('partyJoined', { success: true });
        } else {
            socket.emit('partyJoined', { success: false, message: "Party not found!" });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        for (const partyId in parties) {
            parties[partyId].users = parties[partyId].users.filter(id => id !== socket.id);
            if (parties[partyId].users.length === 0) {
                delete parties[partyId];
            }
        }
    });
});

// Start server on a specific port
server.listen(process.env.PORT || 3000, () => {
    console.log('Socket.IO server running');
});
