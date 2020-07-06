var express = require('express');
var router = express.Router();
var inventorytransactions = require('../controllers/inventorytransaction.controller');
var users = require('../controllers/user.controller');

router.get("/", users.loginRequired,
  inventorytransactions.findAll,
  inventorytransactions.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  inventorytransactions.findOne,
  inventorytransactions.sendFindResponse
  );

module.exports = router;