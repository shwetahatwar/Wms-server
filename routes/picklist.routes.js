var express = require('express');
var router = express.Router();
var picklists = require('../controllers/picklist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	picklists.create);

router.get("/", users.loginRequired,
	picklists.findAll,
	picklists.sendFindResponse);

router.get("/:id", users.loginRequired,
	picklists.findOne,
	picklists.sendFindResponse);

router.put("/:id", users.loginRequired,
	picklists.update,
	picklists.updateResponse);

router.post("/post/picklistsmaterialcount",
    users.loginRequired,
    picklists.getCountForPicklist);


router.get("/:picklistId/picklistmaterials",
 	users.loginRequired,
 	picklists.getPicklistMaterialLists,
 	picklists.sendPicklistMaterialResponse
 );

router.post("/:picklistId/picklistmaterials",
 	users.loginRequired,
 	picklists.postPicklistMaterialLists,
 	picklists.updateResponse);

router.get("/:picklistId/picklistmaterials/:id",
	 users.loginRequired,
	 picklists.getPicklistMaterialList,	 
 	picklists.sendPicklistMaterialResponse);

router.put("/:picklistId/picklistmaterials/:id", 
	users.loginRequired,
	picklists.putPicklistMaterialList,
	picklists.updateResponse);

router.get("/:picklistId/picklistpickedmaterials", 
	users.loginRequired,
	picklists.getPicklistPickingMaterialLists,
	picklists.sendPicklistPickingMaterialResponse);

router.post("/:picklistId/picklistpickedmaterials", 
	users.loginRequired,
	picklists.postPicklistPickingMaterialLists);

router.get("/:picklistId/picklistpickedmaterials/:id", 
	users.loginRequired,
	picklists.getPicklistPickingMaterialList,
	picklists.sendPicklistPickingMaterialResponse);

router.put("/:picklistId/picklistpickedmaterials/:id", 
	users.loginRequired,
	picklists.putPicklistPickingMaterialList,
	picklists.updateResponse);

router.get("/dashboard/count", users.loginRequired,
	picklists.getPicklistCountDashboard);

router.get("/get/getbydate",
 	users.loginRequired,
 	picklists.findPicklistByName);

router.get("/get/picklistbyname", 
	users.loginRequired,
	picklists.findPicklistByName);

router.get("/get/count", 
	users.loginRequired,
	picklists.findPicklistCount);


module.exports = router;