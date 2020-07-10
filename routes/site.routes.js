var express = require('express');
var router = express.Router();
var sites = require('../controllers/site.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	sites.create,
	sites.sendCreateResponse);

router.get("/", users.loginRequired,
	sites.getAll,
	sites.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	sites.getById,
	sites.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	sites.update,
	sites.sendCreateResponse
	);

module.exports = router;