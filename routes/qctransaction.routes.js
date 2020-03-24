var express = require('express');
var router = express.Router();
var qctransactions = require('../controllers/qctransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,qctransactions.getAll);
router.get("/:id", users.loginRequired,qctransactions.findOne);

module.exports = router;