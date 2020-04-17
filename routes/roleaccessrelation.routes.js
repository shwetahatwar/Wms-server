var express = require('express');
var router = express.Router();
var roleaccessrelations = require('../controllers/roleaccessrelation.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,roleaccessrelations.create);
router.get("/", users.loginRequired,roleaccessrelations.getAll);
router.get("/:id", users.loginRequired,roleaccessrelations.getById);
router.put('/:id', users.loginRequired,roleaccessrelations.update);
router.get("/get/validateaccessurl", users.loginRequired,roleaccessrelations.validateAccessUrl);

module.exports = router;