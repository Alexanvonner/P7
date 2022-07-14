
const {connexion} = require('./database');
const {Sequelize} = require('sequelize');

const User = connexion.define('user', {
    userId : {type : Sequelize.INTEGER, autoIncrement: true, primaryKey:true},
    email: Sequelize.STRING(255),
    username: Sequelize.STRING(255),
    password: Sequelize.STRING(255),
    bio: {type : Sequelize.STRING(255), allowNull: true},
    isAdmin: Sequelize.INTEGER,
    profilPicture : {type : Sequelize.STRING(255), allowNull:true , defaultValue: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/112692698/original/acca8b04ea6f9923ef49eea29efdfcba42fb4768/logo-design-for-profile-picture-dessin-pour-photo-de-profil.png"}
  }, {tableName: 'User',timestamps:false, underscored: false});

  //User.sync({force : true})

  

exports.User = User;