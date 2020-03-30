var express = require('express');
var router = express.Router();
var usersiterelations = require('../controllers/usersiterelation.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,usersiterelations.findAll);
router.get("/:id", users.loginRequired,usersiterelations.findOne);

module.exports = router;