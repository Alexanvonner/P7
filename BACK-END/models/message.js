const {connexion} = require('./database');
const {Sequelize} = require('sequelize');

const Message =  connexion.define('message',{
     idUSERS: Sequelize.INTEGER(255),
     title: Sequelize.STRING(255),
     content: Sequelize.STRING(255),
     attachment: Sequelize.STRING(255),
     likes: Sequelize.INTEGER(255)
},{tableName: 'Message',timestamps:false, underscored: false});

User.sync({force : true})
  

 exports.Message = Message;