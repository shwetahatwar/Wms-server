var express = require('express');
var router = express.Router();
var fifoviolationlists = require('../controllers/fifoviolation.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
	fifoviolationlists.findAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	fifoviolationlists.findOne,
	sendResponse.sendFindResponse);

router.get("/get/searchdata", users.loginRequired,
	fifoviolationlists.findFIFOViolationsBySearchQuery,
  fifoviolationlists.findFIFOViolationsBySearchQueryCount,
  sendResponse.sendFindResponse);


router.get("/get/count", users.loginRequired,
	fifoviolationlists.getCount,
  sendResponse.sendFindResponse);

module.exports = router;