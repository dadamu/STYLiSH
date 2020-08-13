const express = require('express');
const router = express.Router();
const orderController = require('../../controller/orderController');

router.post('/checkout', orderController.checkoutCreate);

router.get('/payments', orderController.paymentsGet);
router.get('/paymentsCache', orderController.paymentsGetCache);
router.get('/paymentsGroup', orderController.paymentsGetGroup);

router.get('/fakeOrder', orderController.fakePaymentsCreate);
router.delete('/resetCache', orderController.resetCache);

module.exports = router;