const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
require('dotenv').config();


module.exports = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];    
      const decodedToken = jwt.verify(token,`${process.env.SECRETE_KEY_JWT}`);
      
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
      } else {
        next();
      }
    } catch {
      res.status(401).json({
        error: 'Invalid request!'
      });
    }
  };


function decrypt(req){
      const token = req.headers.authorization.split(' ')[1];    
      const decodedToken = jwt.verify(token,`${process.env.SECRETE_KEY_JWT}`);
      const userId = decodedToken.userId;
      return userId;
}


function decryptIsAdmin(req){
  const token = req.headers.authorization.split(' ')[1];    
  const decodedToken = jwt.verify(token,`${process.env.SECRETE_KEY_JWT}`);
  const isAdmin = decodedToken.isAdmin;
  return isAdmin;
}


module.exports.decryptIsAdmin = decryptIsAdmin;
module.exports.decrypt = decrypt;