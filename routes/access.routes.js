var express = require('express');
var router = express.Router();
var access = require('../controllers/access.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
  access.create,
  sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
  access.getAll,
  sendResponse.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  access.getById,
  sendResponse.sendFindResponse
  );

router.put('/:id', users.loginRequired,
  access.update,
  sendResponse.sendCreateResponse
  );

module.exports = router;