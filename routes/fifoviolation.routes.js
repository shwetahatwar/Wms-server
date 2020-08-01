var express = require('express');
var router = express.Router();
var fifoviolationlists = require('../controllers/fifoviolation.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,
	fifoviolationlists.findAll,
	fifoviolationlists.sendFindResponse);

router.get("/:id", users.loginRequired,
	fifoviolationlists.findOne,
	fifoviolationlists.sendFindResponse);

router.get("/get/searchdata", users.loginRequired,
	fifoviolationlists.findFIFOViolationsBySearchQuery);


router.get("/get/count", users.loginRequired,
	fifoviolationlists.getCount);

module.exports = router;