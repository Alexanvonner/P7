//import 
const userController = require("../controllers/messageCtrl");
const express = require('express');
const jwt = require("../middleware/jwt");
const multer =  require('../middleware/multer-config');




// la fonction Router()
const router = express.Router();

// mise en place du CRUD pour les MESSAGES
router.post('/post',jwt,multer,userController.createPost);

// exportation du module
module.exports = router;