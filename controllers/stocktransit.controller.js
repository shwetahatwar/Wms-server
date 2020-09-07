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

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause ={};
  if(req.site){
    checkString = req.site.toString();
    siteWhereClause.id =req.site
    whereClause = {
      [Op.or]: [
      { fromSiteId: req.site },
      { toSiteId: req.site }
      ]
    }
  }
  
  if(transferOutUserId){
    whereClause.transferOutUserId = transferOutUserId
  }
  if(transferInUserId){
    whereClause.transferInUserId = transferInUserId
  }
  if(materialInwardId){
    whereClause.materialInwardId = materialInwardId
  }

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
            offset:offset,
            limit:limit 
          });

  if (!stockData) {
    return next(HTTPError(400, "Stock transits not found"));
  }
  
  req.responseList = stockData.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.responseList;
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
  req.responseData = req.responseList;
  next();
};


exports.findBySearchQuery = async (req, res) => {
  var { createdAtStart , createdAtEnd , offset , limit , partNumber , barcodeSerial } = req.query;
  
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var materialInwardWhereClause = {};
  var siteWhereClause = {};
  var whereClause = {};
  
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
    siteWhereClause:id = req.site;
    whereClause = {
      [Op.or]: [
      { fromSiteId: req.site },
      { toSiteId: req.site }
      ]
    }
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  
  partNumber = (partNumber) ? partNumber:'';
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';

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
          required:true,
          where:siteWhereClause,
          as: 'toSite'},
          {model: User,
            as: 'transferOutUser'},
            {model: User,
              as: 'transferInUser'}],
              offset:offset,
              limit:limit 
            });

  if(createdAtStart && createdAtEnd){
    req.responseData =responseData;
    next();
    // return;
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
            }).then().catch(err =>{
              console.log(err)
            });
            let count = {
              'totalCount':countData
            };

            let dataCount = [];
            let dataList = [];
            dataList.push(responseData);
            dataCount.push(count);
            dataList.push(dataCount);
            req.responseData = dataList;
  // res.status(200).send(dataList);
};

exports.getCount = async (req, res, next) => {

  var materialInwardWhereClause = {};
  var siteWhereClause ={};
  var whereClause={};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
    siteWhereClause.siteId = req.site;
    whereClause = {
      [Op.or]: [
      { fromSiteId: req.site },
      { toSiteId: req.site }
      ]
    }
  }
  
  var total = await StockTransit.count({
    where:whereClause,
    include: [
    {model: MaterialInward,
      required: true,
      where:materialInwardWhereClause},
      {model: Site,
        as: 'fromSite'},
        {model: Site,
          required:true,
          where:siteWhereClause,
          as: 'toSite'}],
        })

  if(!total){
    return next(HTTPError(500, "Internal error has occurred, while getting count"))
  }

  var totalCount = {
    totalCount : total 
  }
  req.responseData = totalCount;
};
