var express = require('express');
var router = express.Router();
var picklistpickingmateriallists = require('../controllers/picklistpickingmateriallist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	picklistpickingmateriallists.create,
	picklistpickingmateriallists.sendCreateResponse);

router.get("/", users.loginRequired,
	picklistpickingmateriallists.getAll,
	picklistpickingmateriallists.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklistpickingmateriallists.getById,
	picklistpickingmateriallists.sendFindResponse);

module.exports = router;