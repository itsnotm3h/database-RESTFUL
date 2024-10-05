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
// const generateAccessToken = function (id, name, email, role) {
//     return jwt.sign({
//         'user_id': id,
//         'user_name': name,
//         'email': email,
//         'role': role
//     }, process.env.SECRET_TOKEN, {
//         expiresIn: "1h"
//     });
// }

//generate Token Access
const generateAccessToken = function ( name, role) {
    return jwt.sign({
        'userId': name,
        'role': role
    }, process.env.SECRET_TOKEN, {
        expiresIn: "1h"
    });
}

//VerifyToken
const verifyToken = (req,res,next)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(",");
    if (!token)
    {
        return res.sendStatus(403);
    }
    jwt.verify(token, process.env.SECRET_TOKEN,(error,user)=>{
        req.user = user;
        next();
    })

}



// 2. CREATE ROUTES
async function main() {
    let db = await connect(mongoURI, dbName);

    app.get('/', function (req, res) {
        res.json({
            "message": "Hello World!"
        });
    })


    //Route to: Sign Up
    app.post("/register", async function(req,res){
        const registerEntry = await db.collection('users').insertOne({
            'userName':req.body.userName,
            'email':req.body.email,
            'password': await bcrypt.hash(req.body.password,12),
            'role':req.body.role
        })
        res.json({
            message:"New user account created", 
            result: registerEntry
        })
    })

    //Route to login:
    app.post("/login", async (req,res)=>{
        const {userName,password} = req.body;
        if(!userName || !password){
            return res.status(400).json({
            message:"Email and password are required"
            });
        }
        const userFind = await db.collection('users').findOne({userName:userName})
        if(!userFind)
        {
            return res.status(400).json({message:"User not found."})
        }
        const checkPassword = await bcrypt.compare(password,userFind.password);
        if(!checkPassword)
        {
            return res.status(400).json({message:"Password is incorrect."})
        }


        // const generateAccessToken = function (id, name, email,role) {


        const accessToken = generateAccessToken (userFind._id,userFind.role);
        res.json({
            accessToken: accessToken
        });
    })

    //Route to: Create new expenses entry. 
    app.post("/createEntry", async (req, res) => {
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
        try {
            let { id, userName, dateTime, description, cost, paymentType, category, status } = req.query;
            let criteria = {};

            if (id) {
                // let becomeNumber = parseFloat(cost)
                criteria.id = id;
            }

            if (cost) {
                // let becomeNumber = parseFloat(cost)
                criteria.cost = parseFloat(cost);
            }

            if (dateTime) {
                // let becomeNumber = parseFloat(cost)
                //set the date time 
                // we can set the time in a range.
                let startDate = new Date(dateTime).toISOString();
                let endDate = new Date(new Date(dateTime).setHours(23, 59, 59, 999)).toISOString();
                criteria.dateTime = { $gte: startDate, $lte: endDate };
            }

            if (description) {
                criteria.description = { $regex: description, $options: 'i' };
            }

            if (userName) {
                // let becomeNumber = parseFloat(cost)
                criteria.userName = userName;
            }

            if (paymentType) {
                criteria["paymentType.name"] = { $regex: paymentType, $options: 'i' };
            }

            if (category) {
                criteria["category.name"] = { $regex: category, $options: 'i' };
            }

            if (status) {
                criteria["status.name"] = { $regex: status, $options: 'i' };
            }


            const searchEntry = await db.collection('expenses').find(criteria).project({
                _id:1,
                dateTime: 1,
                description: 1,
                cost: 1,
                paymentType: 1,
                category: 1,
                status: 1
            }).toArray();


            //if the search turns up empty. 
            if (!Object.keys(searchEntry).length) {
                res.json({ message: "There is no such entry." });
            }
            else {
                res.json({ searchEntry });
            }

        }
        catch (error) {

            console.error("Error in fetching all expenses:", error);
            res.status(500);
        }

    })


    ///Route for user to read their own info/
    

    //Route to update record.

    app.put(("/expenses/:id"), async function (req, res) {

        try {

            let id = req.params.id;
            let { userName, dateTime, description, cost, paymentType, category, status } = req.body;


            if (!userName,!dateTime || !description || !cost || !paymentType || !category || !status) {
                res.status(404).json({ message: "Input is not complete." });
            }
            if (cost) {
                cost = parseFloat(cost);
            }
            if (dateTime) {
                dateTime = new Date(dateTime).toISOString();
            }
            //key:valueoftquery.
            const paymentTypeCollection = await db.collection("paymentMethods").findOne({ name: paymentType });
            if (!paymentTypeCollection) {
                res.status(401).json({ message: "Invaild paymentType" });
            }

            const categoryCollection = await db.collection("category").findOne({ name: category });
            if (!categoryCollection) {
                res.status(401).json({ message: "Invaild Category" });
            }

            const statusCollection = await db.collection("status").findOne({ name: status });
            if (!statusCollection) {
                res.status(401).json({ message: "Invaild Status." });
            }

            const updateEntry = {
                userName,
                dateTime,
                description,
                cost,
                paymentType: {
                    _id: paymentTypeCollection.id,
                    name: paymentTypeCollection.name
                },
                category: {
                    _id: categoryCollection.id,
                    name: categoryCollection.name
                },
                status: {
                    _id: statusCollection.id,
                    name: statusCollection.name
                }

            };

            // Update the database
            const result = await db.collection('expenses').updateOne(
                { _id: new ObjectId(id) },
                { $set: updateEntry }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            res.json({message:"Successfully updated the expense entry"})




        }
        catch (error) {
            console.error("Error in fetching all expenses:", error);
            res.status(500);
        }


    })


    // Route to delete
    app.delete("/delete/:id", verifyToken, async function(req,res){

        try{

            let id = req.params.id;

            // const getEntry = await db.collection("expenses").findOne({"_id":ObjectId(id)});

            // if(!getEntry)
            // {
            //     res.status(404).json({message:"There is no such entry"})

            // }
            const deleteEntry = await db.collection("expenses").deleteOne({ _id:new ObjectId(id) })

            if (deleteEntry.matchedCount === 0) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            res.json({message:"Entry is deleted."});

        }
        catch(error)
        {
            res.status(500).json({message:"Internal Server Error."})

        }
    })

}

main();

// 3. START SERVER (Don't put any routes after this line)
app.listen(3000, function () {
    console.log("Server has started");
})