
import "./config/env.js";       // Run this file once

import connectDB from './config/db.js';
import app from './app.js';



const PORT = process.env.PORT || 4000;

await connectDB();


app.listen (PORT, () => {
    console.log(`Server is runninng on port ${PORT}`);
})



// Code	Name	                When to Use
// 200	OK	                    Request succeeded (GET, successful update, login, etc.)
// 201	Created	                A new resource was created (e.g., user registered)
// 204	No Content	            Success, but nothing to return (e.g., successful delete)
// 400	Bad Request	            Client sent invalid data (missing fields, invalid JSON)
// 401	Unauthorized	        User is not authenticated (no/invalid token)
// 403	Forbidden	            User is authenticated but doesn't have permission
// 404	Not Found	            Resource or route doesn't exist
// 409	Conflict	            Resource already exists (e.g., email already registered)
// 422	Unprocessable Entity	Data format is correct, but validation failed
// 500	Internal Server Error	Something went wrong on the server