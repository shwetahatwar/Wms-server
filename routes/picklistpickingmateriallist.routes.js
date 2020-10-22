var express = require('express');
var router = express.Router();
var picklistpickingmateriallists = require('../controllers/picklistpickingmateriallist.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	picklistpickingmateriallists.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistpickingmateriallists.getAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistpickingmateriallists.getById,
	sendResponse.sendFindResponse);

module.exports = router;