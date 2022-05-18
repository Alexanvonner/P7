
const {connexion} = require('./database');
const {Sequelize} = require('sequelize');
const models = require('../models/message');

const Like = connexion.define('like', {
    userLiked : Sequelize.INTEGER,
  }, {tableName: 'Like',timestamps:false, underscored: false});
Like.belongsTo(models.Message)

//Like.sync({force : true})

  

exports.Like = Like;