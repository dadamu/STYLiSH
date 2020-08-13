const { query } = require('../module/mysql');

/*
    input: none
    retun: all campaigns
*/
async function getAll() {
    let sql = `SELECT * FROM campaign`;
    let result = await query(sql);
    return result;
}

/*
    input: obj with id, pictureUrl, story
    retun: insert obj
*/
async function create(campaign) {
    let sql = `INSERT INTO campaign SET ?`;
    let data = {
        product_id: campaign["id"],
        picture: campaign["pictureUrl"],
        story: campaign["story"]
    }
    let result = await query(sql, data);
    return result;
}

module.exports = { getAll, create };