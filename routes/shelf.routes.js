var express = require('express');
var router = express.Router();
var shelfs = require('../controllers/shelf.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	shelfs.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	shelfs.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	shelfs.getById,
	sendResponse.sendFindResponse);

router.put('/:id', users.loginRequired,
	shelfs.update,
	sendResponse.sendCreateResponse);

router.get('/get/findShelfsBySearchQuery', 
	users.loginRequired,
	shelfs.findShelfsBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/get/countOfShelfs',
	users.loginRequired,
	shelfs.countOfShelfs,
	sendResponse.sendFindResponse);

router.post("/post/bulkupload", users.loginRequired,
	shelfs.BulkUpload,
	sendResponse.sendCreateResponse);

router.get('/get/excess/countOfShelfs',
	users.loginRequired,
	shelfs.excessCountOfShelfs,
	sendResponse.sendFindResponse);

module.exports = router;