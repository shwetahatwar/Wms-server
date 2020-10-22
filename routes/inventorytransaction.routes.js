var express = require('express');
var router = express.Router();
var inventorytransactions = require('../controllers/inventorytransaction.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.get("/", users.loginRequired,
  inventorytransactions.findAll,
  sendResponse.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  inventorytransactions.findOne,
  sendResponse.sendFindResponse
  );

module.exports = router;