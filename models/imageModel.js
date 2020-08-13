const { query } = require('../module/mysql');

/*
    input : obj { productId : value ,otherImages : []}
    return : sql return
 */
async function create(data) {
    let sql = `INSERT INTO image (url, product_id) VALUES ?;`;
    let inserts = [];
    for (let item of data["otherImages"]) {
        let obj = {};
        obj["url"] = item;
        obj["product_id"] = data["productId"];
        inserts.push(Object.values(obj));
    }
    sql = sql.substring(0, sql.length - 1);
    let insert = await query(sql, [inserts]);
    return insert;
}


function get(idList) {
    let sql = `SELECT url, product_id FROM image WHERE product_id in (?);`;
    let data = [idList];
    let select = query(sql, data);
    return select;
}

module.exports = { create, get };