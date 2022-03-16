const models = require("../models/message");
const token = require('../middleware/jwt');


exports.createPost = function (req, res) {
    
    const content = req.body.content;
    const attachment = req.body.attachment;

    const userId = token.decrypt(req);

    models.Message.create({
        content:  content,
        attachment: attachment, 
        likes: 0,
        userUserId : userId

    }).then(function (message) {
        return res.status(200).json({ 'result': 'post create' });
    }).catch(function (err) {
        return res.status(500).json({ "error": "server error" + err.message });
    });


}

exports.UpdatePost = function(req,res){

}