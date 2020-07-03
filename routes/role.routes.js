var express = require('express');
var router = express.Router();
var roles = require('../controllers/role.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	roles.create,
	roles.sendCreateResponse);

router.get("/", users.loginRequired,
	roles.getAll,
	roles.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	roles.getById,
	roles.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	roles.update,
	roles.sendCreateResponse
	);

module.exports = router;