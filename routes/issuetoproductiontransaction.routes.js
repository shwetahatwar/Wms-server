var express = require('express');
var router = express.Router();
var issuetoproductiontransactions = require('../controllers/issuetoproductiontransaction.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
  issuetoproductiontransactions.findAll,
  sendResponse.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  issuetoproductiontransactions.findOne,
  sendResponse.sendFindResponse
  );

router.post("/post/issuetoproduction", 
	users.loginRequired,
	issuetoproductiontransactions.issueToProduction,
	sendResponse.sendCreateResponse);

router.post("/post/returnfromproduction", 
	users.loginRequired,
	issuetoproductiontransactions.returnFromProduction,
	sendResponse.sendCreateResponse);

router.get("/get/findbysearchquery", users.loginRequired,
	issuetoproductiontransactions.findTransactionsBySearchQuery,	
  	sendResponse.sendFindResponse
	);

module.exports = router;