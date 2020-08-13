var asyncHandler = require("../module/asyncHandler");
const productModel = require("../models/productModel");
const redisAsync = require("../module/redisAsync");
const infoModel = require('../models/productInfoModel');

const detailsGet =
    asyncHandler(async (req, res, next) => {
        let id = req.query.id;
        let key = 'product-' + id;
        let cacheData = await redisAsync.get(key);
        if (cacheData) {
            let data = JSON.parse(cacheData);
            res.json(data);
            return
        }
        let sqlData = await productModel.get({ id });
        sqlData = sqlData['data'];
        if (sqlData.length > 0) {
            let data = sqlData[0];
            redisAsync.set(key, JSON.stringify({ data }));
            res.json({ data });
            return;
        }
        else {
            let err = new Error("Not Found");
            err.status = 404;
            next(err);
            return;
        }
    });



const searchGet =
    asyncHandler(async (req, res, next) => {
        let keyword = req.query.keyword;
        let paging = req.query.paging;
        if (keyword) {
            if (!paging | parseInt(paging) < 0) paging = 0;
            let result = await productModel.get({ keyword, paging });
            res.json(result);
        }
        else {
            let err = new Error("Not Found");
            err.status = 404;
            next(err);
        }
    });

let categories = new Map([['all', true], ['men', true], ['women', true], ['accessories', true]]);
const categoryGet =
    asyncHandler(async (req, res, next) => {
        let category = req.params.category;
        let paging = req.query.paging;
        if (categories.has(category)) {
            if (!paging | parseInt(paging) < 0) paging = 0;
            //get data list with category and pagination
            let data = await productModel.get({ category, paging });
            res.json(data);
        }
        else {
            let err = new Error("Not Found");
            err.status = 404;
            next(err);
        }
    });


const productCreate =
    asyncHandler(async (req, res, next) => {
        let variants = req.body.variants;
        let productId = req.params.id;

        //check Product Id
        let check = await infoModel.check(productId);
        if (check.length == 0) {
            let err = new Error("Info id not Exists");
            err.status = 400;
            next(err);
        }
        else {
            //Insert product data to database      
            await productModel.create({ productId, variants });
            await redisAsync.del('product-' + productId);
            res.status(201).json({ status: 201 });
        }
    });


module.exports = { detailsGet, searchGet, categoryGet, productCreate };