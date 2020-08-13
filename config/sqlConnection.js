require('dotenv').config();
const mysql = require('mysql');
const mysqlConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    //pool
    connectionLimit: 200,
    queueLimit: 200,
    waitForConnections: true,
    acquireTimeout: 5000
};

const con = mysql.createPool(mysqlConfig);

module.exports = con;