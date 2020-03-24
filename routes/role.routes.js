var express = require('express');
var router = express.Router();
var roles = require('../controllers/role.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,roles.create);
router.get("/", users.loginRequired,roles.getAll);
router.get("/:id", users.loginRequired,roles.getById);
router.put('/:id', users.loginRequired,roles.update);

module.exports = router;