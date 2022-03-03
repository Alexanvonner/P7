// import express 
const express = require('express');

// Import MiddleWare
const middlewarePassword = require("../middleware/password");
//import controllers/user.js
const userController = require("../controllers/userCtrl");

// la fonction Router()
const router = express.Router();

// route signup
router.post('/signup',userController.signup);
// route login
router.post("/login" , userController.login)
// route GetOneUser
router.get('/user/:id', userController.GetOneUser)
// exportation du module
module.exports = router;