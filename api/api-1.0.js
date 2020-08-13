const express = require('express');
const productRouter = require('./1.0/products');
const productInfoRouter = require('./1.0/product_info');
const uploadRouter = require('./1.0/upload');
const marketingRouter = require('./1.0/marketing');
const userRouter = require('./1.0/user');
const orderRouter = require('./1.0/order');
const midtermRouter = require('./1.0/midterm');
const router = express.Router();
const version = '/1.0';

router.use(`${version}/products`, productRouter);
router.use(`${version}/product_info`, productInfoRouter);
router.use(`${version}/upload`, uploadRouter);
router.use(`${version}/marketing`, marketingRouter);
router.use(`${version}/user`, userRouter);
router.use(`${version}/order`, orderRouter);
router.use(`${version}/midterm`, midtermRouter);


module.exports = router;