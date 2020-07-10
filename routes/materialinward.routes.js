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
router.get('/get/transfer/findMaterialInwardsBySearchQuery', users.loginRequired,materialinwards.findMaterialInwardsForTransferOut);
router.get('/get/getinventorycount', users.loginRequired,materialinwards.inventoryDataCount);
router.get("/get/getCountByQcStatusHHT", users.loginRequired,materialinwards.countByQcStatusHHT);
router.get("/get/getCountByPending", users.loginRequired,materialinwards.getCountByPending);
router.get('/get/findPendingMaterialInwardsBySearchQuery', users.loginRequired,materialinwards.findPendingMaterialInwardsBySearchQuery);
router.get('/get/dashboardCountForPendingPutaway', users.loginRequired,materialinwards.dashboardCountForPendingPutaway);
router.get('/get/getRecent/getRecentTransactionData', users.loginRequired,materialinwards.findRecentTransactions);
router.get('/get/RecentTransactions/getRecentTransactions', users.loginRequired,materialinwards.findRecentTransactionsWithoutMaterialId);
router.get('/stock/get/findMaterialInwardsBySearchQuery', users.loginRequired,materialinwards.findMaterialInwardsBySearchQueryStock);
router.post('/post/bulkupload', users.loginRequired,materialinwards.bulkUpload);

module.exports = router;