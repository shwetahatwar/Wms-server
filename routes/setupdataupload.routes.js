var express = require('express');
var router = express.Router();

var setupdatauploads = require('../controllers/setupdataupload.controller');

router.get("/uploadUserMaster", setupdatauploads.uploadUserMaster);

module.exports = router;