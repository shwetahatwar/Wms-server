var express = require('express');
var router = express.Router();
var projects = require('../controllers/project.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,
	projects.create,
	projects.sendCreateResponse);

router.get("/", users.loginRequired,
	projects.getAll,
	projects.sendFindResponse
	);

router.get("/:id", users.loginRequired,
	projects.getById,
	projects.sendFindResponse
	);

router.put('/:id', users.loginRequired,
	projects.update,
	projects.sendCreateResponse
	);

router.get('/get/findProjectsBySearchQuery', 
	users.loginRequired,
	projects.findProjectsBySearchQuery);

router.get('/get/countOfProjects', users.loginRequired,
	projects.countOfProjects);

module.exports = router;