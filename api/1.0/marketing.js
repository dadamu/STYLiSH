const express = require('express');
const router = express.Router();
const marketingController = require("../../controller/marketingController");

router.post('/campaigns/:id', marketingController.campaignCreate);

router.get('/campaigns', marketingController.campaignGet);


module.exports = router;