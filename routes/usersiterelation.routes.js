var express = require('express');
var router = express.Router();
var usersiterelations = require('../controllers/usersiterelation.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
	usersiterelations.findAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	usersiterelations.findOne,
	sendResponse.sendFindResponse);

module.exports = router;