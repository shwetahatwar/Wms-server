var express = require('express');
var router = express.Router();
var auditItems = require('../controllers/audititems.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	auditItems.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	auditItems.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	auditItems.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	auditItems.update,
	sendResponse.sendCreateResponse
	);

router.put('/update/updateWithSerialNumber', users.loginRequired,
	auditItems.updateWithSerialNumber,
	sendResponse.sendCreateResponse
	);

router.get('/get/countOfAuditItems', users.loginRequired,
	auditItems.countOfAuditItems,
	sendResponse.sendFindResponse);

module.exports = router;