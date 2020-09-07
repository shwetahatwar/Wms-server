var express = require('express');
var router = express.Router();
var stocktransits = require('../controllers/stocktransit.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/",users.loginRequired,
	stocktransits.findAll,
	sendResponse.sendFindResponse
	);

router.get("/:id",users.loginRequired,
	stocktransits.findOne,
	sendResponse.sendFindResponse);

router.get("/get/stocktransitsdatewise", 
	users.loginRequired,
	stocktransits.findBySearchQuery,
	sendResponse.sendFindResponse);

router.get("/get/findbysearchquery",
	users.loginRequired,
	stocktransits.findBySearchQuery,
	sendResponse.sendFindResponse);

router.get("/get/count",
	users.loginRequired,
	stocktransits.getCount,
	sendResponse.sendFindResponse);

module.exports = router;