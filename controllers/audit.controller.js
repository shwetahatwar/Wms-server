const db = require("../models");
const Audit = db.audits;
const AuditItems = db.audititems;
const Op = db.Sequelize.Op;
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');

// Create and Save a new Audit
exports.create = async (req, res,next) => {
  var auditId;
  var auditNumber;
  var latestAudit = await Audit.findOne({
     order: [
    ['id', 'DESC'],
    ]
  });

  if(latestAudit){
    latestAudit = latestAudit.toJSON();
    auditNumber = latestAudit["number"];
     auditNumber = auditNumber.substring(auditNumber.length - 5, auditNumber.length);
        auditNumber = (parseInt(auditNumber) + 1).toString();
        var str = '' + auditNumber;
        while (str.length < 5) {
          str = '0' + str;
        }
        auditNumber = "A" + str;
  }
  else{
    auditNumber = "A11111";
  }

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
};


exports.getAll = async (req, res, next) =>{
  if(req.site){
    req.query.siteId = req.site
  }
  var { number , status , auditStatus , siteId,offset, limit} = req.query;
  var whereClause = new WhereBuilder()
  .clause('number', number)
  .clause('siteId', siteId)
  .clause('auditStatus', auditStatus)
  .clause('status', status).toJSON();

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }
  

  var getAllAudits = await Audit.findAll({
    where:whereClause,
    order: [
    ['auditStatus','DESC'],
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit
  });
  
  if (!getAllAudits) {
    return next(HTTPError(400, "Audit not found"));
  }
  
  req.auditList = getAllAudits.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.update = async (req, res, next) => {
  
  const { id } = req.params;
  var { status , auditStatus , start , end} = req.body;
  
  whereClause = new WhereBuilder()
  .clause('status', status)
  .clause('updatedBy', req.user.username) 
  .clause('start', start) 
  .clause('end', end) 
  .clause('auditStatus', auditStatus).toJSON();

  try {
    var updatedAudit = await Audit.update(whereClause,{
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
  next();
}

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.auditList);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

// get count of audits whose status =1 
exports.countOfAudits = async (req, res) => {
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
  res.send(totalCount);
};

//search query
exports.findAuditsBySearchQuery = async (req, res,next) => {
  if(req.site){
    req.query.siteId = req.site
  }
  var {number , status ,siteId , auditStatus , offset,limit} = req.query;
  var newOffset = 0;
  var newLimit = 100;
  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  if(!number){
    number ='';
  }

  if(!auditStatus || auditStatus=="All"){
    auditStatus = '';
  }

  var whereClause = {};
  if(status){
    whereClause.status = status;
  }
  
  if(number){
    whereClause.number = {
      [Op.like]:'%'+number+'%'
    };
  }
  if(auditStatus){
    whereClause.auditStatus = {
      [Op.like]:'%'+auditStatus+'%'
    };
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

  if(!data){
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
  res.status(200).send(responseData);
};

