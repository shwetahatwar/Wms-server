var express = require('express');
var router = express.Router();
var roleaccessrelations = require('../controllers/roleaccessrelation.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	roleaccessrelations.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	roleaccessrelations.getAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	roleaccessrelations.getById,
	sendResponse.sendFindResponse);

router.put('/:id', users.loginRequired,
	roleaccessrelations.update,
	sendResponse.sendCreateResponse);

router.get("/get/validateaccessurl", 
	users.loginRequired,
	roleaccessrelations.validateAccessUrl,
	sendResponse.sendFindResponse);

module.exports = router;