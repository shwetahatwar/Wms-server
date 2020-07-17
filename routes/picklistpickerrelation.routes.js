var express = require('express');
var router = express.Router();
var picklistpickerrelations = require('../controllers/picklistpickerrelation.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	picklistpickerrelations.create,
	picklistpickerrelations.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistpickerrelations.getAll,
	picklistpickerrelations.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistpickerrelations.getById,
	picklistpickerrelations.sendFindResponse);

router.get("/picklists/:picklistId/users", 
	users.loginRequired,
	picklistpickerrelations.getUsersbyPicklist);

router.get("/users/:userId/picklists",
 users.loginRequired,
 picklistpickerrelations.getPicklistbyUser);

module.exports = router;