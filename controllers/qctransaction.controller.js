const db = require("../models");
const QCTransaction = db.qctransactions;
const MaterialInward = db.materialinwards;
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;

//create transaction
exports.create = async (req,res,next) =>{
  var id = req.params.id;
  var { prevQCStatus,currentQCStatus } = req.body;
  const statusChange = {
    transactionTimestamp :Date.now(), 
    materialInwardId: req.params.id,
    prevQCStatus:prevQCStatus,
    currentQCStatus:currentQCStatus,
    performedBy:req.user.username,
    createdBy:req.user.username,
    updatedBy:req.user.username,
  };

  var qcTransaction =await QCTransaction.create(statusChange);

  if(!qcTransaction){
    return next(HTTPError(500, "QC Transaction not created"))
  }

  qcTransaction = qcTransaction.toJSON();
  req.qcTransaction = qcTransaction;

  next();
};

//Get All QC transactions
exports.getAll = (req,res) =>{
  var queryString = req.query;
  var offset = 0;
  var limit = 100;

  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];

  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  QCTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      }}],
      offset:offset,
      limit:limit 
    })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving ScrapandRecover."
    });
  });
};

// Find a single QC Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  InventoryTransaction.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving InventoryTransaction with id=" + id
    });
  });
};

exports.findQCTransactionsBySearchQuery = async (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  var responseData = [];
  if(!req.query.partNumber){
    req.query.partNumber="";
  }
  if(!req.query.barcodeSerial){
    req.query.barcodeSerial="";
  }
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  console.log("QC status 67",req.query.QcStatus)
  await QCTransaction.findAll({
    where: {
      currentQCStatus:req.query.QcStatus
    },
    include: [{model: MaterialInward,
      required: true,
      where:{
        partNumber: {
          [Op.like]: '%'+req.query.partNumber+'%'
        }, 
        barcodeSerial: {
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }, 
        siteId: {
          [Op.like]: checkString
        }
      }
    }],
  }).then(data => {
    if(data.length != 0){
      responseData.push(data);
    }
    let count = {
      'totalCount':responseData.length
    };
    let dataCount = [];
    dataCount.push(count);
    responseData.push(dataCount);
    res.send(responseData);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PutawayTransaction count."
    });
  });
};