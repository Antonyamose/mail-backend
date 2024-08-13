const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'antonyamose3@gmail.com',
        pass: 'rmou mhox cofi kzvb'
    }
});

// Store scheduled jobs by email ID
let scheduledJobs = {};

// Function to schedule an email
const scheduleEmail = (id, email, subject, message, deliveryDate) => {
    const minute = deliveryDate.getMinutes();
    const hour = deliveryDate.getHours();
    const day = deliveryDate.getDate();
    const month = deliveryDate.getMonth() + 1; // Month is 0-indexed

    const cronExpression = `${minute} ${hour} ${day} ${month} *`;

    const job = cron.schedule(cronExpression, () => {
        let mailOptions = {
            from: 'antonyamose3@gmail.com',
            to: email,
            subject: subject,
            text: message
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Email sent: ' + info.response);
        });
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // Store the job in the scheduledJobs object
    scheduledJobs[id] = job;
};

// Endpoint to schedule an email
app.post('/schedule-email', async (req, res) => {
    const { email, subject, message, deliveryTime } = req.body;

    try {
        // Store email details in the database
        const newdata = await prisma.store.create({
            data: {
                email,
                subject,
                message,
                deliveryTime
            }
        });

        const deliveryDate = new Date(deliveryTime);

        if (deliveryDate < new Date()) {
            throw new Error('Scheduled time must be in the future.');
        }

        // Schedule the email
        scheduleEmail(newdata.id, email, subject, message, deliveryDate);

        res.json({ message: "Message submitted successfully", data: newdata });

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

// Endpoint to update scheduled email and reschedule it
app.put("/putdata/:id", async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;

    try {
        // Update the email details in the database
        const editdata = await prisma.store.update({
            where: { id: id },
            data: {
                email: data.email,
                subject: data.subject,
                message: data.message,
                deliveryTime: data.deliveryTime
            }
        });

        const deliveryDate = new Date(data.deliveryTime);

        if (deliveryDate < new Date()) {
            throw new Error('Scheduled time must be in the future.');
        }

        // Cancel the previous job if it exists
        if (scheduledJobs[id]) {
            scheduledJobs[id].stop();
            delete scheduledJobs[id];
        }

        // Reschedule the email with updated details
        scheduleEmail(id, data.email, data.subject, data.message, deliveryDate);

        res.json({ message: "Edited and rescheduled successfully", data: editdata });

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});
app.get('/getdata', async (req, res) => {
    try {
        const data = await prisma.store.findMany();
        res.json({ data });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to transfer data from store to full and delete from store
app.post('/fulldata/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        // Fetch the data from the store table by id
        const data = await prisma.store.findUnique({
            where: { id: id }
        });

        if (!data) {
            return res.status(404).json({ message: "Data not found" });
        }

        // Insert the data into the full table
        const newData = await prisma.full.create({
            data: {
                email: data.email,
                subject: data.subject,
                message: data.message,
                deliveryTime: data.deliveryTime
            }
        });

        // Delete the entry from the store table
        await prisma.store.delete({
            where: { id: id }
        });

        res.json({ message: "Data transferred successfully", data: newData });
    } catch (error) {
        console.error('Error transferring data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
