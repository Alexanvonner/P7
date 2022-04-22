// import express 
const express = require('express');

// Import MiddleWare
const middlewarePassword = require("../middleware/password");
//import controllers/user.js
const userController = require("../controllers/userCtrl");
//import middleWare/jwt.js
const auth = require("../middleware/jwt");
const multer = require("../middleware/multer-config");

//  the function Router()
const router = express.Router();

// route signup
router.post('/signup',middlewarePassword,userController.signup);
// route login
router.post("/login", userController.login)
// route getUserProfil
router.get('/me',auth,userController.getUserProfil);
// route updateuUserProfil
router.patch('/me',auth,multer, userController.updateUserProfil);
// route getOneUser
router.get('/user/:id', userController.getOneUser);
// route deleteAccount
router.delete('/me', userController.deleteAccount)

// route password forgot / reset
router.post('/reset-password',userController.emailSend);
router.get('/reset-password/:id/:token', userController.getResetPassword);
router.post('/reset-password/:id/:token',middlewarePassword, userController.createNewPassword);

// exportation du module
module.exports = router;