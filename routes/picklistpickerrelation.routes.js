var express = require('express');
var router = express.Router();
var picklistpickerrelations = require('../controllers/picklistpickerrelation.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	picklistpickerrelations.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistpickerrelations.getAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistpickerrelations.getById,
	sendResponse.sendFindResponse);

router.get("/picklists/:picklistId/users", 
	users.loginRequired,
	picklistpickerrelations.getUsersbyPicklist,
	sendResponse.sendFindResponse);

router.get("/users/:userId/picklists",
 users.loginRequired,
 picklistpickerrelations.getPicklistbyUser,
	sendResponse.sendFindResponse);

module.exports = router;