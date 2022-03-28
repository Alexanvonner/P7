const {connexion} = require('./database');
const {Sequelize} = require('sequelize');
const models = require('./user')

const Message =  connexion.define('message',{     
     content:Sequelize.STRING(255),
     attachment: {type : Sequelize.STRING(255), required: false},
     like : Sequelize.INTEGER
},{tableName: 'Message',timestamps:false, underscored: false });
Message.belongsTo(models.User)
//Message.sync({force : true})
  


 exports.Message = Message;