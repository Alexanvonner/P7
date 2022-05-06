//import 
const userController = require("../controllers/messageCtrl");
const express = require('express');
const auth = require("../middleware/jwt");
const multer =  require('../middleware/multer-config');

// la fonction Router()
const router = express.Router();

// MESSAGES
router.post('/post',auth ,multer ,userController.createPost );
router.patch('/post/:id',auth,multer,userController.UpdatePost);
router.delete('/post/:id',userController.deletePost);
router.get('/post', userController.getAllPost);

// COMMENT
router.post('/post/:id',userController.addComment);
router.get('/post/comment/:id', userController.getAllComment);
router.delete('/post/comment/:id/',userController.deleteComment);

// LIKE 
router.post('/post/:id/likes', userController.likes);


// export  module
module.exports = router;