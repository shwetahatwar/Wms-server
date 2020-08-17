var express = require('express');
var router = express.Router();
var auditItems = require('../controllers/audititems.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	auditItems.create,
	auditItems.sendCreateResponse);

router.get("/", users.loginRequired,
	auditItems.getAll,
	auditItems.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	auditItems.getById,
	auditItems.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	auditItems.update,
	auditItems.sendCreateResponse
	);

module.exports = router;