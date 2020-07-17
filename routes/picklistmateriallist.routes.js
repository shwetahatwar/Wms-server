var express = require('express');
var router = express.Router();
var picklistmateriallists = require('../controllers/picklistmateriallist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	picklistmateriallists.create,
	picklistmateriallists.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistmateriallists.findAll,
	picklistmateriallists.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistmateriallists.findOne,
	picklistmateriallists.sendFindResponse);

router.get("/get/findByPicklist", users.loginRequired,
	picklistmateriallists.getPicklistMaterialListByPicklistId,
	picklistmateriallists.sendFindResponse);

router.get("/get/findPicklistItemsBySearchQuery",
	users.loginRequired,
	picklistmateriallists.findPicklistItemsBySearchQuery,
	picklistmateriallists.sendFindResponse);

module.exports = router;