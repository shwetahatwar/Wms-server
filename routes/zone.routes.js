var express = require('express');
var router = express.Router();
var zones = require('../controllers/zone.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	zones.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	zones.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	zones.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	zones.update,
	sendResponse.sendCreateResponse
	);

router.get('/get/findZonesBySearchQuery', users.loginRequired,
	zones.findZonesBySearchQuery,
	sendResponse.sendFindResponse
	);

module.exports = router;