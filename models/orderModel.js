const {query,  beginConnect, beginQuery, begin, commit, rollback, beginRelease} = require('../module/mysql');
//const sleep = require('./sleep');

/*
    insert or select recipient with a specific email
    input : recipient obj
    return : insert id or select id if exists
*/
async function insertRecipient(recipient) {
    let pool = await beginConnect();
    await begin(pool);
    let sql = `SELECT id FROM recipient WHERE email = ? FOR UPDATE; `;
    let email = recipient["email"];
    let select = await beginQuery(pool, sql, email);
    if (select.length === 0) {
        let data = {
            name: recipient["name"],
            phone: recipient["phone"],
            email: recipient["email"],
            address: recipient["address"]
        };
        let sql = `INSERT INTO recipient SET ?`;
        let insert = await beginQuery(pool, sql, data);
        commit(pool);
        beginRelease(pool);
        return insert.insertId;
    }
    else {
        commit(pool);
        beginRelease(pool);
        return select[0]["id"];
    }
}

/*
    insert checkout to sql
    input: checkout obj, recipient id number
    return : insert id
*/
async function insertCheckout(checkout, recipientId) {
    let order = checkout["order"];
    let recipient = order["recipient"];
    let data = {
        prime: checkout["prime"],
        payment: order["payment"],
        subtotal: order["subtotal"],
        freight: order["freight"],
        total: order["total"],
        time: recipient["time"],
        recipient_id: recipientId,
        status: false
    };
    let sql = "INSERT INTO  checkout SET ?";
    let insert = await query(sql, data);
    return insert.insertId;
}

/*
    insert orderlist to sql
    input: list array, checkout id number
    return : insert id
*/
async function listInsert(list, checkoutId) {
    let sql = "INSERT INTO order_list (product_id, color_code, size, price, qty, checkout_id) VALUES ?;";
    let result = [];
    for (let item of list) {
        let obj = {
            product_id: item["id"],
            color_code: item["color"]["code"],
            size: item["size"],
            price: parseInt(item["price"]),
            qty: parseInt(item["qty"]),
            checkout_id: checkoutId
        }
        result.push(Object.values(obj));
    }
    let data = [result];
    let insert = await query(sql, data);
    return insert.insertId;
}

/*
    check products stock in checkout
    input : checkout id number
    return : order product array
*/
async function checkStock(checkoutId) {
    let pool = await beginConnect();
    await begin(pool);
    let sql = `SELECT o.id, p.product_id, p.color_code, p.size, o.qty, p.stock from product AS p inner join order_list AS o
                ON (o.product_id = p.product_id AND o.color_code = p.color_code AND o.size = p.size )
                WHERE o.checkout_id = ? FOR UPDATE;`;
    let data = checkoutId;
    let orderStock = await beginQuery(pool, sql, data);
    let check = orderStock.every(el => el["stock"] >= el["qty"]);
    //await sleep(10000);
    if (check) {
        let data = [];
        let sql = "";
        orderStock.forEach(el => {
            sql += `UPDATE product AS p inner join order_list AS o
                    ON  o.product_id = p.product_id 
                    AND o.color_code = p.color_code 
                    AND o.size = p.size  
                    set p.stock = ?  
                    WHERE o.id = ?;`;
            data.push(el["stock"] - el["qty"], el["id"]);
        });
        await beginQuery(pool, sql, data);
        commit(pool);
        beginRelease(pool);
        return orderStock;
    }
    else {
        rollback(pool);
        beginRelease(pool);
        return [];
    }
}

/*
    insert data into paid table
    input : paid obj
    return : none
 */
async function paid(paid) {
    let paidSql = "INSERT INTO paid SET ?;";
    let pay = {
        amount: paid["amount"],
        acquirer: paid["acquirer"],
        currency: paid["currency"],
        rec_trade_id: paid["rec_trade_id"],
        bank_transaction_id: paid["bank_transaction_id"],
        order_number: paid["order_number"],
        auth_code: paid["auth_code"],
        transaction_time_millis: paid["transaction_time_millis"],
        last_four: paid["card_info"]["last_four"],
        bin_code: paid["card_info"]["bin_code"],
        country_code: paid["card_info"]["country_code"],
        merchant_id: paid["merchant_id"]
    };
    await query(paidSql, pay);
    let updateSql = "UPDATE checkout SET status = 1 WHERE id = ?";
    let id = paid["order_number"];
    await query(updateSql, id);
    return;
}

async function getCheckout(){
    let sql = `SELECT recipient_id, total FROM checkout`;
    let select = await query(sql);
    return select;
}

async function getCheckoutGroup(){
    const sql = `SELECT recipient_id AS user_id,SUM(total) AS total_payment FROM checkout GROUP BY user_id`;
    const select = await query(sql);
    return select;
}

module.exports = { checkStock, getCheckout, paid, insertRecipient, insertCheckout, listInsert, getCheckoutGroup };

