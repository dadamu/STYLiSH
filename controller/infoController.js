const asyncHandler = require("../module/asyncHandler");
const productInfoModel = require("../models/productInfoModel");

const infoCreate = asyncHandler(async (req, res) => {
    let info = req.body;
    info['mainImage'] = "";
    await productInfoModel.create(info);
    res.status(201).json({ status: 201 });
});

module.exports = { infoCreate };