var express = require('express');
var router = express.Router();
var users = require('../controllers/user.controller');

router.post("/sign_in", users.sign_in);
router.post("/",users.loginRequired,users.create);
router.get("/",users.loginRequired,users.findAll);
router.get("/:id",users.loginRequired,users.findOne);
router.put("/:id",users.loginRequired,users.update);
router.get("/resetPassword/:id",users.loginRequired,users.reset_pass);

module.exports = router;