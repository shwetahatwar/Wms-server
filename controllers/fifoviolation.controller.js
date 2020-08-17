const db = require("../models");
const Picklist = db.picklists;
const FIFOViolationList = db.fifoviolationlists;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const fifoViolationFunction = require('../functions/fifoViolation');

// Retrieve all FIFO Violation List from the database.
exports.findAll = async(req, res,next) => {
  var picklistWhereClause = {};
  if(req.site){
    picklistWhereClause.siteId = req.site;
  }
  else{
    picklistWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var {picklistId , purchaseOrderNumber , serialNumber , violatedSerialNumber , partNumber , offset,limit} = req.query;

  // var newOffset = 0;
  // var newLimit = 100;

  // if(offset){
  //   newOffset = parseInt(offset)
  // }

  // if(limit){
  //   newLimit = parseInt(limit)
  // }
  var limitOffsetQuery = new LimitOffsetHelper()
  .clause(offset, limit).toJSON();

  var whereClause = new WhereBuilder()
  .clause('picklistId', picklistId)
  .clause('purchaseOrderNumber', purchaseOrderNumber)
  .clause('violatedSerialNumber', violatedSerialNumber)
  .clause('partNumber', partNumber)
  .clause('serialNumber', serialNumber).toJSON();
  
  var fifoviolations;
  fifoviolations = await FIFOViolationList.findAll({ 
    where:whereClause,
    include: [
    {model: Picklist,
      required:true,
      where: picklistWhereClause
    }
    ],
    order: [
    ['id', 'DESC'],
    ],
    limitOffsetQuery
  });

  if (!fifoviolations) {
    return next(HTTPError(400, "FIFO violations not found"));
  }
  
  req.fifoViolationLists = fifoviolations.map ( el => { return el.get({ plain: true }) } );

  next();
};

// Find a single FIFO Violation with an id
exports.findOne = async (req, res,next) => {
  const id = req.params.id;
  var fifoviolations = await FIFOViolationList.findByPk(id);
  if (!fifoviolations) {
    return next(HTTPError(500, "FIFO violation not found with id=" + id))
  }
  req.fifoViolationLists = fifoviolations;
  next();
};

exports.findFIFOViolationsBySearchQuery = async (req, res,next) => {
  var {createdAtStart , createdAtEnd , offset , limit , partNumber , serialNumber , violatedSerialNumber , picklistName} = req.query;

  // var newOffset = 0;
  // var newLimit = 100;

  // if(offset){
  //   newOffset = parseInt(offset)
  // }

  // if(limit){
  //   newLimit = parseInt(limit)
  // }

  var limitOffsetQuery = new LimitOffsetHelper()
  .clause(offset, limit).toJSON();

  var picklistWhereClause = fifoViolationFunction.picklistWhereClauseFunction(partNumber,serialNumber,violatedSerialNumber,picklistName,req.siteId);
  var whereClause = fifoViolationFunction.whereClauseFunction(createdAtStart,createdAtEnd,partNumber,serialNumber,violatedSerialNumber);

  var fifoviolations = await FIFOViolationList.findAll({
    where: whereClause,
    include: [
      {
        model: Picklist,
        required: true,
        where:picklistWhereClause
      }
    ],
    order: [
      ['id', 'DESC'],
    ],
    limitOffsetQuery
  });

  if (!fifoviolations) {
    return next(HTTPError(400, "FIFO violations not found"));
  }

  req.responseData =[];
  req.responseData.push(fifoviolations);

  next();
};

exports.findFIFOViolationsBySearchQueryCount = async (req, res, next) => {
  var {createdAtStart , createdAtEnd , offset , limit , partNumber , serialNumber , violatedSerialNumber , picklistName} = req.query;

  var picklistWhereClause = fifoViolationFunction.picklistWhereClauseFunction(partNumber,serialNumber,violatedSerialNumber,picklistName,req.siteId);
  var whereClause = fifoViolationFunction.whereClauseFunction(createdAtStart,createdAtEnd,partNumber,serialNumber,violatedSerialNumber);

  var total = await FIFOViolationList.count({ 
    where: whereClause,
    include: [
      {
        model: Picklist,
        required: true,
        where:picklistWhereClause
      }
    ]
  });

  var countArray=[];
  var totalData = {
    totalCount : total
  }
  countArray.push(totalData);
  req.responseData.push(countArray);

  next();
};

exports.sendCountResponse = async (req, res, next) => {
  res.status(200).send(req.responseData);
}


exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.fifoViolationLists);
};

exports.getCount= async (req, res, next) => {
var picklistWhereClause = {};
  if(req.site){
    picklistWhereClause.siteId = req.site;
  }
  var total = 0;
  total = await FIFOViolationList.count({
    include: [
    {
      model: Picklist,
      required:true,
      where: picklistWhereClause
    }
    ]
  })

  if(!total){
    return next(HTTPError(500, "Internal error has occurred, while getting count of parts"))
  }

  var totalCount = {
    totalCount : total 
  }
  req.responseData = totalCount;

  next();
  // res.status(200).send(totalCount);
};