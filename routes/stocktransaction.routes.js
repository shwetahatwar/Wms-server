var express = require('express');
var router = express.Router();
var stocktransactions = require('../controllers/stocktransaction.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/",users.loginRequired,
	stocktransactions.findAll,
	sendResponse.sendFindResponse
	);

router.get("/:id",users.loginRequired,
	stocktransactions.findOne,
	sendResponse.sendFindResponse);

router.get("/get/stocktransactionsdatewise", 
	users.loginRequired,
	stocktransactions.findBySearchQuery,
	sendResponse.sendFindResponse);

router.get("/get/findbysearchquery",
	users.loginRequired,
	stocktransactions.findBySearchQuery,
	sendResponse.sendFindResponse);

router.post("/stocktransfer/out", 
	users.loginRequired,
	stocktransactions.transferOut,
	sendResponse.sendCreateResponse);

router.post("/stocktransfer/in", 
	users.loginRequired,
	stocktransactions.transferIn,	
	sendResponse.sendCreateResponse);

router.get("/get/count",
	users.loginRequired,
	stocktransactions.getCount,
	sendResponse.sendFindResponse);

module.exports = router;