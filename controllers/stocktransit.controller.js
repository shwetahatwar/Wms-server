const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const PartNumber = db.partnumbers;
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

exports.findAll = async (req, res,next) => {
  var { fromSiteId, toSiteId , transferOutUserId , transferInUserId , materialInwardId , status , offset , limit } = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('fromSiteId', fromSiteId)
  .clause('toSiteId', toSiteId)
  .clause('transferOutUserId', transferOutUserId)
  .clause('transferInUserId', transferInUserId)
  .clause('materialInwardId', materialInwardId)
  .clause('status', status).toJSON();

  var stockData =  await StockTransit.findAll({ 
    where: whereClause,
    include: [
    {model: MaterialInward},
    {model: Site,
      as: 'fromSite'},
      {model: Site,
        as: 'toSite'},
        {model: User,
          as: 'transferOutUser'},
          {model: User,
            as: 'transferInUser'}
            ],
            offset:newOffset,
            limit:newLimit 
          });

  if (!stockData) {
    return next(HTTPError(400, "Stock transits not found"));
  }
  
  req.responseList = stockData.map ( el => { return el.get({ plain: true }) } );

  next();
  
};

// Find a single Stock transit  with an id
exports.findOne = async (req, res, next) => {
  const { id } = req.params;

  var stocktransit = await StockTransit.findByPk(id);
  if (!stocktransit) {
    return next(HTTPError(500, "Stock Transit not found"))
  }
  req.responseList = stocktransit;
  next();
};


exports.findBySearchQuery = async (req, res) => {
  var { createdAtStart , createdAtEnd , offset , limit , partNumber , barcodeSerial } = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  if(!partNumber){
    partNumber="";
  }
  if(!barcodeSerial){
    barcodeSerial="";
  }

  var whereClause = {};
  if(createdAtStart && createdAtEnd){
    whereClause.createdAt = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  if(partNumber){
    materialInwardWhereClause.partNumber = {
      [Op.like]:'%'+partNumber+'%'
    };
  }

  if(barcodeSerial){
    materialInwardWhereClause.barcodeSerial = {
      [Op.like]:'%'+barcodeSerial+'%'
    };
  }

  var responseData = await StockTransit.findAll({ 
    where: whereClause,
    include: [
    {model: MaterialInward,
      required: true,
      where:materialInwardWhereClause},
      {model: Site,
        as: 'fromSite'},
        {model: Site,
          as: 'toSite'},
          {model: User,
            as: 'transferOutUser'},
            {model: User,
              as: 'transferInUser'}],
              offset:newOffset,
              limit:newLimit 
            });

  if(createdAtStart && createdAtEnd){
    res.status(200).send(responseData);
    return;
  }
  var countData = await StockTransit.count({ 
    where: whereClause,
    include: [
    {model: MaterialInward,
      required: true,
      where:materialInwardWhereClause},
      {model: Site,
        as: 'fromSite'},
        {model: Site,
          as: 'toSite'},
          {model: User,
            as: 'transferOutUser'},
            {model: User,
              as: 'transferInUser'}] 
            });
  let count = {
    'totalCount':countData
  };

  let dataCount = [];
  let dataList = [];
  dataList.push(responseData);
  dataCount.push(count);
  dataList.push(dataCount);

  res.status(200).send(dataList);
};


exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.responseList);
};