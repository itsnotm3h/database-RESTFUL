// 1. SETUP all the packages. 
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//From MongoDB connection.
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const mongoURI = process.env.MONGO_URI;
const dbName = "expenses_log";

async function connect(uri, dbName) {
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })
    let db = client.db(dbName);
    return db;
}

// 1a. create the app
const app = express();
app.use(express.json());
app.use(cors()); // enable cross origin resource sharing.  // however we can only prevent some people from using. // it only works for browser, it will not stop anyone. //doesnt prevent ddos attack. 

// 1b.Setup jwt function
const generateAccessToken = function (id, name, email, role) {
    return jwt.sign({
        'user_id': id,
        'user_name': name,
        'email': email,
        'role': role
    }, process.env.SECRET_TOKEN, {
        expiresIn: "1h"
    });
}

// 2. CREATE ROUTES
async function main() {
    let db = await connect(mongoURI, dbName);

    app.get('/', function (req, res) {
        res.json({
            "message": "Hello World!"
        });
    })


    //Route to: Create new expenses entry. 
    app.post("/expenses", async (req, res) => {
        try {
            const { userName, dateTime, description, cost, paymentType, category, status } = req.body;

            if (!userName || !dateTime || !description || !cost || !paymentType || !category || !status) {
                return res.status(400).json({ error: "Missing required fields" })
            }

            const paymentCheckDoc = await db.collection("paymentMethods").findOne({ name: paymentType });

            if (!paymentCheckDoc) {
                return res.status(400).json({ error: "Invalid Payment Methods" })
            }

            const categoryCheckDoc = await db.collection("category").findOne({ name: category });

            if (!categoryCheckDoc) {
                return res.status(400).json({ error: "Invalid category" })
            }

            const statusCheckDoc = await db.collection("status").findOne({ name: status });

            if (!statusCheckDoc) {
                return res.status(400).json({ error: "Invalid status" })
            }

            const newEntry = {
                userName,
                dateTime, //need to check how to verify the date and time. 
                description,
                cost, // do i need to check if its a number.
                paymentType: {
                    _id: paymentCheckDoc._id,
                    name: paymentCheckDoc.name
                },
                category: {
                    _id: categoryCheckDoc._id,
                    name: categoryCheckDoc.name
                },
                status: {
                    _id: statusCheckDoc._id,
                    name: statusCheckDoc.name
                }
            };

            const submitEntry = await db.collection("expenses").insertOne(newEntry);

            res.status(201).json({ message: "New entry has be submitted!", expenseId: submitEntry.insertedId });

        }
        catch (error) {
            console.error("Error in creating new expenses:", error);
            res.status(500).json({ message: "Internal Server Error" })
        }

    })


    //Route to: Reading all data records
    app.get("/expenses", async function (req, res) {
        try {
            const expenses = await db.collection("expenses").find().project({
                dateTime: 1,
                description: 1,
                cost: 1,
                paymentType: 1,
                category: 1,
                status: 1
            }).toArray();

            res.json({ expenses });
        }
        catch (error) {
            console.error("Error in fetching all expenses:", error);
            res.status(500);
        }

    })


    //Route to search with query:
    app.get("/search", async function (req, res) {
        try{
            let {userName, dateTime, description, cost, paymentType, category, status } = req.query;
            let criteria = {};

            if(cost){
                // let becomeNumber = parseFloat(cost)
                criteria["cost"] = parseFloat(cost);
            }

            if(userName){
                // let becomeNumber = parseFloat(cost)
                criteria["name"] = { $regex: name, $options: 'i' };
            }


            if (name) {
                query.name = { $regex: name, $options: 'i' };
            }

            const searchEntry = await db.collection('expenses').find(criteria).project({
                dateTime: 1,
                description: 1,
                cost: 1,
                paymentType: 1,
                category: 1,
                status: 1
            }).toArray();

            res.json({searchEntry});

        }
        catch(error)
        {

            console.error("Error in fetching all expenses:", error);
            res.status(500);
        }

    })

    //Route to update record.


}

main();

// 3. START SERVER (Don't put any routes after this line)
app.listen(3000, function () {
    console.log("Server has started");
})