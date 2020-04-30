var express = require('express');
var router = express.Router();
var materialinwards = require('../controllers/materialinward.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,materialinwards.create);
router.get("/", users.loginRequired,materialinwards.findAll);
router.get("/:id", users.loginRequired,materialinwards.findOne);
router.put("/:id", users.loginRequired,materialinwards.update);
router.put("/updatewithbarcode/:barcodeSerial", users.loginRequired,materialinwards.updateWithBarcode);
router.put("/update/:id/updateQcStatus", users.loginRequired,materialinwards.updateQcStatus);
router.get("/get/getCountByQcStatus", users.loginRequired,materialinwards.countByQcStatus);
router.get('/get/findMaterialInwardsBySearchQuery', users.loginRequired,materialinwards.findMaterialInwardsBySearchQuery);
router.get('/get/getinventorydetails', users.loginRequired,materialinwards.inventoryData);
router.get('/get/inventory/getinventoryStock', users.loginRequired,materialinwards.inventoryStockData);

module.exports = router;