var express = require('express');
var router = express.Router();
var issuetoproductiontransactions = require('../controllers/issuetoproductiontransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,
  issuetoproductiontransactions.findAll,
  issuetoproductiontransactions.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  issuetoproductiontransactions.findOne,
  issuetoproductiontransactions.sendFindResponse
  );

router.post("/post/issuetoproduction", users.loginRequired,issuetoproductiontransactions.issueToProduction);
router.post("/post/returnfromproduction", users.loginRequired,issuetoproductiontransactions.returnFromProduction);
// router.get("/get/getbydate", users.loginRequired,issuetoproductiontransactions.findByDate);
router.get("/get/findbysearchquery", users.loginRequired,issuetoproductiontransactions.findTransactionsBySearchQuery);

module.exports = router;