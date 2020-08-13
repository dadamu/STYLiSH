const axios = require('axios');
require('dotenv').config();
const asyncHandler = require('../module/asyncHandler');
const orderModel = require('../models/orderModel');
const redisAsync = require('../module/redisAsync');
const fakeOrderGenerate = require('../module/fakeOrder');

const partnerKey = process.env.PARTNERKEY;
const merchantID = process.env.MERCHANTID;

const checkoutCreate =
    asyncHandler(async (req, res, next) => {
        let checkout = req.body;
        let order = checkout['order'];
        let recipient = order['recipient'];

        let cardholder = {
            name: recipient['name'],
            phone_number: recipient['phone'],
            email: recipient['email'],
            address: recipient['address']
        };

        let details = getDetails(checkout);
        let endpoint = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime';
        let headers = {
            'content-type': 'application/json',
            'x-api-key': partnerKey
        };

        let list = checkout['list'];
        let recipientId = await orderModel.insertRecipient(recipient);
        let checkoutId = await orderModel.insertCheckout(checkout, recipientId);
        await orderModel.listInsert(list, checkoutId);
        let orderStock = await orderModel.checkStock(checkoutId);

        if (orderStock.length > 0) {
            let pay = {
                prime: checkout['prime'],
                partner_key: partnerKey,
                merchant_id: merchantID,
                details: details,
                amount: order['total'],
                order_number: checkoutId,
                cardholder: cardholder,
                remember: false
            };

            let tappay = await axios.post(endpoint, pay, { headers });
            let { status } = tappay.data;

            if (status === 0) {
                await orderModel.paid(tappay.data);
                list.forEach(el => {
                    redisAsync.del('product-' + el['id']);
                });
                res.json({ data: { number: checkoutId } });
            }
            else {
                let err = new Error('Wrong Card Information!');
                err.status = 400;
                next(err);
            }
        }
        else {
            let err = new Error('Not Enough Stock!');
            err.status = 500;
            next(err);
        }
    });

const paymentsGetCache = asyncHandler(async (req, res) => {
    const cacheData = await redisAsync.get('payments');
    if (!cacheData) {
        let checkout = await orderModel.getCheckout();
        if (checkout.length === 0) {
            res.json({ data: [] });
            return;
        }
        const data = [];
        let userMap = {};
        checkout.forEach(el => {
            let total = el['total'];
            let userId = el['recipient_id'];
            let sum = userMap[userId] || 0;
            userMap[userId] = total + sum;
        });


        for (let [key, value] of Object.entries(userMap)) {
            let info = {
                user_id: parseInt(key),
                total_payment: value
            };
            data.push(info);
        }
        redisAsync.set('payments', JSON.stringify(data));
        res.json({ data });
        return;
    }
    const data = JSON.parse(cacheData);
    res.json({ data });
});


const paymentsGet = asyncHandler(async (req, res) => {

    let checkout = await orderModel.getCheckout();
    if (checkout.length === 0) {
        res.json({ data: [] });
        return;
    }
    const data = [];
    let userMap = {};
    checkout.forEach(el => {
        let total = el['total'];
        let userId = el['recipient_id'];
        let sum = userMap[userId] || 0;
        userMap[userId] = total + sum;
    });


    for (let [key, value] of Object.entries(userMap)) {
        let info = {
            user_id: parseInt(key),
            total_payment: value
        };
        data.push(info);
    }
    res.json({ data });

});

const paymentsGetGroup = asyncHandler(async (req, res) => {
    let checkout = await orderModel.getCheckoutGroup();
    if (checkout.length === 0) {
        res.json({ data: [] });
        return;
    }
    res.json({ data: checkout });
});

const fakePaymentsCreate = asyncHandler(async (req, res) => {
    const { userNum, checkoutNum, random } = req.query;
    if (userNum && checkoutNum && random) {
        await fakeOrderGenerate(userNum, checkoutNum, random);
        await redisAsync.del('payments');
        res.status(200).send('Success');
    }
    else {
        res.status(403).send('Need more query');
    }
});

const resetCache = asyncHandler(async (req, res) => {
    redisAsync.del('payments');
    res.send('ok');
});

/*
    generate detail to set in payment
    input : checkout obj
    return : detail string from input
*/
function getDetails(checkout) {
    let detail = '';
    for (let item of checkout['list']) {
        let id = item['id'];
        let size = item['size'];
        let color = item['color']['name'];
        detail += `${id}:${size}&${color};`;
    }
    return detail;
}

module.exports = { checkoutCreate, paymentsGet, fakePaymentsCreate, paymentsGetGroup, paymentsGetCache, resetCache };