var net = require('net');
var events = require('events');

//Gives us global access to everything we need for each hashing algorithm
require('./algoProperties.js');


exports.daemon = require('./daemon.js');
