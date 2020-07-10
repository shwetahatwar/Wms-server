var express = require('express');
var router = express.Router();
var shelfs = require('../controllers/shelf.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,shelfs.create);

router.get("/", users.loginRequired,
	shelfs.getAll,
	shelfs.sendFindResponse
	);

router.get("/:id", users.loginRequired,shelfs.getById);
router.put('/:id', users.loginRequired,shelfs.update);
router.get('/get/findShelfsBySearchQuery', users.loginRequired,shelfs.findShelfsBySearchQuery);
router.get('/get/countOfShelfs', users.loginRequired,shelfs.countOfShelfs);
router.post("/post/bulkupload", users.loginRequired,shelfs.BulkUpload);

module.exports = router;