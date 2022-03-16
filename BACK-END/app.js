//Import
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");


const userRoutes = require('./routes/userRoute');
const messageRoutes = require('./routes/messageRoute')

//importation de MORGAN ( logger http)
 const morgan = require('morgan');


//Imports


// create application Express 
const app = express();



// pour afficher les requests & les responses directement dans la console 
//app.use(morgan("dev"));

 app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });



// transformer en json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



 app.use('/api/auth', userRoutes);
app.use('/api', messageRoutes);




module.exports = app;