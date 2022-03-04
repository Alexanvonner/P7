// import
const bcrypt = require("bcrypt");
jwt = require('jsonwebtoken');
const token = require('../middleware/jwt');
const dotenv = require('dotenv');
require('dotenv').config();
// importation models de la bdd User.js
const models = require("../models/user");




// regex 
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


// ROUTES
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
                        isAdmin: true,
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
    // Params
    const email = req.body.email;
    const password = req.body.password;
    
    if (email == null  || password == null) {
        return res.status(400).json({'error' : 'missing parameters'});
    }
    
    models.User.findOne({
        where: { email: email },
    })
    .then(function(userFound){
        if (userFound) {
            // Je compare le mdp saisie par celui dans la db
            bcrypt.compare(password, userFound.password).then(function(result){
              // si le resultat de la comparaison est OK je retourne un token à l'user
              if (result) 
              {
                res.status(200).json({
                    userId: userFound.userId,
                    token: jwt.sign(
                        // 3 arguments
                        {userId : userFound.userId},
                        `${process.env.SECRETE_KEY_JWT}`,
                        {expiresIn : '12h'}
                    )
                  });
              }  
            })
        }else{
            return res.status(403).json({'error' : 'invalid password'});
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
        attributes: ["userId","email","username","bio"],
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



    exports.updateuUserProfil = function(req,res){
    var userId = token.decrypt(req);
    if (userId < 0) {
        return res.status(400).json({'error' : 'wrong token'});
    } 
    const bio = req.body.bio
    
    models.User.findOne({
        attributes : ['userId','bio'],
        where: {userId : userId}
    }).then(function(userFound){
        if (userFound) {        
            userFound.bio = bio;
            userFound.save();
            return res.status(200).json({'response' : 'bio validated update'})
        }
        else{
            return res.status(404).json({'error' : 'user not found'});
        }
    }).catch(function(err){
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


exports.deleteAccount = function(req,res){
    var userId = token.decrypt(req);
    if (userId < 0) {
        return res.status(400).json({'error' : 'wrong token'});
    } 
    models.User.destroy({where : {userId : userId }})
    .then(function(deleteUser){
        if (deleteUser) {
                return res.status(200).json({"response" : "Account has been deleted"})

        }else{
            return res.status(404).json({'error' : 'user not found'});
        }
    }).catch(function(err){
        res.status(200).json({'error' : 'server error'})
    })
}

