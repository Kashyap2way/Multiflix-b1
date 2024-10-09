// server/index.js
const express = require('express');
const { EmailClient } = require('@azure/communication-email');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Azure Communication Services connection string
const connectionString = "endpoint=https://multiflix-mailsystem.india.communication.azure.com/;accesskey=3amsNNHI3Yb0SFGA43oQi73Cm43p90fS0jAWMuJAwf8GfvFysqKPJQQJ99AJACULyCpZVC32AAAAAZCSsfJP"; // Replace with your connection string
const client = new EmailClient(connectionString);

let otpMap = {};

app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 999999);
    otpMap[email] = otp;

    const emailMessage = {
        senderAddress: "DoNotReply@4b1a7594-f5ce-4794-a511-4296bf846a0f.azurecomm.net", // Your verified Azure sender address
        content: {
            subject: 'Your OTP Code',
            plainText: `Your OTP code is: ${otp}`,
            html: `
                <html>
                    <body>
                        <h1>Your OTP Code</h1>
                        <p>Your OTP code is: <strong>${otp}</strong></p>
                    </body>
                </html>`,
        },
        recipients: {
            to: [{ address: email }],
        },
    };

    try {
        const poller = await client.beginSend(emailMessage);
        const result = await poller.pollUntilDone();
        console.log('Email sent successfully:', result);
        res.send({ message: 'OTP sent!' });
    } catch (error) {
        console.error('Error sending email:', error);
        console.log('Detailed Error:', error.message);
        return res.status(500).send({ error: 'Failed to send OTP', details: error.message });
    }
});


app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpMap[email] === parseInt(otp)) {
    delete otpMap[email];
    return res.send({ message: 'OTP verified!' });
  }
  res.status(400).send({ error: 'Invalid OTP' });
});

app.listen(5001, () => console.log('Server running on port 5001'));
