var express = require('express');
var router = express.Router();
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');
var roles = require('../controllers/role.controller');
var usersiterelations = require('../controllers/usersiterelation.controller');

router.post("/sign_in", users.getUser,
  users.matchPassword,
  users.sign_in,
  sendResponse.sendFindResponse
  );

router.post("/",
  roles.getAll,
  users.loginRequired,
  users.create,
  usersiterelations.create,
  sendResponse.sendCreateResponse);

router.get("/",users.loginRequired,
  users.findAll,
  sendResponse.sendFindResponse
  );

router.get("/:id",users.loginRequired,
  users.findOne,
  sendResponse.sendFindResponse);

router.put("/:id", users.loginRequired,
  users.update,
  sendResponse.sendCreateResponse);

module.exports = router;