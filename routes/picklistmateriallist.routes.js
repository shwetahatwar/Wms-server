var express = require('express');
var router = express.Router();
var picklistmateriallists = require('../controllers/picklistmateriallist.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	picklistmateriallists.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistmateriallists.findAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistmateriallists.findOne,
	sendResponse.sendFindResponse);

router.get("/get/findByPicklist", users.loginRequired,
	picklistmateriallists.getPicklistMaterialListByPicklistId,
	sendResponse.sendFindResponse);

router.get("/get/findPicklistItemsBySearchQuery",
	users.loginRequired,
	picklistmateriallists.findPicklistItemsBySearchQuery,
	sendResponse.sendFindResponse);

module.exports = router;