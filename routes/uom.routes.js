var express = require('express');
var router = express.Router();
var uoms = require('../controllers/uom.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	uoms.create,
	uoms.sendCreateResponse);

router.get("/", users.loginRequired,
	uoms.getAll,
	uoms.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	uoms.getById,
	uoms.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	uoms.update,
	uoms.sendCreateResponse
	);
module.exports = router;