const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const PartNumber = db.partnumbers;
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const updateMaterialInwardFunction = require('../functions/materialInwardUpdate');

// Create all Stock transfer Transaction from the database.
exports.transferOut = async (req, res, next) => {
  var { materialInwardId , siteId , toSiteId , userId } = req.body;
  
  if (!materialInwardId) {
    return next(HTTPError(500, "Content can not be empty!"))
  }
  
  var transferOutData = [];
  const stock = {
    transactionTimestamp: Date.now(),
    materialInwardId: materialInwardId,
    fromSiteId: siteId,
    toSiteId: toSiteId,
    status:true,
    transferOutUserId: userId,
    transactionType :"Transfer Out",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  var stockTransit = await StockTransit.create(stock);

  if(!stockTransit){
    return next(HTTPError(500, "Internal error has occurred, while creating the transaction."))
  }
  req.transferOutData = stockTransit;
  var stocktransaction = await StockTransaction.create(stock);
  
  var updateMaterial = {
    siteId : 1,
    updatedBy:req.user.username,
    materialStatus : "In Transit"
  };
  var updatedData = await updateMaterialInwardFunction.updateMaterialInward(updateMaterial,materialInwardId)
  next();
};

exports.transferIn = async (req, res, next) => {
  var { materialInwardId , siteId , userId } = req.body;
  
  if (!materialInwardId) {
    return next(HTTPError(500, "Content can not be empty!"))
  }
  
  var transferOutData = [];
  const stock = {
    transactionTimestamp: Date.now(),
    materialInwardId: materialInwardId,
    toSiteId: siteId,
    transferInUserId: userId,
    transactionType :"Transfer In",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  var responseId= 0;
  await StockTransit.findAll({
    where: { 
      materialInwardId : materialInwardId,
      toSiteId: siteId,
    },
    limit:10,
    offset:0,
    order: [
    ['id', 'DESC'],
    ],
  })
  .then(async data => {
    if(data[0] != null || data[0] != undefined){
      const stockTransitData = {
        transferInUserId:userId,
        status:false,
      };
      await StockTransit.update(stockTransitData, {
        where: {
          id: data[0]["dataValues"]["id"]
        }
      }).then({
      })
      .catch(err => {
        console.log("error",err);
        return next(HTTPError(500, "Some error occurred while stock transfering out"))
      });
    }
  }).catch(err=>{
    console.log("error",err);
    return next(HTTPError(500, "Some error occurred while stock transfering out"))
  });

  var stocktransaction = await StockTransaction.create(stock);
  req.transferOutData = stocktransaction;
  var updateMaterial = {
    siteId : siteId,
    materialStatus : "Available",
    updatedBy: req.user.username
  };
  var updatedData = await updateMaterialInwardFunction.updateMaterialInward(updateMaterial,materialInwardId)
  
  next();
  
};

// get all stock transactions
exports.findAll = async (req, res,next) => {
  var { transactionType , fromSiteId, toSiteId , transactionTimestamp , transferOutUserId , transferInUserId , materialInwardId , status , offset , limit } = req.query;

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
  .clause('toSiteId', toSiteId)
  .clause('transactionType', transactionType)
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('transferInUserId', transferInUserId)
  .clause('materialInwardId', materialInwardId)
  .clause('status', status).toJSON();
  console.log(whereClause)
  var stockData =  await StockTransaction.findAll({ 
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
    return next(HTTPError(400, "Stock transactions not found"));
  }
  
  req.responseList = stockData.map ( el => { return el.get({ plain: true }) } );

  next();
  
};

// Find a single Stock transaction  with an id
exports.findOne = async (req, res, next) => {
  const { id } = req.params;

  var stocktransit = await StockTransaction.findByPk(id);
  if (!stocktransit) {
    return next(HTTPError(500, "Stock Transactions not found"))
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

  var responseData = await StockTransaction.findAll({ 
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
  var countData = await StockTransaction.count({ 
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

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send(req.transferOutData);
};

