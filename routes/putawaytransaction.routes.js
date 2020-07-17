var express = require('express');
var router = express.Router();
var putawaytransactions = require('../controllers/putawaytransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,
	putawaytransactions.findAll,
	putawaytransactions.sendFindResponse);

router.get("/:id", users.loginRequired,
	putawaytransactions.findOne,
	putawaytransactions.sendFindResponse);

router.get("/get/getByTransactionDate", users.loginRequired,
	putawaytransactions.findPutawayTransactionBySearchQuery);

router.get("/get/findPutawayTransactionBySearchQuery",
	users.loginRequired,
	putawaytransactions.findPutawayTransactionBySearchQuery);

router.get('/get/countofputawaytransactions', 
	users.loginRequired,
	putawaytransactions.countOfPutawayTransaction);

module.exports = router;