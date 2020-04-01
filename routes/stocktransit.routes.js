var express = require('express');
var router = express.Router();
var stocktransits = require('../controllers/stocktransit.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,stocktransits.findAll);
router.get("/:id", users.loginRequired,stocktransits.findOne);
router.get("/get/stocktransitsdatewise", users.loginRequired,stocktransits.findAllDatewise);
router.get("/get/findbysearchquery", users.loginRequired,stocktransits.findBySearchQuery);

module.exports = router;