var express = require('express');
var router = express.Router();
var locations = require('../controllers/location.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,locations.create);
router.get("/", users.loginRequired,locations.getAll);
router.get("/:id", users.loginRequired,locations.getById);
router.put('/:id', users.loginRequired,locations.update);

module.exports = router;