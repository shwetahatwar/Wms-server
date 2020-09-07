var express = require('express');
var router = express.Router();
var uoms = require('../controllers/uom.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	uoms.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	uoms.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	uoms.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	uoms.update,
	sendResponse.sendCreateResponse
	);
module.exports = router;