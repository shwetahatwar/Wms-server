var express = require('express');
var router = express.Router();
var zones = require('../controllers/zone.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	zones.create,
	zones.sendCreateResponse);

router.get("/", users.loginRequired,
	zones.getAll,
	zones.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	zones.getById,
	zones.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	zones.update,
	zones.sendCreateResponse
	);

router.get('/get/findZonesBySearchQuery', users.loginRequired,
	zones.findZonesBySearchQuery,
	zones.sendFindResponse
	);


module.exports = router;