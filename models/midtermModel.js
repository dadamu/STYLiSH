const { query, beginConnect, beginQuery, begin, commit, rollback, beginRelease } = require('../module/mysql');

async function createFromAuthor(orders) {
    try {
        const pool = await beginConnect();
        await begin(pool);
        await initTable(pool);
        let sql = '';
        let insert = [];
        let variantId = 1;
        for (let index in orders) {
            const order = orders[index];
            const orderId = parseInt(index) + 1;
            const { total, list } = order;

            const orderSql = 'INSERT INTO m_order SET ?;';
            sql += orderSql;
            insert.push({ id: orderId, total })

            list.forEach((product) => {
                const { color, size, id, price, qty } = product;
                const colorSql = 'INSERT IGNORE INTO m_color SET ?;';
                insert.push(color);

                const productSql = 'INSERT IGNORE INTO m_product SET ?;';
                insert.push({
                    variant_id: variantId++,
                    product_id: id,
                    color_code: color.code,
                    size
                });

                const soldSql = 'INSERT INTO m_sold SET ?;';
                insert.push({
                    order_id: orderId,
                    price,
                    qty
                });
                sql += colorSql + productSql + soldSql;
            });

            if (orderId % 500 === 0) {
                await beginQuery(pool, sql, insert);
                console.log(`${Math.floor(orderId / 5000 * 100)}% success`);
                insert = [];
                sql = '';
            };
        }

        if (insert.length !== 0) {
            await beginQuery(pool, sql, insert);
        }
        console.log("part1 success");

        //add sold product table
        const products = await beginQuery(pool, 'SELECT * FROM m_product');
        const productMap = {}
        products.forEach(product => {
            const { product_id: id, color_code: code, size, variant_id: variantId } = product;
            productMap[id + code + size] = variantId;
        });

        let soldId = 1;
        for (let index in orders) {
            const order = orders[index];
            const { list } = order;

            list.forEach((product) => {
                const { color, size, id } = product;
                const hash = id + color.code + size;
                productSoldSql = "INSERT INTO m_product_sold SET ?;";
                insert.push({
                    variant_id: productMap[hash],
                    sold_id: soldId++
                });
                sql += productSoldSql;
            });
            const orderId = parseInt(index) + 1;
            if (orderId % 500 === 0) {
                await beginQuery(pool, sql, insert);
                console.log(`${Math.floor(orderId / 5000 * 100)}% success`);
                insert = [];
                sql = '';
            };
        }
        if (insert.length !== 0) {
            await beginQuery(pool, sql, insert);
        }
        await commit(pool);
        console.log("success");
        await beginRelease(pool);
        return true;
    }
    catch (err) {
        console.log(err);
        await rollback(pool);
        await beginRelease(pool);
        return false;
    }

    async function initTable(pool) {
        const truncateTable = (table) => {
            return beginQuery(pool, `TRUNCATE TABLE ${table};`);
        };
        const setForeignKey = (status) => {
            return beginQuery(pool, 'SET FOREIGN_KEY_CHECKS = ?;', status);
        };
        await setForeignKey(0);
        await truncateTable('m_order');
        await truncateTable('m_sold');
        await truncateTable('m_color');
        await truncateTable('m_product');
        await truncateTable('m_product_sold');
        await setForeignKey(1);
    }
}


async function totalGet() {
    const sql = 'SELECT SUM(total) AS total FROM m_order';
    const total = await query(sql);
    return total[0];
}

async function priceHistogramGet() {
    const sql = 'SELECT price, qty FROM m_sold';
    const priceFromSold = await query(sql);

    return priceFromSold;
}

async function colorPieGet() {
    const selectColumns = 'mp.color_code, mc.name AS color_name, SUM(ms.qty) AS qty';
    const innerJoinBindings = 'INNER JOIN m_product_sold AS mps ON mps.sold_id = ms.id INNER JOIN m_product AS mp ON mps.variant_id = mp.variant_id INNER JOIN m_color AS mc ON mp.color_code = mc.code';
    const sql = `SELECT ${selectColumns} FROM m_sold AS ms ${innerJoinBindings} GROUP BY mp.color_code`;
    const colorPie = await query(sql);
    return colorPie;
}

async function sizeStackGet() {
    const selectColumns = 'mp.product_id AS product_id, mp.size AS size, SUM(ms.qty) AS qty';
    const innerJoinBindings = 'INNER JOIN m_product_sold AS mps ON mps.sold_id = ms.id INNER JOIN m_product AS mp ON mps.variant_id = mp.variant_id';
    const sql = `SELECT ${selectColumns} FROM m_sold AS ms ${innerJoinBindings}  GROUP BY product_id, size`;
    const sizeStack = await query(sql);
    const sum = {};
    sizeStack.forEach(el => {
        let current = sum[el.product_id] || 0;
        sum[el.product_id] = current + el.qty;
    });
    sumSorted = Object.keys(sum).sort(function (a, b) { return sum[b] - sum[a] })
    sumSorted.length = 5;
    const result = [];
    sumSorted.forEach(item => {
        const insert = sizeStack.filter(el => el.product_id === parseInt(item));
        result.push(...insert);
    });
    return result;
}

async function newOrderCreate(order) {
    try {
        const pool = await beginConnect();
        await begin(pool);
        const { total, list } = order;

        const orderSql = 'INSERT INTO m_order SET ?;';
        const orderInsert = await beginQuery(pool, orderSql, { total });
        const orderId = orderInsert.insertId;

        let sql = '';
        const insert = [];
        list.forEach(async (product) => {
            const { color, size, id, price, qty } = product;
            const colorSql = 'INSERT IGNORE INTO m_color SET ?;';
            await beginQuery(pool, colorSql, color);

            const productSql = 'INSERT IGNORE INTO m_product SET ?;';
            await beginQuery(pool, productSql, {
                product_id: id,
                color_code: color.code,
                size
            });
            const soldSql = 'INSERT INTO m_sold SET ?;';
            const sold = await beginQuery(pool, soldSql, {
                order_id: orderId,
                price,
                qty
            });
            const soldId = sold.insertId;

            const selectVariantSql = 'SELECT variant_id FROM m_product WHERE product_id = ? AND color_code = ? AND size = ?;';
            const variantSelect = await beginQuery(pool, selectVariantSql, [id, color.code, size]);

            const productSoldSql = "INSERT INTO m_product_sold SET ?;";
            const variantId = variantSelect[0].variant_id;
            await beginQuery(pool, productSoldSql, {
                variant_id: variantId,
                sold_id: soldId
            });
        });
        await commit(pool);
        await beginRelease(pool);
        return true;
    }
    catch (err) {
        console.log(err);
        await rollback(pool);
        await beginRelease(pool);
        return false;
    }
};

module.exports = { createFromAuthor, totalGet, priceHistogramGet, colorPieGet, sizeStackGet, newOrderCreate };