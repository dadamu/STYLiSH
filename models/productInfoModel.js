const { query } = require('../module/mysql');


/* 
    check product exists or not
    input : id
    return : select length
*/
async function check(id){
    let  sql = `SELECT * FROM product_info Where product_id = ?;`;
    let select = await query(sql, id);
    return select.length;
}


async function create(info) {
    info["product_id"] = info["id"];
    info["main_image"] = "";
    delete info["id"];
    delete info["mainImage"];
    let sql = `INSERT INTO product_info SET ?`;
    let insert = await query(sql, info);
    return insert;
}


async function get(data) {
    let sql;
    if (data["id"]) {
        sql = `SELECT * FROM product_info WHERE product_id = ?;`;
        data = data.id;
    }
    else if (data["keyword"]) {
        sql = `SELECT * FROM product_info WHERE title LIKE ? LIMIT 7 OFFSET ?;`;
        data = [`%${data.keyword}%`, data.paging * 6];
    }
    else if (data["category"] === "all") {
        sql = `SELECT * FROM product_info LIMIT 7 OFFSET ?;`;
        data = data.paging * 6;
    }
    else {
        sql = `SELECT * FROM product_info WHERE category = ? LIMIT 7 OFFSET ?;`;
        data = [data.category, data.paging * 6];
    }
    let select = await query(sql, data);
    return select;
}

/*
    update info set main image column with id
    input : array with [ main_image, product_id ]
    return : update obj
*/
async function updateImage(list) {
    let sql =  `UPDATE product_info SET main_image = ? WHERE product_id = ?;`;
    let update = await query(sql, list);
    return update;
}

module.exports = { create, updateImage, get, check };