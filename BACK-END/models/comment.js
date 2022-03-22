const {connexion} = require('./database');
const {Sequelize} = require('sequelize');
const models = require('./message')

const Comment =  connexion.define('comment',{     
     comment: Sequelize.STRING(255),
     userId : Sequelize.STRING(255)
},{tableName: 'Comment',timestamps:false, underscored: false });
Comment.belongsTo(models.Message)
//Comment.sync({force : true})
  


 exports.Comment = Comment;