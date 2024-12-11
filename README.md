# RESTful Api Routes

The **Expense Tracker API** is a backend application built to manage and track user expenses. This project allows users to create, read, update, and delete their expense records through a RESTful API. The API is built using **Express.js** and interacts with a **MongoDB** database to store and retrieve data.

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [What I Learned](#what-i-learned)

## Overview
The Expense Tracker API provides routes for managing user expenses. Users can interact with the API to perform CRUD operations (Create, Read, Update, Delete) on their expense records. Each expense contains information like the amount, category, date, and description. The API is built with **Express.js**, and the data is stored in a **MongoDB** database.

## Key Features

### Existing Features
- **Create Expense**: Allows users to add new expenses by sending a POST request with details such as the amount, category, and date.
- **Get All Expenses**: Users can view all their expenses by sending a GET request to fetch all records from the database.
- **Get Single Expense**: Users can retrieve details of a specific expense using a unique identifier (ID).
- **Update Expense**: Allows users to update the details of an existing expense (e.g., amount, category, description) by sending a PUT request.
- **Delete Expense**: Users can delete an expense by sending a DELETE request with the expense ID.

### Features Left to Implement
- **User Authentication**: Implement JWT authentication so that users can securely manage their own expenses.
- **Expense Categories**: Add the ability to categorize expenses and retrieve expenses based on categories.
- **Monthly Summary**: Add functionality to calculate the total expenses for a given month.
- **Validation**: Enhance input validation to ensure data integrity (e.g., validate amount, date formats).

## Technologies Used
- **Node.js**: JavaScript runtime for building the backend server.
- **Express.js**: Web framework for building the API routes and handling HTTP requests.
- **MongoDB**: NoSQL database used to store and manage expense data.
- **ARC (Advanced REST Client)**: Used to test and manage API requests during development.
- **MongoDB Compass**: GUI for MongoDB that helps to visualize data and perform database management tasks.

## What I Learned
This project helped me gain experience with building RESTful APIs and interacting with a NoSQL database. Here’s what I learned:

- **Building RESTful APIs**: I learned how to create API routes that follow REST principles (e.g., GET, POST, PUT, DELETE) using **Express.js**.
- **Express.js**: I gained hands-on experience with **Express.js**, learning how to set up and manage routes, middleware, and HTTP requests efficiently. Express's flexibility allowed me to structure my API and handle requests like a professional developer.
- **MongoDB Integration**: I got hands-on experience with MongoDB, learning how to design schemas, interact with collections.
- **CRUD Operations**: I implemented full CRUD functionality to manage expenses, which helped me understand how to structure API endpoints and handle data efficiently in a backend application.
- **Asynchronous Operations**: I became more comfortable working with asynchronous JavaScript, especially when querying MongoDB, using **Promises** and **async/await** syntax.
- **Middleware in Express**: I learned how to use middleware in Express for error handling, logging, and validation.
- **MongoDB Compass**: I also used **MongoDB Compass** to visually manage the MongoDB database, making it easier to understand the structure of data, test queries, and perform administrative tasks.
