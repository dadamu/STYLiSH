const { query } = require('../module/mysql');


async function get(email) {
    let sql = 'SELECT * FROM user WHERE email = ?;';
    let result = await query(sql, email);
    return result;
}

async function create(register) {
    let sql = 'INSERT INTO user SET ? ;';
    let insert = await query(sql, register);
    return insert;
}


module.exports = { get, create };