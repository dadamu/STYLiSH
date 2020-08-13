const express = require('express');
const router = express.Router();
const midtermController = require('../../controller/midtermController');

router.post('/refresh', midtermController.createOrderFromAuthor);
router.get('/total', midtermController.totalGet);
router.get('/price-histogram', midtermController.priceHistogramGet);
router.get('/color-pie', midtermController.colorPieGet);
router.get('/size-stack', midtermController.sizeStackGet);
router.post('/new-order', midtermController.newOrderCreate);

module.exports = router;