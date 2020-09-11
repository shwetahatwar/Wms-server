var express = require('express');
var router = express.Router();
var racks = require('../controllers/rack.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	racks.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	racks.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	racks.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	racks.update,
	sendResponse.sendCreateResponse
	);

router.get('/get/countOfRacks', users.loginRequired,
	racks.countOfRacks,
	sendResponse.sendFindResponse);

router.get('/get/findRacksBySearchQuery', users.loginRequired,
	racks.findRacksBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/count/zone/countOfRacksByZoneId', users.loginRequired,
	racks.countOfRacks,
	sendResponse.sendFindResponse);

module.exports = router;