var express = require('express');
var router = express.Router();
var putawaytransactions = require('../controllers/putawaytransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,putawaytransactions.findAll);
router.get("/:id", users.loginRequired,putawaytransactions.findOne);
router.get("/get/getByTransactionDate", users.loginRequired,putawaytransactions.getByTransactionDate);
router.get("/get/findPutawayTransactionBySearchQuery",users.loginRequired,putawaytransactions.findPutawayTransactionBySearchQuery)

module.exports = router;