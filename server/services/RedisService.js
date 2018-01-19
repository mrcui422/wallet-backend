var redis = require('redis');

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config.json')[env];
var redisConfig = config.redis;

var client;
if (!redisConfig.connection_string) {
    client = redis.createClient(redisConfig.port, redisConfig.host);
    client.auth(redisConfig.password);
    client.select(redisConfig.db);
}
else {
    client = redis.createClient(redisConfig.connection_string,
        { tls: { servername: url.parse(redisConfig.connection_string).hostname } });
}

module.exports = client