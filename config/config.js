require('dotenv').config();
const AWS = require('aws-sdk');

const HOST = process.env.HOST;
const IMG_HOST = process.env.IMG_HOST;
const KEY = process.env.KEY;
const DEFALTPWD = process.env.DEFALTPWD;

const AWSS3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = { IMG_HOST, HOST, KEY, DEFALTPWD, AWSS3 };