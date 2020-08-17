var express = require('express');
var router = express.Router();
var audits = require('../controllers/audit.controller');
var auditItems = require('../controllers/audititems.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	audits.create,
	auditItems.create,
	audits.sendCreateResponse);

router.get("/", users.loginRequired,
	audits.getAll,
	audits.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	audits.getById,
	audits.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	audits.update,
	audits.sendCreateResponse
	);

router.get('/get/findAuditsBySearchQuery', 
	users.loginRequired,
	audits.findAuditsBySearchQuery);

router.get('/get/countOfAudits', users.loginRequired,
	audits.countOfAudits);

module.exports = router;