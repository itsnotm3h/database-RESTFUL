// 1. SETUP EXPRESS
const express = require('express');
const cors = require('cors');
//to import the use of objectID from mongodb
const { ObjectId, ReturnDocument } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const dbName = 'recipe_book';
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


//enable dotenv
require('dotenv').config();

//generate access token
// Access token to grant access to the API
// there is on refresh token as well.  
const generateAccessToken = (id,email) => {
  return jwt.sign({
    'user_id':id,
    'email':email
  },process.env.TOKEN_SECRET,{
    expiresIn:"1h"
  })
}

//Verify token

const verifyToken = (req,res,next) =>{
    //this is to get the header so that contain the token;
    const authHeader = req.headers['authorization'];
    //as the token will be return BEARER <TOKEN>, we want to just extract the <TOKEN>
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(403);
    // to verify if the token is the same as in the we have stored. 
    jwt.verify(token, process.env.TOKEN_SECRET, (err,user)=>{
        //if there it doesnt match it return error
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

//set the URL form the .env file. 
//MONGO_URI must be the same as declared in env.
// make use data is read data from process env. line must be declare adter the require('dotenv').config;
const mongoURI = process.env.MONGO_URI;

// 1a. create the app
const app = express();
app.use(cors());

//1b. enable json processing, allow clients to send JSON data to our server. 
//.json() must be a function call otherwise there is no error message it wont work. 
app.use(express.json())

//uri = connection string;
async function connect(uri, dbName) {
    //create client, that allow us to communicate with a database. 
    //(i.e like mongo Shell)
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });

    let db = client.db(dbName);
    return db;
}

//add route after the connection is done. 
//all route must be in the main function. 
async function main() {

    //connect to mongo database. 

    let db = await connect(mongoURI, dbName);

    // 2. CREATE ROUTES
    app.get('/', function (req, res) {
        res.json({
            "message": "Hello World!"
        });
    })

    //there is a convention, when it comes to the URL for restful api.
    //URL should function like a file path. (always a resource, a noun)
    app.get("/recipes", async (req, res) => {
        try {
            const recipes = await db.collection("recipes").find().project({
                name: 1,
                cuisine: 1,
                tags: 1,
                prepTime: 1,
            }).toArray();

            res.json({ recipes });
        } catch (error) {
            console.error("Error fetching recipes:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // /reciepes/1234A -> get the details of the recipe via their id. 
    app.get("/recipes/:id", async function (req, res) {
        try {

            let id = req.params.id;

            //mongoshell: db.recipes.find({});
            let recipe = await db.collection('recipes').findOne({
                "_id": new ObjectId(id)
            });

            // not an error that can be catched. 
            if (!recipe) {
                return res.status(400).json({
                    "error": "Json not found"
                })
            }

            res.json({
                'recipes': recipe
            })

        }
        //error that is unexpected and we cant control. 
        catch (error) {

            console.error("Eroor fetching reciepe:", error);
            res.status(500);
        }
    })

    //another route that it need to search by input. 
    app.get("/recipes", async function (req, res) {
        try {

            //object destructuring. 
            let { tags, cuisine, ingredients, name } = reg.query;
            let criteria = {};

            if (tags) {
                criteria["tags.name"] = {
                    "$in": tags.split(",")
                }
            }
            if (cuisine) {
                criteria["cuisine.name"] = {
                    "$regex": cuisine, "$options": "i"
                }
            }
            if (ingredients) {
                criteria["ingredients.name"] = {
                    "$in": ingredients.split(",").map(function () {
                        return new RegExp(i, "i");
                    })
                }
            }

            if (name) {
                criteria["name"] = {
                    "$regex": name, "$options": "i"

                }
            }

            const recipes = await db.collection('recipes').find(criteria).project({
                name: 1,
                'cuisine.name': 1,
                'tags.name': 1,
                _id: 0
            }).toArray();

            res.json({ recipes });
        } catch (error) {
            console.error('Error searching recipes:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

    })


    //We use app. post for HTTP Method Post.
    app.post("/recipes", async function (req, res) {
        try {
            //name, cuisine, prpeTime, cookTime, servings, ingredients, instructions and tags;
            //To note: When we use POST,PATCH or PUT to send data to server, the data are in req.body.

            const { name, cuisine, prepTime, cookTime, servings, ingredients, instructions, tags } = req.body;

            // Basic validation
            if (!name || !cuisine || !ingredients || !instructions || !tags) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Fetch the cuisine document
            const cuisineDoc = await db.collection('cuisines').findOne({ name: cuisine });
            if (!cuisineDoc) {
                return res.status(400).json({ error: 'Invalid cuisine' });
            }

            // Fetch the tag documents
            const tagDocs = await db.collection('tags').find({ name: { $in: tags } }).toArray();
            if (tagDocs.length !== tags.length) {
                return res.status(400).json({ error: 'One or more invalid tags' });
            }

            // Create the new recipe object
            const newRecipe = {
                name,
                cuisine: {
                    _id: cuisineDoc._id,
                    name: cuisineDoc.name
                },
                prepTime,
                cookTime,
                servings,
                ingredients,
                instructions,
                tags: tagDocs.map(tag => ({
                    _id: tag._id,
                    name: tag.name
                }))
            };

            // Insert the new recipe into the database
            const result = await db.collection('recipes').insertOne(newRecipe);

            // Send back the created recipe
            res.status(201).json({
                message: 'Recipe created successfully',
                recipeId: result.insertedId
            });

        } catch (error) {
            console.error('Error creating recipe:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

    })


    app.put('/recipes/:id', async (req, res) => {
        try {
            const recipeId = req.params.id;
            const { name, cuisine, prepTime, cookTime, servings, ingredients, instructions, tags } = req.body;
    
            // Basic validation
            if (!name || !cuisine || !ingredients || !instructions || !tags) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
    
            // Fetch the cuisine document
            const cuisineDoc = await db.collection('cuisines').findOne({ name: cuisine });
            if (!cuisineDoc) {
                return res.status(400).json({ error: 'Invalid cuisine' });
            }
    
            // Fetch the tag documents
            const tagDocs = await db.collection('tags').find({ name: { $in: tags } }).toArray();
            if (tagDocs.length !== tags.length) {
                return res.status(400).json({ error: 'One or more invalid tags' });
            }
    
            // Create the updated recipe object
            const updatedRecipe = {
                name,
                cuisine: {
                    _id: cuisineDoc._id,
                    name: cuisineDoc.name
                },
                prepTime,
                cookTime,
                servings,
                ingredients,
                instructions,
                tags: tagDocs.map(tag => ({
                    _id: tag._id,
                    name: tag.name
                }))
            };
    
            // Update the recipe in the database
            const result = await db.collection('recipes').updateOne(
                { _id: new ObjectId(recipeId) },
                { $set: updatedRecipe }
            );
    
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Recipe not found' });
            }
    
            // Send back the success response
            res.json({
                message: 'Recipe updated successfully'
            });
        } catch (error) {
            console.error('Error updating recipe:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


    //app.delete()
    app.delete("/recipes/:id", async function (req,res){

        try{
            const recipeId = req.params.id;

            //this is to get the document by id and deleting the entry. 
            // This is the most similar tot the mongoDB function. 
            const result = await db.collection("recipes").deleteOne({_id:new ObjectId(recipeId)});
    
            // res.json({
            //     'result': result
            // })
    
            if(result.deletedCount === 0)
            {
                return res.status(404).json({"error":"Record is not found"});
            }
    
            //this is to send a response message
            res.json({"message":"Reciepe is successfully deleted."});

        }
        catch(error){

            console.error("Error deleting reciepe:", error);
            res.status(500).json({error: "Internal server error"});
        }      
    })


    //route for user signup.
    //user must provide an email and password.  
    app.post('/users', async function(req,res){

        try{
            let {email,password} = req.body;
            if(!email || !password)
            {
                return res.status(400).json({
                    "error":"Please provide user name and password."
                })
            }
                const result = await db.collection("users").insertOne({
                    'email': req.body.email,
                    'password': await bcrypt.hash(req.body.password, 12)
                });
            

            res.json({
                "message":"New user account created.",
                "result": result
            })


        }
        catch(error)
        {
            console.error(e);
            res.status(500);

        }

    })

    // generateAccessToken
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        //to check if email and password is entered. 
        if(!email || !password)
        {
            return res.status(400).json({
                "message":"Email and password are required"
            })
        }
        const user = await db.collection('users').findOne({
            email:email
        });

        //to return error message when no user is found.  
        if(!user)
        {
            return res.status(404);
        }
        const validatePassword = await bcrypt.compare(password,user.password);
        //to check if password is correct. 
        if(!validatePassword){
            return res.status(401);
        }
        const accessToken = generateAccessToken(user._id,user.email);
        res.json({accessToken:accessToken});

    })

    //add verifyToken to protect the route.
    app.get("/profile", verifyToken, function (req,res){
        res.json({
            message:"this is a protected route",user:req.user
        });
    })
       

}

main();



// 3. START SERVER (Don't put any routes after this line)
app.listen(3000, function () {
    console.log("Server has started");
})