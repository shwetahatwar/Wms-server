var express = require('express');
var router = express.Router();
var materialinwards = require('../controllers/materialinward.controller');
var users = require('../controllers/user.controller');
var serialNumberHelper = require('../helpers/serialNumberHelper');
const putawaytransactions = require('../controllers/putawaytransaction.controller');
const inventorytransactions = require('../controllers/inventorytransaction.controller');
var partnumbers = require('../controllers/partnumber.controller');
var qctransactions = require('../controllers/qctransaction.controller');
var serialNumberFinder = require('../functions/serialNumberFinder');

router.post("/", users.loginRequired,
  partnumbers.getPartNumber,	
  serialNumberFinder.getLastSerialNumber,
  materialinwards.materialInwardBulkUpload,
  putawaytransactions.putawayTransaction,
  inventorytransactions.materialInventoryTransactions,
  materialinwards.sendResponse
  );

router.get("/", users.loginRequired,
  materialinwards.findAll,
  materialinwards.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  materialinwards.findOne,
  materialinwards.sendFindResponse
  );

router.put('/:id', users.loginRequired,
	materialinwards.update,
	materialinwards.sendCreateResponse
	);

router.put('/update/:id/updateQcStatus', users.loginRequired,
	materialinwards.update,
	qctransactions.create,
	materialinwards.sendCreateResponse
	);

router.put("/updatewithbarcode/:barcodeSerial", 
  users.loginRequired,
  materialinwards.updateWithBarcode);

router.get("/get/getCountByQcStatus", 
  users.loginRequired,
  materialinwards.countByQcStatus);

router.get('/get/findMaterialInwardsBySearchQuery',
  users.loginRequired,
  materialinwards.findMaterialInwardsBySearchQuery);

router.get('/get/getinventorydetails', 
  users.loginRequired,
  materialinwards.inventoryData);

router.get('/get/inventory/getinventoryStock', 
  users.loginRequired,
  materialinwards.inventoryStockData);

router.get('/get/transfer/findMaterialInwardsBySearchQuery',
 users.loginRequired,
 materialinwards.findMaterialInwardsForTransferOut);

router.get('/get/getinventorycount', 
  users.loginRequired,
  materialinwards.inventoryDataCount);

router.get("/get/getCountByQcStatusHHT", 
  users.loginRequired,
  materialinwards.countByQcStatusHHT);

router.get("/get/getCountByPending", 
  users.loginRequired,
  materialinwards.getCountByPending);

router.get('/get/findPendingMaterialInwardsBySearchQuery',
 users.loginRequired,
 materialinwards.findPendingMaterialInwardsBySearchQuery);

router.get('/get/dashboardCountForPendingPutaway', 
  users.loginRequired,
  materialinwards.dashboardCountForPendingPutaway);

router.get('/get/getRecent/getRecentTransactionData',
 users.loginRequired,
 materialinwards.findRecentTransactions);

router.get('/get/RecentTransactions/getRecentTransactions', 
  users.loginRequired,
  materialinwards.findRecentTransactionsWithoutMaterialId);

router.get('/stock/get/findMaterialInwardsBySearchQuery',
 users.loginRequired,
 materialinwards.findMaterialInwardsBySearchQueryStock);

router.post('/post/bulkupload', users.loginRequired,
  materialinwards.bulkUpload,
  materialinwards.sendBulkUploadResponse);

router.get('/partnumbers/get/findforpicklist',
 users.loginRequired,
 materialinwards.findPartNumbersForPicklist);

module.exports = router;