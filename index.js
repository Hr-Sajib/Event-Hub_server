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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // POST route to send emails
        app.post('/send-mail', (req, res) => {
            const { name, email } = req.body;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,  
                    pass: process.env.EMAIL_PASS,  
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

        // New POST route to handle event bookings
        app.post('/book-event', async (req, res) => {
            const newBooking = req.body;
            const r = await bookings.insertOne(newBooking)
            res.send(r);
        });

        // service apis 
        const upcommingEvents = client.db('Event-hub').collection('eventsUpcomming');
        const bookings = client.db('Event-hub').collection('bookings');

        //get operation
        app.get('/getUpcommingEvents', async(req,res)=>{
            const query = upcommingEvents.find();
            const r = await query.toArray();
            res.send(r);
        });

        app.get('/getMyBookings', async(req,res)=>{
            const query = bookings.find();
            const r = await query.toArray();
            res.send(r);
        });

        app.get('/getMyBooking/:id', async(req,res)=>{
            const id = req.params.id;
      
            const query = { _id: new ObjectId(id) };
            const result =  await bookings.findOne(query);

            res.send(result);
        })

        app.put('/updateBooking/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;

      
            const query = { _id: new ObjectId(id) };
            const update = {
              $set: {
                
                        name : updatedBooking.name,
                        organizer : updatedBooking.organizer,
                        email : updatedBooking.email,
                        date : updatedBooking.date,
                        time : updatedBooking.time,
                        location : updatedBooking.location,
                        eventType : updatedBooking.eventType,
                        guests : updatedBooking.guests,
                        packageType : updatedBooking.packageType,
                        details : updatedBooking.details,
                        phone : updatedBooking.phone
                    },
            };
          
              const result = await bookings.updateOne(query, update);
              res.send(result) 
        });



        app.delete('/deleteBooking/:id',async(req,res)=>{
            const id = req.params.id;
            
            const query = {_id: new ObjectId(id)};
      
            const result = await bookings.deleteOne(query);
            res.send(result);
      
        })
      

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`EventHub server on port ${port}`);
});


// const express = require('express');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const axios = require('axios');  // Import axios to make HTTP requests
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 5500;

// app.use(cors({
//     origin: ['http://localhost:5173', 'https://eventhub-a9435.web.app/'],
// }));
// app.use(express.json());

// app.get('/', (req, res) => {
//     res.send("EventHub server running ..");
// });

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-sajib.cqfdgne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Sajib`;

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         await client.connect();
//         console.log("Connected to MongoDB!");

//         // POST route to send emails
//         app.post('/send-mail', (req, res) => {
//             const { name, email } = req.body;

//             const transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                     user: process.env.EMAIL_USER,  
//                     pass: process.env.EMAIL_PASS,  
//                 },
//             });

//             const mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: email,
//                 subject: 'Newsletter Subscription',
//                 html: `
//                 <div style="font-family: Arial, sans-serif; color: #333;">
//                     <h1 style="color: #c2410c;">Hello ${name},</h1>
//                     <p>Thank you for subscribing to our newsletter!</p>
//                     <p style="font-size: 16px; color: #555;">We're excited to have you on board. Stay tuned for the latest updates.</p>
//                     <p style="font-size: 14px;">Best Regards</p>
//                     <p style="color: #c2410c;"><b>EventHub Team</b></p>
//                 </div>
//             `,
//             };

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error('Error sending email:', error);
//                     return res.status(500).send({ error: 'Error sending email' });
//                 }
//                 console.log('Email sent:', info.response);
//                 res.status(200).send({ message: 'Email sent successfully' });
//             });
//         });

//         // New POST route to handle event bookings
//         app.post('/book-event', async (req, res) => {
//             const newBooking = req.body;
//             const r = await bookings.insertOne(newBooking);
//             res.send(r);
//         });

//         // Service APIs
//         const upcommingEvents = client.db('Event-hub').collection('eventsUpcomming');
//         const bookings = client.db('Event-hub').collection('bookings');

//         // Get operation
//         app.get('/getUpcommingEvents', async(req,res)=>{
//             const query = upcommingEvents.find();
//             const r = await query.toArray();
//             res.send(r);
//         });

//         app.get('/getMyBookings', async(req,res)=>{
//             const query = bookings.find();
//             const r = await query.toArray();
//             res.send(r);
//         });

//         app.get('/getMyBooking/:id', async(req,res)=>{
//             const id = req.params.id;
      
//             const query = { _id: new ObjectId(id) };
//             const result =  await bookings.findOne(query);

//             res.send(result);
//         });

//         app.put('/updateBooking/:id', async (req, res) => {
//             const id = req.params.id;
//             const updatedBooking = req.body;
      
//             const query = { _id: new ObjectId(id) };
//             const update = {
//               $set: {
//                         name : updatedBooking.name,
//                         organizer : updatedBooking.organizer,
//                         email : updatedBooking.email,
//                         date : updatedBooking.date,
//                         time : updatedBooking.time,
//                         location : updatedBooking.location,
//                         eventType : updatedBooking.eventType,
//                         guests : updatedBooking.guests,
//                         packageType : updatedBooking.packageType,
//                         details : updatedBooking.details,
//                         phone : updatedBooking.phone
//                     },
//             };
          
//             const result = await bookings.updateOne(query, update);
//             res.send(result);
//         });

//         app.delete('/deleteBooking/:id',async(req,res)=>{
//             const id = req.params.id;
            
//             const query = {_id: new ObjectId(id)};
      
//             const result = await bookings.deleteOne(query);
//             res.send(result);
//         });


//         // These were created for AI model practice purposes... 

//         // New route to interact with the Flask app for sentiment analysis
//         // app.post('/get-sentiment', async (req, res) => {
//         //     const { prompt } = req.body;

//         //     if (!prompt) {
//         //         return res.status(400).send({ error: 'Prompt is required' });
//         //     }

//         //     try {
//         //         // Make the request to the Flask app's /sentiment endpoint
//         //         const response = await axios.post('http://127.0.0.1:5200/sentiment', {
//         //             text: prompt,
//         //         });

//         //         // Send the sentiment analysis result back to the React frontend
//         //         return res.status(200).send(response.data);
//         //     } catch (error) {
//         //         console.error('Error connecting to Flask app:', error);
//         //         return res.status(500).send({ error: 'Error fetching sentiment from Flask app' });
//         //     }
//         // });
//         // // New route to interact with the Flask app for image generation
//         // app.post('/generate-image', async (req, res) => {
//         //     const { prompt } = req.body;

//         //     if (!prompt) {
//         //         return res.status(400).send({ error: 'Prompt is required' });
//         //     }

//         //     try {
//         //         // Make the request to the Flask app's /generate-image endpoint
//         //         const response = await axios.post('http://127.0.0.1:5200/generate-image', {
//         //             text: prompt,
//         //         });

//         //         // Send the image URL from Flask app's response back to the React frontend
//         //         return res.status(200).send(response.data);
//         //     } catch (error) {
//         //         console.error('Error connecting to Flask app:', error);
//         //         return res.status(500).send({ error: 'Error fetching image from Flask app' });
//         //     }
//         // });


//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//     }
// }

// run().catch(console.dir);

// app.listen(port, () => {
//     console.log(`EventHub server on port ${port}`);
// });
