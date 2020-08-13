const express = require('express');
const router = express.Router();
const uploadController = require('../../controller/uploadController');

router.post('/:id', uploadController.imageCreate);

module.exports = router;