var express = require('express');
var router = express.Router();
var roles = require('../controllers/role.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	roles.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	roles.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	roles.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	roles.update,
	sendResponse.sendCreateResponse
	);

module.exports = router;