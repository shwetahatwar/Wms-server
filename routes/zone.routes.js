var express = require('express');
var router = express.Router();
var zones = require('../controllers/zone.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,zones.create);
router.get("/", users.loginRequired,zones.getAll);
router.get("/:id", users.loginRequired,zones.getById);
router.put('/:id', users.loginRequired,zones.update);
router.get('/get/findZonesBySearchQuery', users.loginRequired,zones.findZonesBySearchQuery);

module.exports = router;