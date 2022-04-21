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
        like: 0,
        userUserId : userId

    }).then(function (message) {
        return res.status(200).json({ 'result': 'post create' });
    }).catch(function (err) {
        return res.status(500).json({ "error": "server error"+ err});
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


exports.getAllPost = function(req,res){
    models.Message.findAll(
        {attributes : ["content","attachment","userUserId","id"],
            include: 
            [
              { model: modelsUser.User,
                attributes : ["userId","username","email","isAdmin"]
              },
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


exports.getAllComment = (req, res) => {

    modelsComment.Comment.findAll(
        {
            where:{messageId : req.params.id}, 
            include:[
                      {model: modelsUser.User,
                       attributes:['username','userId']}
                    ]
        })
    .then(function(onSucces){
        return res.status(200).json({onSucces});
    })
    .catch(function(onFail){
        return res.status(500).json({error : " server error" + onFail});
    })
};



exports.deleteComment = function(req,res){
    const userId = token.decrypt(req);
    modelsComment.Comment.destroy({where : {userId : userId , id : req.params.id}})
    .then(function(onSucces){
        if (onSucces) {
            return res.status(200).json({result : 'comment deleted'})
        }else{
            return res.status(400).json({error : "comment not found"})
        }
    })
    .catch(function(onFail){
        return res.status(500).json({result : 'server error'});

    });
};




// AJOUTER LA SUPPRESSION DE TOUT LES LIKE ET COMMENT DU POST
exports.deletePost = function(req,res){
    const role = token.decryptIsAdmin(req);
    const userId = token.decrypt(req);
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(postFound){
        console.log(postFound);
        if (userId == postFound.userUserId || role == 0) {
            modelsComment.Comment.destroy({where :{messageId : req.params.id}})
            postFound.destroy();
            return res.status(200).json({result : "Post Has Been Deleted"});
        }else{
            console.log(role);
            return res.status(400).json({error : "You do not have the required permissions"});
        }
    })
    .catch(function(err){
        return res.status(500).json({error : "Server Error"});
    });
};



exports.likes = function(req,res){
    const userId = token.decrypt(req);
    // je verifie si req.params.id  possede bien un post du meme ID
    models.Message.findOne({where : {id : req.params.id}})
    .then(function(onSucces){
        // si il y a un post 
        if (onSucces) {

                // je verifie si l'user ne le pas deja liké
                modelsLike.Like.findOne({where : {userLiked : userId ,messageId : req.params.id}})
                .then(function(found){
                    // si il la déja liké je retourne un status 400  "vous avez déja liké"
                    if (found) 
                    {  
                        if(req.body.like === 0) 
                        {   
                            found.destroy();
                            onSucces.like--
                            onSucces.save();
                            return res.status(200).json({result : "LIKE 0"})
                        }

                        return res.status(400).json({error : "vous avez déja liké"}); 
                    }
             // si la req.body.like == 1 alors j'incremente et j'ajoute l'user dans userliked et je place req.params.id dans messageId
                        if (req.body.like === 1) 
                        {
                            modelsLike.Like.create({
                                userLiked: userId,
                                messageId : req.params.id
                            })
                            onSucces.like++
                            onSucces.save();
                            
                             return res.status(200).json({result : "LIKE +1"})
                        } // si la req.body.like == 0 alors je decremente et je delete l'user ect
                        
                        if(req.body.like === 0) 
                        {   
                           return res.status(400).json({error : "Like is already equal to 0"}); 
                        }

                        
                }).catch(function(onFail){
                    return res.status(500).json({error : " server error !" + onFail});
                   
                }); 
        }else{
            return res.status(400).json({error : "Post not found ! "})
        }
    })
    .catch(function(onFail){
        return res.status(500).json({error : " server error"});

    });
};



            


    
