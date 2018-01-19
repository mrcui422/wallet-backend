// middlewares/auth.js
/*var models = require('../models/index');
const err_message = 'Not authorized for your user role. Please contact the admin to upgrade your accout';

module.exports = {

    requireRole: (roles) => {
        return (req, res, next) => {
             // if (req.session.user && req.session.user.role === role) {
              //     next();
              // } else {
              //     res.send(403);
              // }
            models.User.find({
                where: {id: req.uid}
            }).then((user) => {
                console.log(user.role);
                if( roles.indexOf(user.role) > -1 ){
                    next();        
                }else{
                    return res.status(401).send({'success' : false, 'message' : err_message});
                }
            });
        }
    }

};
