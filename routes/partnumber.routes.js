var express = require('express');
var router = express.Router();
var partnumbers = require('../controllers/partnumber.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	partnumbers.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	partnumbers.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	partnumbers.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	partnumbers.update,
	sendResponse.sendCreateResponse
	);

router.get('/get/findPartNumbersBySearchQuery', users.loginRequired,
	partnumbers.findPartNumbersBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/get/countOfPartNumbers', users.loginRequired,
	partnumbers.countOfPartNumbers,
	sendResponse.sendFindResponse);

module.exports = router;