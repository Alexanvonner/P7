//import 
const userController = require("../controllers/messageCtrl");
const express = require('express');
const authentification = require("../middleware/jwt");
const multer =  require('../middleware/multer-config');




// la fonction Router()
const router = express.Router();

// mise en place du CRUD pour les MESSAGES
router.post('/post',authentification,multer,userController.createPost);
router.put('/post/:id',authentification,multer,userController.UpdatePost);
router.get('/post/:id',userController.GetOnePost);
// router.post('/post/:id/likes', userController.likes);
router.delete('/post/:id',userController.deletePost);
router.get('/post', userController.getAllPost);
router.post('/post/:id',userController.addComment);
// exportation du module
module.exports = router;