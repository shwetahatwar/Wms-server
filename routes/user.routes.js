var express = require('express');
var router = express.Router();
var users = require('../controllers/user.controller');

router.post("/sign_in", users.getUser,
  users.matchPassword,
  users.sign_in,
  users.sendFindUserResponse
  );

router.post("/",users.loginRequired,
  users.create,
  users.sendCreateUserResponse);

router.get("/",users.loginRequired,
  users.findAll,
  users.sendFindUserResponse
  );

router.get("/:id",users.loginRequired,
  users.findOne,
  users.sendFindUserResponse);

router.put("/:id", users.loginRequired,
  users.update,
  users.sendCreateUserResponse);

module.exports = router;