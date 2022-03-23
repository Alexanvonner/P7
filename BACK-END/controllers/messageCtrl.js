const models = require("../models/message");
const modelsComment = require("../models/comment");
const modelsUser = require("../models/user");
const token = require('../middleware/jwt');
const fs = require('file-system');






exports.createPost = function (req, res) {
    
    const content = req.body.content;
    const attachment = req.body.attachment;

    const userId = token.decrypt(req);

    models.Message.create({
        content:  content,
        attachment: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
        likes: 0,
        userUserId : userId

    }).then(function (message) {
        return res.status(200).json({ 'result': 'post create' });
    }).catch(function (err) {
        return res.status(500).json({ "error": "server error"});
    });


};

exports.UpdatePost = function(req,res){
    const userId = token.decrypt(req);

        if (req.file) {
            models.Message.findOne({where : {userUserId  : userId}})
            .then(function(onSucces){
                if (onSucces)
                {   
                    
                        const filename = onSucces.attachment.split("/images/")[1];
                        console.log(filename);
                        fs.unlink("./images/"+filename,(err) => {
                        if (err) throw err;
                        console.log('Fichier supprimé !');
                        });
                    
                    
                    
                    onSucces.attachment = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`; 
                    onSucces.save();
                    return res.status(200).json({resultat : "Updated Attachment !"});
                }else
                {
                        // dans le cas contraire je suis recalé a la modification du post 
                        return res.status(400).json({error : "You do not have the required permissions"});       
                }
            }).catch(function(onFail)
            {
                return res.status(500).json({error : "server error" + onFail});
            })
        }
        if (req.body.content){
            models.Message.findOne({where : {userUserId  : userId}})
            .then(function(onSucces){
                 onSucces.content = req.body.content;
                onSucces.save();
                return res.status(200).json({resultat : "Updated Content !"});
            })
            .catch(function(onFail){
                return res.status(500).json({error : "server error" + onFail});

            });
           
        };   
};

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
    models.Message.findAll(
        {attributes : ["content","attachment","userUserId","id"],
            include: 
            [
              { model: modelsUser.User,
                attributes : ["userId","username","email","isAdmin"]
              },
              {
                model: modelsComment.Comment,
                attributes : ["comment","id","userId","messageId"]
              }

            ]
           

}).then(function(postFound){
        if (postFound) {
            return res.status(200).json(postFound);
        }else{
            return res.status(400).json({error : "no posts found"});
        }
    }).catch(function(err){
        return res.status(500).json({error : "server error" + err})
    });
};


exports.addComment = function(req,res){
    const userId = token.decrypt(req);
    modelsComment.Comment.create({
        comment : req.body.comment,
        messageId : req.params.id,
        userId : userId 
    }).then(function(comment){
        return res.status(200).json({result : "Comment created successfully !"})
    }).catch(function(err){
        return res.status(500).json({error : "server error"});
    })
};


exports.deleteComment = function(req,res){
    modelsComment.Comment.findOne({})
};


exports.deletePost = function(req,res){
    const userId = token.decrypt(req);
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(postFound){
        console.log(postFound);
        if (userId == postFound.userUserId) {
            modelsComment.Comment.destroy({where :{messageId : req.params.id}})
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