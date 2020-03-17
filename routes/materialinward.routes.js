var express = require('express');
var router = express.Router();
var materialinwards = require('../controllers/materialinward.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,materialinwards.create);
router.get("/", users.loginRequired,materialinwards.findAll);
router.get("/:id", users.loginRequired,materialinwards.findOne);
router.put("/:id", users.loginRequired,materialinwards.update);
router.put("/update/updateQcStatus", users.loginRequired,materialinwards.updateQcStatus);

module.exports = router;