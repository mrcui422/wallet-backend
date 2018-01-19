var bcrypt = require('bcryptjs'),
	jwt = require('jsonwebtoken'),
	secret = "Arr1v1ngS0m3wh3r3",
	expiration = '1h';
var Passport = require('passport');

module.exports = {

	encryptPassword: function(password, callback) {
		bcrypt.genSalt(10, function (err, salt) {
			if(err && callback) return callback(err);
			bcrypt.hash(password, salt, function (err, hash) {
				if(err && callback) return callback(err);
				callback && callback(null, hash);
			});
		});
	},

	comparePassword: function(password, user, callback) {

		if(user.password) {
			bcrypt.compare(password, user.password, function (err, match) {
				if(err && callback) return callback(err);
				else if(match && callback) {
					return callback(null, true);
				}
				else {
					return callback(null, false);
				}
			});
		}
		
		//
		// code for the case when users authenticated with social logins 
		//
		// else {
		// 	Passport.findOne({user : user.id}, function(err, passport) {
		// 		if(passport) {
		// 			passport.validatePassword(password, function(err) {
		// 				if(!err) {
		// 					return callback(null, true);
		// 				}
		// 				else {
		// 					return callback(null, false);
		// 				}
		// 			});
		// 		}
		// 	});
		// }
	},

	generateToken: function(payload) {
		return jwt.sign(
			payload,
			secret,
			{
				expiresIn : expiration
			}
		);
	},

	verifyToken: function(token, callback) {
		return jwt.verify(
			token,
			secret,
			{},
			callback
		);
	}
};
