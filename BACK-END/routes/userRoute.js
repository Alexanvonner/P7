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
// route getUserProfil
router.get('/me', userController.getUserProfil);
// route updateuUserProfil
router.put('/me', userController.updateuUserProfil);
// route getOneUser
router.get('/user/:id', userController.getOneUser);
// route deleteAccount
router.delete('/me', userController.deleteAccount)


// exportation du module
module.exports = router;