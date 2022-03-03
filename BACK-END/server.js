// Imports 
const http = require('http')

// Import Sequelize Connection
//const sequelize = require('sequelize');


//importer l'application APP.JS
const app = require('./app.js');

const server = http.createServer(app);

 

// Launch server
server.listen(3000, function() {
    console.log('Server en écoute sur le PORT 3000');
});
