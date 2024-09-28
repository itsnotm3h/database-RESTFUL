//requires allow u to use this. 
//and it will returned the assigned moduled. 
// the require() will take in the directory name of the module and relative to 'node_modules'. 
const express = require('express');
const cors = require('cors')

//reminder: const is a varible that cannot be reassigned. C an use let if unsure. 
const app = express(); // creates a new express notification

//setup CORS security
app.use(cors());


//ADD in a ROUTE, a function that is associate to the URL. 
//must be after the last app.use and before app.listen. 
// get() HTTP get method. 
// "/" means the foward slash of the URL
// take in 2 parameter . Req = request, what the client send the to server . Res = response , what sends back to the client. 
app.get("/",function(req,res){
// Send back a response using, the res object;
// we are now at the perspective of the server to send back a response.
res.json({
    "message":"hello World!"
})
})

app.get("/quote-of-the-day",function(req,res){
    // Send back a response using, the res object;
    // we are now at the perspective of the server to send back a response.
    res.json({
        "quote":"He will never leave you or forsake you."
    })
    })

// NEED TO RESTART SERVER to REFLECT LATEST CHANGES.

//3 ways to get data from user, 1. in the url, 2. via query strings, 3. via the requestbody. 

//1. in the URL.
//:name is a placeholder, :name is a wildcard.
app.get("/hello/:name",function(req,res){
//how to capture what is enter in :name
//we use req.params.
let name = req.params.name;
res.json({
    "message":"hello " + name
})

})

// if i have more than 2 parameters. 
app.get("/addTwo/:no1/:no2", function(req,res){
    let n1 = req.params.no1;
    let n2 = req.params.no2;
    //very important all parameters are string. 
    let sum = Number(n1) +  Number(n2);
    res.json({
        "message":"The sum is " + sum
    })
    
})


//2. via query String. Key value pair.
//query string alway start with ?, key, and then value,
//+ or %20 for space.
//& is for next key value pair. 
// assume user is going to send a query string with 2 keys: cusine and time. 
//http://server-ur.com/recipes?cusine=chinese&time=60
app.get("/recipes",function(req,res){
    console.log(req.query);
    let cusine = req.query.cusine;
    let time = req.query.time;
    res.json({
        "cusine":cusine,
        "time": time
    })
})








//start server using listen function
// takes in 2 function, the PORT number to run the server on.
// PORT NUMBER , callback function when the server is started succesfully.
app.listen (3000, function(){
    //this running on the server therefore u can only see it in the terminal. 
    console.log("Server Started");
});
