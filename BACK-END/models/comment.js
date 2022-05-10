const {connexion} = require('./database');
const {Sequelize} = require('sequelize');
const models = require('./message');
const modelsUser = require('./user');

const Comment =  connexion.define('comment',{     
     comment: Sequelize.STRING(255),
     userId : Sequelize.STRING(255)
},{tableName: 'Comment',timestamps:false, underscored: false });
Comment.belongsTo(models.Message);
Comment.belongsTo(modelsUser.User);
//Comment.sync({force : true})



 exports.Comment = Comment;