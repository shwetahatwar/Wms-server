var express = require('express');
var router = express.Router();
var access = require('../controllers/access.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,access.create);
router.get("/", users.loginRequired,access.getAll);
router.get("/:id", users.loginRequired,access.getById);
router.put('/:id', users.loginRequired,access.update);

module.exports = router;