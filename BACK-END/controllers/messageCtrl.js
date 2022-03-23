const models = require("../models/message");
const modelsComment = require("../models/comment");
const modelsUser = require("../models/user");
const modelsLike = require("../models/like");

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
    const userId = token.decrypt(req);
    modelsComment.Comment.destroy({where : {userId : userId,id : req.params.id}})
    .then(function(onSucces){
        return res.status(200).json({result : 'comment'+req.params.id+' deleted'})
    })
    .catch(function(onFail){
        return res.status(500).json({result : 'server error'});

    });
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



exports.likes = function(req,res){
    const userId = token.decrypt(req);
    // je verifie si req.params.id et possede bien un post du meme ID
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(onSucces){
        // si il y a un post 
        if (onSucces) {

                // je verifie si l'user ne le pas deja liké
                modelsLike.Like.findOne({where : {messageId : req.params.id,userLiked : userId}})
                .then(function(found){
                    console.log(found);
                    // si il la déja liké je retourne un status 400  "vous avez déja liké"
                    if (found) 
                    {  
                        return res.status(400).json({error : "vous avez déja liké"}); 
                    }
             // si la req.body.like == 1 alors j'incremente et j'ajoute l'user dans userliked et je place req.params.id dans messageId
                        if (req.body.like == 1) 
                        {
                            modelsLike.Like.create({
                                userLiked: userId,
                                like : 1,
                                messageId : req.params.id
                            })
                            
                             return res.status(200).json({result : "LIKE +1"})
                        

                        } // si la req.body.like == 0 alors je decremente et je delete l'user ect
                         if(req.body.like == 0) 
                        {  
                            return res.status(200).json({result : "LIKE = 0"})
                        }
                    
                }).catch(function(onFail){
                    return res.status(500).json({error : " server error !" + onFail});
                   
                });
            

        }
    })
    .catch(function(onFail){
        return res.status(500).json({error : " server error"});

    });
};



            


    
  