var express = require('express');
var router = express.Router();
var audits = require('../controllers/audit.controller');
var auditItems = require('../controllers/audititems.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	audits.create,
	auditItems.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	audits.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	audits.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	audits.update,
	sendResponse.sendCreateResponse
	);

router.get('/get/findAuditsBySearchQuery', 
	users.loginRequired,
	audits.findAuditsBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/get/countOfAudits', users.loginRequired,
	audits.countOfAudits,
	sendResponse.sendFindResponse);

module.exports = router;