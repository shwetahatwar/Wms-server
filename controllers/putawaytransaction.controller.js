const db = require("../models");
const MaterialInward = db.materialinwards;
const PutawayTransaction = db.putawaytransactions;
const Shelf = db.shelfs;
const Op = db.Sequelize.Op;

//Create Putaway Transaction
exports.putawayTransaction = async (req,res,next) =>{
  if (!req.materialInwardBulkUpload) {
    return res.status(500).send("No Material Inwarded");
  }
  var { shelfId } = req.body;
  var putawayTransactMaterial = req.materialInwardBulkUpload.map(el => {
    return {
      transactionTimestamp: Date.now(),
      performedBy:req.user.username,
      materialInwardId:el["id"],
      currentLocationId :shelfId, 
      createdBy:req.user.username,
      updatedBy:req.user.username 
    }
  });

  var putawayTransactionsList = await PutawayTransaction.bulkCreate(putawayTransactMaterial);
  putawayTransactionsList = putawayTransactionsList.map ( el => { return el.get({ plain: true }) } );
  console.log(putawayTransactionsList);

  next();
}

// Retrieve all Putaway Transaction from the database.
exports.findAll = async(req, res,next) => {
  var { transactionTimestamp, performedBy, materialInwardId, prevLocationId , currentLocationId , offset , limit } = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('performedBy', performedBy)
  .clause('materialInwardId', materialInwardId)
  .clause('prevLocationId', prevLocationId)
  .clause('currentLocationId', currentLocationId).toJSON();

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  materialInwardWhereClause.QCStatus = {
    [Op.ne]:2
  }

  var putawayData = await PutawayTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward,
      required:true,
      where:materialInwardWhereClause
    },
    {model: Shelf,
      as: 'prevLocation'},
      {model: Shelf,
        as: 'currentLocation'}],
        order: [
        ['id', 'DESC'],
        ],
        offset:newOffset,
        limit:newLimit 
      });

  if (!putawayData) {
    return next(HTTPError(400, "Putaway Transaction data not found"));
  }
  
  req.putawayDataList = putawayData.map ( el => { return el.get({ plain: true }) } );

  next();
};

// Find a single Putaway Transaction with an id
exports.findOne = async (req, res,next) => {
  const id = req.params.id;

  var putawayData = await PutawayTransaction.findByPk(id);
  if (!putawayData) {
    return next(HTTPError(500, "Putaway Transaction not found"))
  }
  req.putawayDataList = putawayData;
  next();
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.putawayDataList);
};


// get Putaway Transaction data by search query
exports.findPutawayTransactionBySearchQuery = async (req, res) => {
  var {createdAtStart,createdAtEnd,partNumber,currentLocation,barcodeSerial,limit,offset} = req.query;

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
  if(!currentLocation){
    currentLocation="";
  }

  var whereClause = {};
  var locationWhereClause = {};
  if(createdAtStart && createdAtEnd){
    whereClause.transactionTimestamp = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  if(currentLocation){
    locationWhereClause.currentLocation = {
      [Op.like] : '%'+currentLocation+'%'
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

  materialInwardWhereClause.QCStatus = {
    [Op.ne]:2
  }

  var responseData = [];

  var putawayData = await PutawayTransaction.findAll({
    where:whereClause,
    include: [
    {
      model: MaterialInward,
      required: true,
      where:materialInwardWhereClause,
    },
    {model: Shelf,
      as: 'prevLocation'},
      {model: Shelf,
        required:true,
        where: locationWhereClause,
        as: 'currentLocation'},
        ],
        order: [
        ['id', 'DESC'],
        ],
        offset:newOffset,
        limit:newLimit
      });

  responseData.push(putawayData);

  var total = await PutawayTransaction.count({
    where:whereClause,
    include: [
    {
      model: MaterialInward,
      required: true,
      where:materialInwardWhereClause,
    },
    {model: Shelf,
      as: 'prevLocation'},
      {model: Shelf,
        required:true,
        where: locationWhereClause,
        as: 'currentLocation'},
        ]
      });

  let count = {
    'totalCount':total
  };
  let dataCount = [];
  dataCount.push(count);
  responseData.push(dataCount);

  res.status(200).send(responseData);
  
};

// get count of all PutawayTransaction 
exports.countOfPutawayTransaction = async (req, res) => {
  var total = 0;
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  materialInwardWhereClause.QCStatus = {
    [Op.ne]:2
  }

  total = await PutawayTransaction.count({
    include: [
    {
      model: MaterialInward,
      required: true,       
      where:materialInwardWhereClause,
    }]
  });

  var totalCount = {
    totalProjects : total 
  }
  res.status(200).send(totalCount);
};

