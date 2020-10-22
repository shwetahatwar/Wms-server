var express = require('express');
var router = express.Router();
var qctransactions = require('../controllers/qctransaction.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
	qctransactions.getAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	qctransactions.findOne,
	sendResponse.sendFindResponse);

router.get("/get/getQCtransactionsBySearchQuery",
	users.loginRequired,
	qctransactions.findQCTransactionsBySearchQuery,
	sendResponse.sendFindResponse);

router.get("/get/qctransactioncount",
	users.loginRequired,
	qctransactions.countOfQCTransactions,
	sendResponse.sendFindResponse);

module.exports = router;