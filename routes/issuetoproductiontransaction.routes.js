var express = require('express');
var router = express.Router();
var issuetoproductiontransactions = require('../controllers/issuetoproductiontransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,issuetoproductiontransactions.findAll);
router.get("/:id", users.loginRequired,issuetoproductiontransactions.findOne);
router.post("/post/issuetoproduction", users.loginRequired,issuetoproductiontransactions.issueToProduction);
router.post("/post/returnfromproduction", users.loginRequired,issuetoproductiontransactions.returnFromProduction);

module.exports = router;