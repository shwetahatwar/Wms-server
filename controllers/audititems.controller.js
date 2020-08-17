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
    	createdBy:req.user.usename,
    	updatedBy:req.user.usename
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

  var limitOffsetQuery = new LimitOffsetHelper()
  .clause(offset, limit).toJSON();

  var getAllAuditItems = await AuditItems.findAll({
    where:whereClause,
    include: [
    {model: Audit}
    ],
    limitOffsetQuery
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
}

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.auditItemsList);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};
