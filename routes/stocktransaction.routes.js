var express = require('express');
var router = express.Router();
var stocktransactions = require('../controllers/stocktransaction.controller');
var users = require('../controllers/user.controller');

router.get("/",users.loginRequired,
  stocktransactions.findAll,
  stocktransactions.sendFindResponse
  );

router.get("/:id",users.loginRequired,
  stocktransactions.findOne,
  stocktransactions.sendFindResponse);

router.get("/get/stocktransactionsdatewise", 
	users.loginRequired,
	stocktransactions.findBySearchQuery);

router.get("/get/findbysearchquery",
 users.loginRequired,
 stocktransactions.findBySearchQuery);

router.post("/stocktransfer/out", 
	users.loginRequired,
	stocktransactions.transferOut,
	stocktransactions.sendCreateResponse);

router.post("/stocktransfer/in", 
	users.loginRequired,
	stocktransactions.transferIn,	
	stocktransactions.sendCreateResponse);

module.exports = router;