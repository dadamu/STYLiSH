const axios = require("axios");
const asyncHandler = require("../module/asyncHandler");
const midtermModel = require("../models/midtermModel");
const redisAsync = require("../module/redisAsync");

const createOrderFromAuthor =
    asyncHandler(async (req, res) => {
        const io = req.app.get('socket');
        const { pass } = req.body;
        if (pass !== 'stylish') {
            res.status(403).json({ msg :'Invalid'});
            return;
        }
        const getOrder = await axios.get('http://arthurstylish.com:1234/api/1.0/order/data');
        const { data: getData } = getOrder;
        res.status(201).json({msg : 'Requeset Success'});
        const result = await midtermModel.createFromAuthor(getData);
        if (result) {
            await redisAsync.del('total');
            await redisAsync.del('priceHisto');
            await redisAsync.del('colorPie');
            await redisAsync.del('sizeStack');
            console.log('delete Redis');
            io.emit('refresh');
        }
        else {
            res.status(500).json({msg :'Error'});
        }
    });

const totalGet =
    asyncHandler(async (req, res) => {
        let cacheData = await redisAsync.get('total');
        if (!cacheData) {
            const total = await midtermModel.totalGet();
            redisAsync.set('total', JSON.stringify(total));
            res.json({ data: total });
        }
        else {
            const total = JSON.parse(cacheData);
            res.json({ data: total });
        }
    });

const priceHistogramGet =
    asyncHandler(async (req, res) => {
        let cacheData = await redisAsync.get('priceHisto');
        if (!cacheData) {
            const priceHistogram = await midtermModel.priceHistogramGet();
            redisAsync.set('priceHisto', JSON.stringify(priceHistogram));
            res.json({ data: priceHistogram });
        }
        else {
            const priceHistogram = JSON.parse(cacheData);
            res.json({ data: priceHistogram });
        }
    });

const colorPieGet =
    asyncHandler(async (req, res) => {
        let cacheData = await redisAsync.get('colorPie');
        if (!cacheData) {
            const colorPie = await midtermModel.colorPieGet();
            redisAsync.set('colorPie', JSON.stringify(colorPie));
            res.json({ data: colorPie });
        }
        else {
            const colorPie = JSON.parse(cacheData);
            res.json({ data: colorPie });
        }
    });

const sizeStackGet =
    asyncHandler(async (req, res) => {
        let cacheData = await redisAsync.get('sizeStack');
        if (!cacheData) {
            const sizeStack = await midtermModel.sizeStackGet();
            redisAsync.set('sizeStack', JSON.stringify(sizeStack));
            res.json({ data: sizeStack });
        }
        else {
            const sizeStack = JSON.parse(cacheData);
            res.json({ data: sizeStack });
        }
    });

const newOrderCreate =
    asyncHandler(async (req, res) => {
        const io = req.app.get('socket');
        const { body: order } = req;
        const result = await midtermModel.newOrderCreate(order);
        if (result) {
            await redisAsync.del('total');
            await redisAsync.del('priceHisto');
            await redisAsync.del('colorPie');
            await redisAsync.del('sizeStack');
            console.log('delete Redis');
            io.emit('refresh');
            res.json({ msg: "success" });
        }
        else{
            res.status(500).json({msg : 'Something Wrong'});
        }
    });

module.exports = { createOrderFromAuthor, totalGet, priceHistogramGet, colorPieGet, sizeStackGet, newOrderCreate }