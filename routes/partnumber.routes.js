var express = require('express');
var router = express.Router();
var partnumbers = require('../controllers/partnumber.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,partnumbers.create);
router.get("/", users.loginRequired,partnumbers.getAll);
router.get("/:id", users.loginRequired,partnumbers.getById);
router.put('/:id', users.loginRequired,partnumbers.update);

module.exports = router;