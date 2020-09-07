var express = require('express');
var router = express.Router();
var picklists = require('../controllers/picklist.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	picklists.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	picklists.findAll,
	sendResponse.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklists.findOne,
	sendResponse.sendFindResponse);

router.put("/:id", users.loginRequired,
	picklists.update,
	sendResponse.sendCreateResponse);

router.post("/post/picklistsmaterialcount",
	users.loginRequired,
	picklists.getCountForPicklist,
	sendResponse.sendFindResponse);

router.get("/:picklistId/picklistmaterials",
	users.loginRequired,
	picklists.getPicklistMaterialLists,
	sendResponse.sendFindResponse
	);

router.post("/:picklistId/picklistmaterials",
	users.loginRequired,
	picklists.postPicklistMaterialLists,
	sendResponse.sendCreateResponse);

router.get("/:picklistId/picklistmaterials/:id",
	users.loginRequired,
	picklists.getPicklistMaterialList,	 
	sendResponse.sendFindResponse);

router.put("/:picklistId/picklistmaterials/:id", 
	users.loginRequired,
	picklists.putPicklistMaterialList,
	sendResponse.sendCreateResponse);

router.get("/:picklistId/picklistpickedmaterials", 
	users.loginRequired,
	picklists.getPicklistPickingMaterialLists,
	sendResponse.sendFindResponse);

router.post("/:picklistId/picklistpickedmaterials", 
	users.loginRequired,
	picklists.postPicklistPickingMaterialLists);

router.get("/:picklistId/picklistpickedmaterials/:id", 
	users.loginRequired,
	picklists.getPicklistPickingMaterialList,
	sendResponse.sendFindResponse);

router.put("/:picklistId/picklistpickedmaterials/:id", 
	users.loginRequired,
	picklists.putPicklistPickingMaterialList,
	sendResponse.sendCreateResponse);

router.get("/dashboard/count", users.loginRequired,
	picklists.getPicklistCountDashboard,
	sendResponse.sendFindResponse);

router.get("/get/getbydate",
	users.loginRequired,
	picklists.findPicklistByName,
	sendResponse.sendFindResponse);

router.get("/get/picklistbyname", 
	users.loginRequired,
	picklists.findPicklistByName,
	sendResponse.sendFindResponse);

router.get("/get/count", 
	users.loginRequired,
	picklists.findPicklistCount,
	sendResponse.sendFindResponse);

module.exports = router;