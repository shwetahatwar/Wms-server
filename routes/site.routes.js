var express = require('express');
var router = express.Router();
var sites = require('../controllers/site.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	sites.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	sites.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	sites.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	sites.update,
	sendResponse.sendCreateResponse
	);

module.exports = router;