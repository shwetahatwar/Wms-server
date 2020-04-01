var express = require('express');
var router = express.Router();
var picklistpickingmateriallists = require('../controllers/picklistpickingmateriallist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,picklistpickingmateriallists.create);
router.get("/", users.loginRequired,picklistpickingmateriallists.getAll);
router.get("/:id", users.loginRequired,picklistpickingmateriallists.getById);

module.exports = router;