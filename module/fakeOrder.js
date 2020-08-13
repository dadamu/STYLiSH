const { beginConnect, beginQuery, beginRelease, rollback, commit, begin } = require("./mysql");


async function generate(userNum, checkoutNum, random) {
    try {
        const pool = await beginConnect();
        await begin(pool);
        await truncateFakeData(pool);
        await createRecipients(pool, userNum);
        if (checkoutNum > 50000) {
            const num = Math.floor(checkoutNum / 50000);
            const rem = checkoutNum - num * 50000;
            for (let i = 0; i < num; i++) {
                await createCheckout(pool, i * 50000, (i + 1) * 50000, userNum, random);
            }
            if (rem) {
                await createCheckout(pool, num * 50000, num * 50000 + rem, userNum, random);
            }
        }
        else {
            await createCheckout(pool, 0, checkoutNum, userNum, random);
        }
        commit(pool);
        beginRelease(pool);
        console.log('success');
        return;
    }
    catch (err) {
        console.log(err);
        rollback(pool);
        beginRelease(pool);
    }

}

async function truncateFakeData(pool) {
    const truncateTable = (table) => {
        return beginQuery(pool, `TRUNCATE TABLE ${table};`);
    };
    const setForeignKey = (status) => {
        return beginQuery(pool, 'SET FOREIGN_KEY_CHECKS = ?;', status);
    };
    await setForeignKey(0);
    await truncateTable('recipient');
    await truncateTable('checkout');
    await setForeignKey(1);
}

async function createRecipients(pool, count) {
    let recipients = []
    for (let i = 0; i < count; i++) {
        let recipient = {
            id: i + 1,
            name: `user${i + 1}`,
            phone: '09123123123',
            email: `user${i + 1}@test.com`,
            address: 'here'
        };
        recipients.push(Object.values(recipient));
    }
    let sql = `INSERT INTO recipient VALUES ?`;
    await beginQuery(pool, sql, [recipients]);
    return;
}

async function createCheckout(pool, start, count, userNum, random) {
    let checouts = [];
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    for (let i = start; i < count; i++) {
        let subtotal = getRandomInt(random) + 1;
        let num = getRandomInt(userNum) + 1;
        let recipient = num;
        let checkout = {
            id: (i + 1),
            prime: i,
            payment: "credit_card",
            subtotal: subtotal,
            freight: 200,
            total: subtotal + 200,
            time: 'today',
            recipient: recipient,
            status: 1
        };
        checouts.push(Object.values(checkout));
    }
    let sql = `INSERT INTO checkout VALUES ?`;
    await beginQuery(pool, sql, [checouts]);
    return;
}

module.exports = generate;