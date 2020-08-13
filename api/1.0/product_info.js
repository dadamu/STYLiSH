const express = require('express');
const router = express.Router();
const infoController = require("../../controller/infoController");

router.post('/', infoController.infoCreate);

module.exports = router;