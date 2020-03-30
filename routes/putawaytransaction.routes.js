var express = require('express');
var router = express.Router();
var putawaytransactions = require('../controllers/putawaytransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,putawaytransactions.findAll);
router.get("/:id", users.loginRequired,putawaytransactions.findOne);

module.exports = router;