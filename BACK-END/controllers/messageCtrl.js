const models = require("../models/message");
const modelsComment = require("../models/comment");

const token = require('../middleware/jwt');






exports.createPost = function (req, res) {
    
    const content = req.body.content;
    const attachment = req.body.attachment;

    const userId = token.decrypt(req);

    models.Message.create({
        content:  content,
        attachment: attachment, 
        likes: 0,
        userUserId : userId

    }).then(function (message) {
        return res.status(200).json({ 'result': 'post create' });
    }).catch(function (err) {
        return res.status(500).json({ "error": "server error"});
    });


}

exports.UpdatePost = function(req,res){
    const userId = token.decrypt(req);
    models.Message.findOne({where : {userUserId  : userId}})
    .then(function(userFound){
        if (userFound){
            userFound.content = req.body.content;
            userFound.attachment = req.body.attachment;
            userFound.save();
            return res.status(200).json({resultat : "Post updated"})
        }else{
            return res.status(400).json({error : "User not Found"});       
        }
        
    }).catch(function(err){
        return res.status(500).json({error : "server error"});
    })
}






exports.GetOnePost = function(req,res){
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(postFound){
        if (!postFound) {
            return res.status(400).json({error : "post not found"});
        }else{
            return res.status(200).json({result : postFound});
        }
    }).catch(function(err){
        res.status(500).json({error : "server error"});
    })
};








exports.getAllPost = function(req,res){
    models.Message.findAll().then(function(postFound){
        if (postFound) {
            return res.status(200).json(postFound);
        }else{
            return res.status(400).json({error : "no posts found"});
        }
    }).catch(function(err){
        return res.status(500).json({error : "server error"})
    });
};


exports.addComment = function(req,res){
    modelsComment.Comment.create({
        comment : req.body.comment,
        messageId : req.params.id
    }).then(function(comment){
        return res.status(200).json({result : "Comment created successfully !"})
    }).catch(function(err){
        return res.status(500).json({error : "server error"});
    })
};


exports.deleteComment = function(req,res){
    modelsComment.Comment.findOne({})
}




exports.deletePost = function(req,res){
    const userId = token.decrypt(req);
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(postFound){
        console.log(postFound);
        if (userId == postFound.userUserId) {
            modelsComment.Comment.destroy({where :{messageId : req.params.id}})

            // modelsComment.Comment.findAll({where : {messageId : req.params.id}})
            // .then(function(commentFound){
            //     if (commentFound == req.params.id) {
            //         commentFound.destroy();
            //     }
            // }).catch(function(err){
            //     return res.status(500).json({error : "server error"});
            // })
            postFound.destroy();
            return res.status(200).json({result : "Post Has Been Deleted"})
        }else{
            return res.status(400).json({error : "You do not have the required permissions"})
        }
    })
    .catch(function(err){
        return res.status(500).json({error : "Server Error"});
    });
};



// exports.likes = function(req,res){
//     const userId = token.decrypt(req);
//     models.Message.findOne({where : {userUserId : req.params.id}})
//     .then(function(postFound){
//         if (req.body.likes = 1) {
//             postFound.likes++
//             postFound.userLiked = userId;
//             postFound.save();
//             return res.status(200).json({result : "Post Liked +1"});
//         }
//     }).catch(function(err){
//         return res.status(500).json({error : " server error"});
//     })
// };