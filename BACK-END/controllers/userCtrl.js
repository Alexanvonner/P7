// import
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const token = require('../middleware/jwt');
const dotenv = require('dotenv');
require('dotenv').config();
const nodemailer = require('nodemailer');
var fs = require('file-system');

// Import MODELS
const models = require("../models/user");
const modelsMessage = require("../models/message");
const modelsComment = require("../models/comment");
const modelsLike = require("../models/like");






// regex 
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.signup = function (req, res) {
    // Params 
   
    var email = req.body.email;
    var password = req.body.password;
    var username = req.body.username;
    var bio = req.body.bio;

    // controle que tout les champs ne soit pas égale a NULL
    if (email == null || username == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters ' });
    };

    // je controle la validité de l'email fourni par l'user
    if (!email_regex.test(email)) {
        return res.status(400).json({ 'error': 'invalid e-mail' });
    }

    models.User.findOne({
        attributes: ["email"],
        where: { email: email },
    }).then(function (userFound) {
        if (!userFound) {
            // salt combien de fois sera executer l'algo de hashage
            bcrypt.hash(password, 10)
                .then(hash => {
                 models.User.create({
                        email: email,
                        password: hash,
                        username: username,
                        bio: bio,
                        isAdmin: 0,
                    })
                    .then(function (newUser) {
                            return res.status(201).json({'userId': newUser.userId});
                        })
                        .catch(function (err) {
                            return res.status(500).json({ 'error': 'cannot add user'+err.message });
                        });
                });
        } else {
            return res.status(409).json({ 'error': 'user already exist' });
        }
    }).catch(function (error) {
        return res.status(500).json({ 'error': 'unable to verify user'});
    });
};

exports.login = function (req,res){
    const email = req.body.email;
    const password = req.body.password;
    
    if (email == null  || password == null) 
    {
        return res.status(400).json({'error' : 'missing parameters'});
    }
    
    models.User.findOne({ where: { email: email },})
    .then(function(userFound){
        if (userFound) {
            // Je compare le mdp saisie par celui dans la db
            bcrypt.compare(password, userFound.password)
            .then(function(result){
              // si le resultat de la comparaison est OK je retourne un token à l'user
              if (result) 
              {
                res.status(200).json({
                    userId: userFound.userId,
                    isAdmin : userFound.isAdmin,
                    token: jwt.sign(
                        // 3 arguments
                        {
                            userId : userFound.userId,
                            isAdmin : userFound.isAdmin,
                        },
                        `${process.env.SECRETE_KEY_JWT}`,
                        {expiresIn : '12h'}
                    )
                  });
               }else{
                        return res.status(403).json({'error' : 'invalid password'});
                    } 
            })
        }else{
            return res.status(400).json({'error' : 'Email not found in database !'});
        }
    }).catch(function(){
        return res.status(500).json({"error" : "unable to verify user"})
    })
};

exports.getUserProfil = function(req,res){
    var userId = token.decrypt(req);

    if (userId < 0) {
        return res.status(400).json({'error' : 'wrong token'});
    } 
    models.User.findOne({
        attributes: ["userId","email","username","bio","profilPicture"],
        where : {userId : userId}})
        .then(function(user)
        {
            res.status(200).json(user);
        })
        .catch(function(err)
        {
            res.status(500).json({'error' : 'server error'});
        })
};

exports.updateUserProfil = function(req,res){
        var userId = token.decrypt(req);
        console.log(req.file); 
        models.User.findOne({where : {userId : userId}})
        .then((userFound) => {
                if (userFound) 
                {
                    if (req.body.bio) {
                        userFound.bio = req.body.bio;
                        userFound.save(); 
                        return res.status(200).json({ result: 'Biography Updated !'}); 
                    }
                    if (req.file) {
                        if (userFound.profilPicture !== null) {
                            const filename = userFound.profilPicture.split("/images/")[1];
                            fs.unlink("./images/"+filename,(err) => {
                            if (err) throw err;
                            console.log('Fichier supprimé !');
                            });
                        }
                        userFound.profilPicture = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;              
                        userFound.save(); 
                        return res.status(200).json({ result: 'Profil picture Updated!' }); 
                    }
                          
                }
                else 
                    {
                        return res.status(404).json({ 'error': 'User not found' });
                    }
        }).catch(function(err)
             {
                 res.status(500).json({'error':'server error' + err.message});
             })
};

exports.getOneUser = function(req,res){
    models.User.findOne({
        attributes: ["userId","email","username","bio"],
        where : {userId : req.params.id}})
    .then(function(user)
    {
        res.status(200).json(user);
    })
    .catch(function(err)
    {
        res.status(500).json({'error' : 'server error'});
    })
};

// AJOUTER LA SUPPRESSION DE TOUT LES POST LIKE COMMENTAIRE ECT SI L'USER DELETE SONT ACCOUNT
// ++ supprime photo profil user
exports.deleteAccount = function(req,res){
    var userId = token.decrypt(req);
    models.User.findOne({where : {userId : userId }})
    .then(function(deleteUser){
        if (deleteUser) {
            if (deleteUser.profilPicture !== null || deleteUser.profilPicture !== undefined) {
                console.log("log de profilPicture");
                console.log(deleteUser.profilPicture);
                const filename = deleteUser.profilPicture.split("/images/")[1];
                fs.unlink("./images/"+filename,(err) => {
                if (err) throw err;
                console.log('Fichier supprimé !');
                });
            }
            console.log("log de profilpicture");
                console.log(deleteUser.profilPicture);
                models.User.destroy({where :{userId : userId}});
                // search  a Message / Comment / Like belonging to the user
                modelsMessage.Message.destroy({where : {userUserId : userId}})
                modelsComment.Comment.destroy({where : {userId : userId}});
                modelsLike.Like.destroy({where : {userLiked : userId}});
                return res.status(200).json({"response" : "Account has been deleted"})

        }else{
            return res.status(404).json({'error' : 'User not found'});
        }
    }).catch(function(err){
        res.status(500).json({'error' : 'Server Error' + err.message})
    })
};

exports.emailSend = function(req,res){
let email = req.body.email;
models.User.findOne({where : {email : email}})
.then(function(emailFound){
    if (emailFound) {
        // if user exist create link valid 15 minutes
        const secret = `${process.env.SECRETE_KEY_JWT}`;
        const payload = {
                            email : emailFound.email ,
                            id : emailFound.userId,
                        }
        const token = jwt.sign(payload, secret,{expiresIn : '15m'});
        // const link = `http://localhost:3000/reset-password/${emailFound.userId}/${token}`;
        //send email function
        function sendEmail(email, token) {
            var email = email;
            var token = token;
            
            var mail = nodemailer.createTransport({
                service: 'gmail',
                auth: 
                {
                    // !!!!!!!!!!!!!!!!     NE PAS OUBLIER DE METTRE DES VARIABLE D'ENV UNE FOIS EN PRODUCTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    user: "groupomania.reset@gmail.com", // Your email id
                    pass:  "11021102Aa!"// Your password
                }
            });
            var mailOptions = {
                from: 'groupomania.reset@gmail.com',
                to: email,
                subject: 'Reset Password Link - Groupomania',
                html: `<img src="https://s3-eu-west-1.amazonaws.com/course.oc-static.com/projects/Digital+Project+Manager/Group+Project/Groupomania-reddit-FR/assets/icon-left-font.png" alt="logo groupomania">
                <p style="font-size:1.3em;">Vous avez demandé la réinitialisation du mot de passe, veuillez utiliser ce  <a href="http://localhost:8000/reset-password/?id=${emailFound.userId}?token=${token}"><button style="color:red;font-weight:bold;">BOUTON</button></a> pour réinitialiser votre mot de passe</p>
                <p style="font-size:1.6em;">ce lien est valable <strong style="color:red;">15 minutes</strong> </p>
                `
            };
            mail.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(1 + error.message)
                } else {
                    console.log(0)
                }
            });
        }
        sendEmail(email,token)
        return res.status(200).json({result : "The reset password link has been sent to your email address"})
    } else {
        return res.status(400).json({result : "Email not found in DataBase"})
    }
}).catch(function(err){
    return res.status(500).json({error : "Server Error " + err.message})
})
};

exports.getResetPassword = function(req,res){
    const {id,token} = req.params;
    models.User.findOne({where : {userId : id}})
    .then(function(onSucces){
        const secret = `${process.env.SECRETE_KEY_JWT}`;
        const payload = jwt.verify(token,secret);
            if (onSucces){     
                return res.status(200).json({result : "User ID found in Database ! "});
            }else{           
                return res.status(400).json({error : "User ID do not exist in Database !"});
            }
        
    }).catch(function(onFail){
        return res.status(500).json({error :`Server error OR expired token ==> ${onFail.message}`});
    });
};


exports.createNewPassword = function(req,res){
    const {id,token} = req.params;
    models.User.findOne({where :{userId : id}})
    .then(function(onSucces){
        if (onSucces) {
            const saltRounds = 10;
            const myPlaintextPassword = req.body.password;
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                    // Store hash in your password DB.
                    onSucces.password = hash;
                    onSucces.save();
                });
            });
            
            return res.status(200).json({result : "Password has been changed"}) 
        }
        
    })
    .catch(function(onFail){
        return res.status(500).json({error : "Server error"})
    });
};



