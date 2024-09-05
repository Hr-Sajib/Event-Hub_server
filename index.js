const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5500;

app.use(cors({
    origin: ['http://localhost:5173' , 'https://eventhub-a9435.web.app/'],
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("EventHub server running ..");
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-sajib.cqfdgne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Sajib`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API.
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
         await client.connect();
        console.log("Connected to MongoDB!");
        // zlsi efjg fvvm kvyx

        // POST route to send emails
        app.post('/send-mail', (req, res) => {
            const { name, email } = req.body;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,  // Use environment variables
                    pass: process.env.EMAIL_PASS,  // Use environment variables
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Newsletter Subscription',
                html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #c2410c;">Hello ${name},</h1>
                    <p>Thank you for subscribing to our newsletter!</p>
                    <p style="font-size: 16px; color: #555;">We're excited to have you on board. Stay tuned for the latest updates.</p>
                    <p style="font-size: 14px;">Best Regards</p>
                    <p style="color: #c2410c;"><b>EventHub Team</b></p>
                </div>
            `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).send({ error: 'Error sending email' });
                }
                console.log('Email sent:', info.response);
                res.status(200).send({ message: 'Email sent successfully' });
            });
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`EventHub server on port ${port}`);
});
