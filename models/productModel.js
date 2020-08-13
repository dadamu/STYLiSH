const { query } = require('../module/mysql');
const infoModel = require('./productInfoModel');
const imageModel = require('./imageModel');
const { IMG_HOST } = require("../config/config");

async function get(data) {
    //find product_info by index
    let getInfo = await infoModel.get(data);

    let result = {};
    result["data"] = [];
    let idList = [];

    //if length > 7 has next page
    if (getInfo.length === 7) {
        getInfo.pop();
        result["next_paging"] = parseInt(data.paging) + 1;
    }
    else if (getInfo.length === 0)
        return { data: [] };

    for (let item of getInfo) idList.push(item["product_id"]);
    let sql = `SELECT * FROM product WHERE product_id in (?);`;
    let variants = query(sql, [idList]);
    let images = imageModel.get(idList);
    let productList = await Promise.all([variants, images]);
    //set other info to a obj with two Promise
    let getOthers = {};
    let othersPromise = new Promise((resolve) => {
        productList[0].forEach(el => {
            let id = el['product_id'];
            let size = el["size"];

            let color = {
                code: el["color_code"],
                name: el["color_name"]
            };
            let variant = {
                color_code: el["color_code"],
                size: el["size"],
                stock: el["stock"]
            };
            //check id and insert into same place
            if (getOthers[id]) {
                if (!getOthers[id]["checkDuplicateMap"].has(size)) {
                    getOthers[id]["sizes"].push(size);
                    getOthers[id]["checkDuplicateMap"].set(size, true);
                }

                if (!getOthers[id]["checkDuplicateMap"].has(color["code"])) {
                    getOthers[id]["colors"].push(color);
                    getOthers[id]["checkDuplicateMap"].set(color["code"], true);
                }

                getOthers[id]["variants"].push(variant);
            }
            else {
                //initial set with id
                getOthers[id] = { id };
                getOthers[id]["checkDuplicateMap"] = new Map();
                getOthers[id]["sizes"] = [size];
                getOthers[id]["colors"] = [color];
                getOthers[id]["variants"] = [variant];
                //set check duplicate map
                getOthers[id]["checkDuplicateMap"].set(size, true);
                getOthers[id]["checkDuplicateMap"].set(color["code"], true);
            }
        });
        resolve('success');
    });
    //import images to getDataOthers with Promise
    let imagesPromise = new Promise((resolve) => {
        productList[1].forEach((el) => {
            let id = el["product_id"];
            if (getOthers[id]["images"]) {
                getOthers[id]["images"].push(IMG_HOST + el["url"]);
            }
            else {
                getOthers[id]["images"] = [IMG_HOST + el["url"]];
            }
        });
        resolve('success');
    });
    await Promise.all([othersPromise, imagesPromise]);


    //Combine getInfo getOthers
    getInfo.forEach((el) => {
        //change id name and delete category
        let id = el["product_id"];
        el["id"] = id;
        delete el["product_id"];
        delete el["category"];

        el["main_image"] = IMG_HOST + el["main_image"];
        el["sizes"] = getOthers[id]["sizes"];
        el["colors"] = getOthers[id]["colors"];
        el["variants"] = getOthers[id]["variants"];
        el["images"] = getOthers[id]["images"];

        result["data"].push(el);
    });


    return result;
}


async function create(products) {
    let sql = `INSERT INTO product(product_id, size, color_code, color_name, stock) VALUES ? `;
    let list = []
    for (let variant of products["variants"]) {
        let obj = {};
        obj["product_id"] = products["productId"];
        obj["size"] = variant["size"];
        obj["color_code"] = variant["colorCode"];
        obj["color_name"] = variant["colorName"];
        obj["stock"] = variant["stock"];
        list.push(Object.values(obj));
    }
    let insert = await query(sql, [list]);
    return insert;
}


module.exports = { get, create };

