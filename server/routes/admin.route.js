var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');

router = router.get('/', adminController.adminIndex);

module.exports = router;