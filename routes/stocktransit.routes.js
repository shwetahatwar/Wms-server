var express = require('express');
var router = express.Router();
var stocktransits = require('../controllers/stocktransit.controller');
var users = require('../controllers/user.controller');

router.get("/",users.loginRequired,
  stocktransits.findAll,
  stocktransits.sendFindResponse
  );

router.get("/:id",users.loginRequired,
  stocktransits.findOne,
  stocktransits.sendFindResponse);

router.get("/get/stocktransitsdatewise", 
	users.loginRequired,
	stocktransits.findBySearchQuery);

router.get("/get/findbysearchquery",
 users.loginRequired,
 stocktransits.findBySearchQuery);

router.get("/get/count",
 users.loginRequired,
 stocktransits.getCount);

module.exports = router;