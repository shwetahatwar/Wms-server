var express = require('express');
var router = express.Router();
var picklistpickerrelations = require('../controllers/picklistpickerrelation.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,picklistpickerrelations.create);
router.get("/", users.loginRequired,picklistpickerrelations.getAll);
router.get("/:id", users.loginRequired,picklistpickerrelations.getById);
router.get("/picklists/:picklistId/users", users.loginRequired,picklistpickerrelations.getUsersbyPicklist);
router.get("/users/:userId/picklists", users.loginRequired,picklistpickerrelations.getPicklistbyUser);

module.exports = router;