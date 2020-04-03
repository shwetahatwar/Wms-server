
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var winston = require('./config/winston');
var bodyParser = require('body-parser');
var jwt = require("jsonwebtoken");
const cors = require("cors");
var encodeUrl = require('encodeurl');

var roleRouter = require('./routes/role.routes');
var usersRouter = require('./routes/user.routes');
var partNumbersRouter = require('./routes/partnumber.routes');
var locationsRouter = require('./routes/location.routes');
var materialInwardsRouter = require('./routes/materialinward.routes');
var inventoryTransactionRouter = require('./routes/inventorytransaction.routes');
var qcTransactionRouter = require('./routes/qctransaction.routes');
var siteRouter = require('./routes/site.routes');
var setupDataRouter = require('./routes/setupdataupload.routes');
var stockTransitRouter = require('./routes/stocktransit.routes');
var stockTransactionRouter = require('./routes/stocktransaction.routes');
var userSiteRelationRouter = require('./routes/usersiterelation.routes');
var putawayTransactionRouter = require('./routes/putawaytransaction.routes');
var picklistRouter = require('./routes/picklist.routes');
var picklistPickerRelationRouter = require('./routes/picklistpickerrelation.routes');
var picklistMaterialListRouter = require('./routes/picklistmateriallist.routes');
var picklistPickingMaterialListRouter = require('./routes/picklistpickingmateriallist.routes');
var uomRouter = require('./routes/uom.routes');


const app = express();

// var corsOptions = {
//   origin: "http://localhost:3000"
// };

// app.use(cors(corsOptions));
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  next();
});

// parse requests of content-type - application/json
app.use(bodyParser.json());

//logger
app.use(morgan('combined', { stream: winston.stream }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1], 'THISISLONGSTRINGKEY', async function(err, decode) {
      if (err) req.user = undefined;
      // console.log("Line 57 Decode: ", decode);
      // req.user = decode;
      const User = db.users;
      await User.findAll({
        where:{
          username: decode["username"]
        }
      }).then(data=>{
        // console.log("Line 65",data[0]["dataValues"]);
        if(data[0] != null || data[0] != undefined)
          req.user = data[0]["dataValues"]
      });
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use('/roles', roleRouter);
app.use('/users', usersRouter);
app.use('/partnumbers', partNumbersRouter);
app.use('/locations', locationsRouter);
app.use('/materialinwards', materialInwardsRouter);
app.use('/inventorytransactions', inventoryTransactionRouter);
app.use('/qctransactions', qcTransactionRouter);
app.use('/sites', siteRouter);
app.use('/setupData', setupDataRouter);
app.use('/stocktransits',stockTransitRouter);
app.use('/stocktransactions',stockTransactionRouter);
app.use('/usersiterelations',userSiteRelationRouter);
app.use('/putawaytransactions',putawayTransactionRouter);
app.use('/picklists',picklistRouter);
app.use('/picklistpickerrelations',picklistPickerRelationRouter);
app.use('/picklistmateriallists',picklistMaterialListRouter);
app.use('/picklistpickingmateriallists',picklistPickingMaterialListRouter);
app.use('/uoms', uomRouter);

const db = require("./models");
db.sequelize.sync();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to BRiOT application." });
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err })
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

