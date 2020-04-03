var express = require('express');
var router = express.Router();
var uoms = require('../controllers/uom.controller');
var users = require('../controllers/user.controller');

router.post("/", users.loginRequired,uoms.create);
router.get("/", users.loginRequired,uoms.getAll);
router.get("/:id", users.loginRequired,uoms.getById);
router.put('/:id', users.loginRequired,uoms.update);

module.exports = router;