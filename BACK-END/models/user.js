
const {connexion} = require('./database');
const {Sequelize} = require('sequelize');

const User = connexion.define('user', {
    userId : {type : Sequelize.INTEGER, autoIncrement: true, primaryKey:true},
    email: Sequelize.STRING(255),
    username: Sequelize.STRING(255),
    password: Sequelize.STRING(255),
    bio: {type : Sequelize.STRING(255), allowNull: true},
    isAdmin: Sequelize.INTEGER
  }, {tableName: 'Users',timestamps:false, underscored: false});

  //User.sync({force : true})

  

exports.User = User;