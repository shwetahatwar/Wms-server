var express = require('express');
var router = express.Router();
var putawaytransactions = require('../controllers/putawaytransaction.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
	putawaytransactions.findAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	putawaytransactions.findOne,
	sendResponse.sendFindResponse);

router.get("/get/getByTransactionDate", users.loginRequired,
	putawaytransactions.findPutawayTransactionBySearchQuery,
	sendResponse.sendFindResponse);

router.get("/get/findPutawayTransactionBySearchQuery",
	users.loginRequired,
	putawaytransactions.findPutawayTransactionBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/get/countofputawaytransactions', 
	users.loginRequired,
	putawaytransactions.countOfPutawayTransaction,
	sendResponse.sendFindResponse);

module.exports = router;