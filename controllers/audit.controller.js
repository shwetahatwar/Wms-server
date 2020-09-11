const db = require("../models");
const Audit = db.audits;
const AuditItems = db.audititems;
const Op = db.Sequelize.Op;
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');
var materialInwardQuantity = require('../functions/materialInwardQuantity');
const serialNumberFinder = require('../functions/serialNumberFinder');

// Create and Save a new Audit
exports.create = async (req, res,next) => {
  var auditId;
  var materialInwardsData = await materialInwardQuantity.materialInwardsCountForAudit(req.body,req.site,"count");

  if(materialInwardsData > 0){
    var auditNumber = await serialNumberFinder.latestAuditData();    
    var site = req.site;
    if(req.siteId){
      site = req.siteId
    }

    const audit = {
      number: auditNumber,
      start: 0,
      end: 0,
      status:true,
      siteId:site,
      auditStatus:"New",
      createdBy:req.user.username,
      updatedBy:req.user.username
    };

    var auditData; 
    try {
      auditData = await Audit.create(audit);
      if (!auditData) {
        return next(HTTPError(500, "Audit not created"))
      }
    } 
    catch (err) {
      if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while creating the Audit."))
      }
    }
    auditData = auditData.toJSON();
    req.auditData = auditData;
    next();  
  }
  else{
    return next(HTTPError(500, "Audit not created due to stock not available"))
  } 
};

exports.getAll = async (req, res, next) =>{
  if(req.site){
    req.query.siteId = req.site
  }

  var { number , status , auditStatus , siteId,offset, limit} = req.query;
  
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('number', number)
  .clause('siteId', siteId)
  .clause('auditStatus', auditStatus)
  .clause('status', status).toJSON();
  var getAllAudits = await Audit.findAll({
    where:whereClause,
    order: [
    ['auditStatus','DESC'],
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });
  
  if (!getAllAudits) {
    return next(HTTPError(400, "Audit not found"));
  }
  
  req.auditList = getAllAudits.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.auditList; 
  next();
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  var { status , auditStatus , start , end} = req.body;
  
  updateClause = new WhereBuilder()
  .clause('status', status)
  .clause('updatedBy', req.user.username) 
  .clause('start', start) 
  .clause('end', end) 
  .clause('auditStatus', auditStatus).toJSON();

  try {
    var updatedAudit = await Audit.update(updateClause,{
      where: {
        id: id
      }
    });
    if (!updatedAudit) {
      return next(HTTPError(500, "Audit not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the Audit."))
    }
  }

  req.updatedAudit = updatedAudit;
  next();
};

exports.getById = async (req, res, next) => {
  const { id } = req.params;

  var audit = await Audit.findByPk(id);
  if (!audit) {
    return next(HTTPError(500, "Audit not found"))
  }
  req.auditList = audit;
  req.responseData = req.auditList; 
  next();
};

// get count of audits whose status =1 
exports.countOfAudits = async (req, res,next) => {
  var inProgress = 0;
  var newAudit = 0;
  var completed = 0;
  var whereClause = {};

  whereClause.status = true;
  if(req.site){
    whereClause.siteId = req.site;
  }
  whereClause.auditStatus = "New";
  newAudit = await Audit.count({
    where :whereClause,
  }) 

  whereClause.auditStatus = "In Progress";
  inProgress = await Audit.count({
    where :whereClause,
  }) 

  whereClause.auditStatus = "Completed";
  completed = await Audit.count({
    where :whereClause,
  }) 

  var totalCount = {
    newAudit : newAudit,
    inProgress:inProgress,
    completed:completed 
  }
  req.responseData = totalCount; 
  next();
};

//search query
exports.findAuditsBySearchQuery = async (req, res,next) => {
  if(req.site){
    req.query.siteId = req.site
  }
  var {number , status ,siteId , auditStatus , offset,limit} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;
  number = (number) ? number:'';

  if(!auditStatus || auditStatus=="All"){
    auditStatus = '';
  }

  whereClause = new LikeQueryHelper()
  .clause(number, "number")
  .clause(auditStatus, "auditStatus")
  .toJSON();

  if(status){
    whereClause.status = status;
  }
  if(siteId){
    whereClause.siteId = siteId
  }

  var data = await Audit.findAll({ 
    where: whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if(!data[0]){
    return next(HTTPError(500, "No data found"))
  }

  var responseData =[];
  responseData.push(data);

  var total = await Audit.count({ 
    where: whereClause
  });

  var countArray=[];
  var totalAudits = {
    totalCount : total
  }
  countArray.push(totalAudits);
  responseData.push(countArray);
  req.responseData = responseData;
  next();
};

