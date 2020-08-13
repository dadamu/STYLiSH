const express = require('express');
const router = express.Router();

const productController = require("../../controller/productController");


router.get('/details', productController.detailsGet);

router.get('/search', productController.searchGet);

router.get('/:category', productController.categoryGet);

router.post('/:id', productController.productCreate);


module.exports = router;