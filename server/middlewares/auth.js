// middlewares/auth.js

var jwt = require('jsonwebtoken');
var config = require('../config.json');

var AuthService = require('../services/AuthService.js');

module.exports = function(req, res, next) {
    /*
     * Check if authorization header is set
     */
    var token;
    if( req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization') ) {
        try {
            /*
             * Try to decode & verify the JWT token
             * The token contains user's id ( it can contain more informations )
             * and this is saved in req.user object
             */



            var parts = req.headers['authorization'].split(' ');
            if (parts.length == 2) {
                var scheme = parts[0],
                credentials = parts[1];
                if (/^Bearer$/i.test(scheme)) {
                    token = credentials;
                }
            } else {
                return res.status(401).send({'success' : false, 'message' : 'Authorization format incorrect'});
            }

            AuthService.verifyToken(token, function (err, payload) {
                if (err) {
                    return res.status(401).send({'success' : false, 'message' : 'Invalid token'});
                }
                req.uid = payload.id;
                next();
            });
            // req.user = jwt.verify(token, config.JWT_SECRET);
        } catch(err) {
            /*
             * If the authorization header is corrupted, it throws exception
             * So return 401 status code with JSON error message
             */
            return res.status(401).json({
                error: {
                    msg: 'Failed to authenticate token!'
                }
            });
        }
    } else {
        /*
         * If there is no autorization header, return 401 status code with JSON
         * error message
         */
        return res.status(401).json({
            error: {
                msg: 'No token!'
            }
        });
    }
    // next();
    return;
}