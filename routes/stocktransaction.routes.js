var express = require('express');
var router = express.Router();
var stocktransactions = require('../controllers/stocktransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,stocktransactions.findAll);
router.get("/:id", users.loginRequired,stocktransactions.findOne);
router.post("/stocktransfer/out", users.loginRequired,stocktransactions.transferOut);
router.post("/stocktransfer/in", users.loginRequired,stocktransactions.transferIn);

module.exports = router;