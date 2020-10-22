var express = require('express');
var router = express.Router();
var projects = require('../controllers/project.controller');
var users = require('../controllers/user.controller');
var sendResponse = require('../functions/sendResponse');

router.post("/", users.loginRequired,
	projects.create,
	sendResponse.sendCreateResponse);

router.get("/", users.loginRequired,
	projects.getAll,
	sendResponse.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	projects.getById,
	sendResponse.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	projects.update,
	sendResponse.sendCreateResponse
	);

router.get('/get/findProjectsBySearchQuery', 
	users.loginRequired,
	projects.findProjectsBySearchQuery,
	sendResponse.sendFindResponse);

router.get('/get/countOfProjects', users.loginRequired,
	projects.countOfProjects,
	sendResponse.sendFindResponse);

module.exports = router;