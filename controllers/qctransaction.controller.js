const db = require("../models");
const QCTransaction = db.qctransactions;
const MaterialInward = db.materialinwards;
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;

//create transaction
exports.create = async (req,res,next) =>{
  var id = req.params.id;
  var { prevQCStatus , currentQCStatus } = req.body;
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
exports.getAll = async(req,res,next) =>{
  var { transactionTimestamp, performedBy, materialInwardId, prevQCStatus, currentQCStatus , offset , limit } = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('performedBy', performedBy)
  .clause('materialInwardId', materialInwardId)
  .clause('prevQCStatus', prevQCStatus)
  .clause('currentQCStatus', currentQCStatus).toJSON();

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var qcTransaction = await QCTransaction.findAll({ 
    where: whereClause,
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause
    }],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit 
  });

  if (!qcTransaction) {
    return next(HTTPError(400, "QC transactions not found"));
  }
  
  req.qcTransactionsList = qcTransaction.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.qcTransactionsList;
  next();
};

// Find a single QC Transaction with an id
exports.findOne = async (req, res,next) => {
  const id = req.params.id;

  var qcTransaction = await QCTransaction.findByPk(id);

  if (!qcTransaction) {
    return next(HTTPError(500, "QC transaction not found with id=" + id))
  }
  req.qcTransactionsList = qcTransaction;
  req.responseData = req.qcTransactionsList;
  next();
};


exports.findQCTransactionsBySearchQuery = async (req, res,next) => {
  var { partNumber, barcodeSerial, QcStatus , offset , limit } = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var responseData = [];
  partNumber = (partNumber) ? partNumber:'';
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(partNumber, "partNumber")
  .clause(barcodeSerial, "barcodeSerial")
  .toJSON();

  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var whereClause = {};
  whereClause.currentQCStatus = QcStatus;

  var qcData = await QCTransaction.findAll({
    where: whereClause,
    include: [{model: MaterialInward,
      required: true,
      where:materialInwardWhereClause
    }],
    order: [
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });

  if (!qcData) {
    return next(HTTPError(500, "Searched Data not found"))
  }

  responseData.push(qcData);

  var total = await QCTransaction.count({
    where: whereClause,
    include: [{model: MaterialInward,
      required: true,
      where:materialInwardWhereClause
    }]
  });

  let count = {
    'totalCount':total
  };

  let dataCount = [];
  dataCount.push(count);
  responseData.push(dataCount);
  req.responseData = responseData;
  next();
};

// get count of all QCTransactions 
exports.countOfQCTransactions = async (req, res,next) => {
  var whereClause = {}
  if(req.query.QCStatus){
    whereClause.currentQCStatus = req.query.QCStatus;
  }
  var total = await QCTransaction.count({
   where:whereClause
  })

  if(!total){
    return next(HTTPError(500, "Internal error has occurred, while getting count of QCTransaction"))
  }

  var totalCount = {
    totalCount : total 
  }
  req.responseData = totalCount;
  next();
}
