const redis = require('redis');
require('dotenv').config();
const { REDIS_PORT, REDIS_HOST } = process.env;
const client = redis.createClient( REDIS_PORT, REDIS_HOST);
module.exports = { client };