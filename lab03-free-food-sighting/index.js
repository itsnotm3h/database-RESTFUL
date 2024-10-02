const express = require('express');
const hbs = require('hbs');

const app = express();

//inform express we using handlerbar as a view engine.
app.set('view engine', 'hbs');
//enable express to use static files. 
// public is refering to the file name.
app.use(express.static('public'));

//enable processing form
app.use(express.urlencoded());

//route
app.get("/",function(req,res){
    res.send("<h1>Free Food</h1>");
})

// this is a dynamic web app, every time u go to the page it will generate different things.
//template aka view engine -- > handlebar.
app.get("/luck", function(req,res){
    let number = Math.floor(Math.random()*9999+999);
    res.send("<h3>your number is " + number + "</h3>")
})

app.get("/food-sighting/create", function (req,res){
    res.render("create-food-sighting")
})

app.post("/food-sighting/create", function (req,res){
    console.log(req.body);

    
    res.send("form recieved");
})

app.get("/about", function(req,res){
//first is the file path. 
 let todayDate = new Date();
// in the second parameter it allow you to define the file. 
 res.render("view",{
    // date is the name of the placeholder {{date}}
    "date": todayDate
 });
})


app.listen(3000, function(){
    console.log("Server has started.")
})