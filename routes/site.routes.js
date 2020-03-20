var express = require('express');
var router = express.Router();
var sites = require('../controllers/site.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,sites.create);
router.get("/", users.loginRequired,sites.getAll);
router.get("/:id", users.loginRequired,sites.getById);
router.put('/:id', users.loginRequired,sites.update);

module.exports = router;