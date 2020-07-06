var express = require('express');
var router = express.Router();
var racks = require('../controllers/rack.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	racks.create,
	racks.sendCreateResponse);

router.get("/", users.loginRequired,
	racks.getAll,
	racks.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	racks.getById,
	racks.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	racks.update,
	racks.sendCreateResponse
	);
router.get('/get/countOfRacks', users.loginRequired,racks.countOfRacks);
router.get('/get/findRacksBySearchQuery', users.loginRequired,racks.findRacksBySearchQuery);
router.get('/count/zone/countOfRacksByZoneId', users.loginRequired,racks.countOfRacksByZoneId);

module.exports = router;