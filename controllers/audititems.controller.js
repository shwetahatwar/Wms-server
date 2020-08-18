const db = require("../models");
const Audit = db.audits;
const AuditItems = db.audititems;
const Op = db.Sequelize.Op;
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');
const WhereBuilder = require('../helpers/WhereBuilder');

// Create and Save a new Audit items
exports.create = async (req, res,next) => {
	var {partNumber , siteId , auditId} = req.body;
	var whereClause = {};
	if(partNumber){
		whereClause.partNumber = partNumber;
	}
	if(siteId){
		whereClause.siteId = siteId;
	}
  console.log("whereClause",whereClause);
  var materialInwardsData = await MaterialInward.findAll({
    where:whereClause
  });

  if(!auditId){
    if(req.auditData){
      auditId = req.auditData["id"]
    }
  }

  var auditItems = materialInwardsData.map(el => {
    return {
    	auditId : auditId,
    	partNumber :el["dataValues"]["partNumber"],
    	serialNumber:el["dataValues"]["barcodeSerial"],
    	status:true,
    	itemStatus:"Not Found",
    	createdBy:req.user.username,
    	updatedBy:req.user.username
    }
  });

  var auditItemsList = await AuditItems.bulkCreate(auditItems);
  if(!auditItemsList){
  	return next(HTTPError(500, "Audit items are not created"))
  }
  next();
};


exports.getAll = async (req, res, next) =>{
  var { partNumber , status , serialNumber , itemStatus , auditId , limit , offset} = req.query;

  var whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('serialNumber', serialNumber)
  .clause('itemStatus', itemStatus)
  .clause('auditId', auditId)
  .clause('status', status).toJSON();

  
  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var getAllAuditItems = await AuditItems.findAll({
    where:whereClause,
    include: [
    {model: Audit}
    ],
    order: [
    ['itemStatus', 'DESC'],
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit
  });
  
  if (!getAllAuditItems) {
    return next(HTTPError(400, "Audit items not found"));
  }
  
  req.auditItemsList = getAllAuditItems.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.update = async (req, res, next) => {

  const { id } = req.params;
  var { status , itemStatus } = req.body;
  
  updateClause = new WhereBuilder()
  .clause('status', status)
  .clause('updatedBy', req.user.username)
  .clause('itemStatus', itemStatus).toJSON();

  try {
    var updatedAuditItem = await AuditItems.update(updateClause,{
      where: {
        id: id
      }
    });

    if (!updatedAuditItem) {
      return next(HTTPError(500, "Audit item not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the Audit item."))
    }
  }

  req.updatedAuditItem = updatedAuditItem;
  next();
};

exports.getById = async (req, res, next) => {

  const { id } = req.params;

  var audit = await AuditItems.findByPk(id);
  if (!audit) {
    return next(HTTPError(500, "Audit item not found"))
  }
  req.auditItemsList = audit;
  next();
};

// get count of audit items 
exports.countOfAuditItems = async (req, res) => {
  var found = 0;
  var notFound = 0;
  var scrapped = 0;
  var manual = 0;
  var whereClause = {};

  whereClause.status = true;

  if(req.query.auditId){
    whereClause.auditId = req.query.auditId
  }

  whereClause.itemStatus = "Found";
  found = await AuditItems.count({
    where :whereClause,
  }); 

  whereClause.itemStatus = "Not Found";
  notFound = await AuditItems.count({
    where :whereClause,
  });

  whereClause.itemStatus = "Scrapped";
  scrapped = await AuditItems.count({
    where :whereClause,
  });

  whereClause.itemStatus = "Manually Approved";
  manual = await AuditItems.count({
    where :whereClause,
  }); 

  var totalCount = {
    found : found,
    notFound : notFound,
    manual:manual,
    scrapped:scrapped
  }
  res.send(totalCount);
};

exports.updateWithSerialNumber = async (req, res, next) => {
  var notUpdatedItems = [];
  console.log(req.body.length)
  for(var i=0;i<req.body.length;i++){
    var { status , itemStatus , serialNumber , auditId} = req.body[i];

    updateClause = new WhereBuilder()
    .clause('status', status)
    .clause('updatedBy', req.user.username)
    .clause('itemStatus', itemStatus).toJSON();

    var updatedAuditItem = await AuditItems.update(updateClause,{
      where: {
        serialNumber: serialNumber,
        auditId : auditId
      }
    });
    if (updatedAuditItem[0] != 1) {
      notUpdatedItems.push(req.body[i]);
    }
  }

  if(notUpdatedItems.length != req.body.length){
    res.status(200).send({
      message: "Audit Items updated",
      data:notUpdatedItems
    });
  }
  else{
    return next(HTTPError(500, "Audit item not updated"))
  }
  
};


exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.auditItemsList);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};
