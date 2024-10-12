const io = require("socket.io")();
const crypto = require("crypto");
const http = require("http");

const parties = {};

const generatePartyCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

module.exports = async function (context, req) {
    // Create an HTTP server
    const server = http.createServer();
    
    // Attach Socket.IO to the HTTP server
    io.attach(server);

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

        socket.on('videoAction', (data) => {
            const { partyId, action, time } = data;

            if (parties[partyId]) {
                socket.to(partyId).emit('videoAction', { action, time });
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

    // Start the server
    server.listen(0, () => {
        context.res = {
            status: 200,
            body: "Socket.IO server is running"
        };
    });
};
