var express = require('express');
var router = express.Router();
var picklists = require('../controllers/picklist.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,picklists.create);
router.get("/", users.loginRequired,picklists.findAll);
router.get("/:id", users.loginRequired,picklists.findOne);
router.put("/:id", users.loginRequired,picklists.update);

router.get("/:picklistId/picklistmaterials", users.loginRequired,picklists.getPicklistMaterialLists);
router.post("/:picklistId/picklistmaterials", users.loginRequired,picklists.postPicklistMaterialLists);
router.get("/:picklistId/picklistmaterials/:id", users.loginRequired,picklists.getPicklistMaterialList);
router.put("/:picklistId/picklistmaterials/:id", users.loginRequired,picklists.putPicklistMaterialList);

router.get("/:picklistId/picklistpickedmaterials", users.loginRequired,picklists.getPicklistPickingMaterialLists);
router.post("/:picklistId/picklistpickedmaterials", users.loginRequired,picklists.postPicklistPickingMaterialLists);
router.get("/:picklistId/picklistpickedmaterials/:id", users.loginRequired,picklists.getPicklistPickingMaterialList);
router.put("/:picklistId/picklistpickedmaterials/:id", users.loginRequired,picklists.putPicklistPickingMaterialList);

router.get("/dashboard/count", users.loginRequired,picklists.getPicklistCountDashboard);
router.get("/get/getbydate", users.loginRequired,picklists.getPicklistByDate);

module.exports = router;