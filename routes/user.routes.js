var express = require('express');
var router = express.Router();
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/sign_in", users.getUser,
  users.matchPassword,
  users.sign_in,
  sendResponse.sendFindResponse
  );

router.post("/",users.loginRequired,
  users.create,
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