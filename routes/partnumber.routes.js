var express = require('express');
var router = express.Router();
var partnumbers = require('../controllers/partnumber.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	partnumbers.create,
	partnumbers.sendCreateResponse);

router.get("/", users.loginRequired,
	partnumbers.getAll,
	partnumbers.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	partnumbers.getById,
	partnumbers.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	partnumbers.update,
	partnumbers.sendCreateResponse
	);

router.get('/get/findPartNumbersBySearchQuery', users.loginRequired,
	partnumbers.findPartNumbersBySearchQuery);

router.get('/get/countOfPartNumbers', users.loginRequired,
	partnumbers.countOfPartNumbers);

module.exports = router;