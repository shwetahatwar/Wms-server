var express = require('express');
var router = express.Router();
var picklistmateriallists = require('../controllers/picklistmateriallist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,picklistmateriallists.create);
router.get("/", users.loginRequired,picklistmateriallists.findAll);
router.get("/:id", users.loginRequired,picklistmateriallists.findOne);
router.get("/get/findByPicklist", users.loginRequired,picklistmateriallists.getPicklistMaterialListByPicklistId);

module.exports = router;