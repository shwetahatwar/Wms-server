var express = require('express');
var router = express.Router();
var qctransactions = require('../controllers/qctransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,
	qctransactions.getAll,
	qctransactions.sendFindResponse);

router.get("/:id", users.loginRequired,
	qctransactions.findOne,
	qctransactions.sendFindResponse);

router.get("/get/getQCtransactionsBySearchQuery",
	users.loginRequired,
	qctransactions.findQCTransactionsBySearchQuery)

module.exports = router;