var express = require('express');
var router = express.Router();
var access = require('../controllers/access.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
  access.create,
  access.sendCreateResponse);

router.get("/", users.loginRequired,
  access.getAll,
  access.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  access.getById,
  access.sendFindResponse
  );

router.put('/:id', users.loginRequired,
  access.update,
  access.sendCreateResponse
  );

module.exports = router;