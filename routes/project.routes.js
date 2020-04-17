var express = require('express');
var router = express.Router();
var projects = require('../controllers/project.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,projects.create);
router.get("/", users.loginRequired,projects.getAll);
router.get("/:id", users.loginRequired,projects.getById);
router.put('/:id', users.loginRequired,projects.update);
router.get('/get/findProjectsBySearchQuery', users.loginRequired,projects.findProjectsBySearchQuery);
router.get('/get/countOfProjects', users.loginRequired,projects.countOfProjects);

module.exports = router;