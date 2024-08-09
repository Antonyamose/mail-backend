const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'antonyamose3@gmail.com',
        pass: 'rmou mhox cofi kzvb' // Use app password if 2FA is enabled
    }
});

// In-memory storage for scheduled emails
let scheduledEmails = [];

app.post('/schedule-email', (req, res) => {
    const { email, subject, message, deliveryTime } = req.body;
    const deliveryDate = new Date(deliveryTime);

    if (deliveryDate < new Date()) {
        return res.status(400).send('Scheduled time must be in the future');
    }

    // Store email details and schedule
    scheduledEmails.push({ email, subject, message,  });

    // Schedule the email
    schedule.scheduleJob(deliveryDate, () => {
        const mailOptions = {
            from: 'antonyamose3@gmail.com',
            to: email,
            subject: subject,
            text: message
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });

    res.status(200).send('Email scheduled successfully');
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
