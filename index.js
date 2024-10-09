// server/index.js
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(bodyParser.json());

// Create a Gmail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'workforudemy@gmail.com', // Your Gmail address
        pass: 'shazam9080',    // Your Gmail password or App Password
    },
});


let otpMap = {};

// OTP Routes
app.post('/send-otp', (req, res) => {
const { email } = req.body;
const otp = crypto.randomInt(100000, 999999);
otpMap[email] = otp;

const mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    return res.status(500).send({ error: 'Failed to send OTP' });
    }
    res.send({ message: 'OTP sent!' });
});
});

app.post('/verify-otp', (req, res) => {
const { email, otp } = req.body;
if (otpMap[email] === parseInt(otp)) {
    delete otpMap[email];
    return res.send({ message: 'OTP verified!' });
}
res.status(400).send({ error: 'Invalid OTP' });
});

// Create an HTTP server to work with both Express and Socket.IO
const server = http.createServer(app);

// WebSocket (Socket.IO) setup for watch party
const io = new Server(server, {
cors: {
    origin: '*', // In production, limit this to your frontend's domain
},
});

io.on('connection', (socket) => {
console.log('User connected:', socket.id);

// Join a watch party room
socket.on('join', (partyCode) => {
    socket.join(partyCode);
    console.log(`User joined party: ${partyCode}`);
});

// Sync play across all users in the party
socket.on('play', (partyCode) => {
    io.to(partyCode).emit('play');
});

// Sync pause across all users in the party
socket.on('pause', (partyCode) => {
    io.to(partyCode).emit('pause');
});

// Handle disconnect
socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
});
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
