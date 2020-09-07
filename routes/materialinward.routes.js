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
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
  partnumbers.getPartNumber,	
  serialNumberFinder.getLastSerialNumber,
  materialinwards.materialInwardBulkUpload,
  // putawaytransactions.putawayTransaction,
  inventorytransactions.materialInventoryTransactions,
  sendResponse.sendFindResponse
  );

router.get("/", users.loginRequired,
  materialinwards.findAll,
  sendResponse.sendFindResponse
  );

router.get("/:id", users.loginRequired,
  materialinwards.findOne,
  sendResponse.sendFindResponse
  );

router.put('/:id', users.loginRequired,
	materialinwards.update,
  sendResponse.sendCreateResponse
  );

router.put('/update/:id/updateQcStatus', users.loginRequired,
	materialinwards.update,
	qctransactions.create,
  sendResponse.sendCreateResponse
  );

router.put("/updatewithbarcode/:barcodeSerial", 
  users.loginRequired,
  materialinwards.updateWithBarcode);

router.get("/get/getCountByQcStatus", 
  users.loginRequired,
  materialinwards.countByQcStatus,
  sendResponse.sendFindResponse);

router.get('/get/findMaterialInwardsBySearchQuery',
  users.loginRequired,
  materialinwards.findMaterialInwardsBySearchQuery,
  sendResponse.sendFindResponse);

router.get('/get/getinventorydetails', 
  users.loginRequired,
  materialinwards.inventoryData,
  sendResponse.sendFindResponse);

router.get('/get/inventory/getinventoryStock', 
  users.loginRequired,
  materialinwards.inventoryStockData,
  sendResponse.sendFindResponse);

router.get('/get/transfer/findMaterialInwardsBySearchQuery',
  users.loginRequired,
  materialinwards.findMaterialInwardsForTransferOut,
  sendResponse.sendFindResponse);

router.get('/get/getinventorycount', 
  users.loginRequired,
  materialinwards.inventoryDataCount);

router.get("/get/getCountByQcStatusHHT", 
  users.loginRequired,
  materialinwards.countByQcStatusHHT);

router.get("/get/getCountByPending", 
  users.loginRequired,
  materialinwards.getCountByPending,
  sendResponse.sendFindResponse);

router.get('/get/findPendingMaterialInwardsBySearchQuery',
  users.loginRequired,
  materialinwards.findPendingMaterialInwardsBySearchQuery,
  sendResponse.sendFindResponse);

router.get('/get/dashboardCountForPendingPutaway', 
  users.loginRequired,
  materialinwards.dashboardCountForPendingPutaway,
  sendResponse.sendFindResponse);

router.get('/get/getRecent/getRecentTransactionData',
  users.loginRequired,
  materialinwards.findRecentTransactions,
  sendResponse.sendFindResponse);

router.get('/get/RecentTransactions/getRecentTransactions', 
  users.loginRequired,
  materialinwards.findRecentTransactionsWithoutMaterialId,
  sendResponse.sendFindResponse);

router.get('/stock/get/findMaterialInwardsBySearchQuery',
  users.loginRequired,
  materialinwards.findMaterialInwardsBySearchQueryStock,
  sendResponse.sendFindResponse);

router.post('/post/bulkupload', users.loginRequired,
  materialinwards.bulkUpload,
  sendResponse.sendFindResponse);

router.get('/partnumbers/get/findforpicklist',
  users.loginRequired,
  materialinwards.findPartNumbersForPicklist,
  sendResponse.sendFindResponse);

router.post('/post/qcstatuschangehht',
  users.loginRequired,
  materialinwards.updateQcStatusHHT,
  sendResponse.sendCreateResponse);

module.exports = router;