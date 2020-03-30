var express = require('express');
var router = express.Router();
var stocktransits = require('../controllers/stocktransit.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,stocktransits.findAll);
router.get("/:id", users.loginRequired,stocktransits.findOne);

module.exports = router;