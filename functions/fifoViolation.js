const db = require("../models");
const FIFOViolationData = db.fifoviolationlists;
const Sequelize = require("sequelize");
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

exports.createFifoViolation = async(violatedData,picklistId,user)=> {
	var fifoviolation;
	try {
		fifoviolation = await FIFOViolationData.create({
			partNumber: violatedData["partNumber"],
			picklistId: picklistId,
			purchaseOrderNumber: violatedData["purchaseOrderNumber"],
			serialNumber: violatedData["batchNumber"],
			violatedSerialNumber: violatedData["violatedSerialNumber"],
			createdBy: user,
			updatedBy: user
		})
		if (!fifoviolation) {
			return next(HTTPError(500, "FIFO violation not created"))
		}
	}
	catch (err) {
		if(err["errors"]){
			return next(HTTPError(500,err["errors"][0]["message"]))
		}
		else{
			return next(HTTPError(500,"Internal error has occurred, while creating the FIFO violation."))
		}
	}

	fifoviolation = fifoviolation.toJSON();

	return fifoviolation;
};

exports.whereClauseFunction = async(createdAtStart,createdAtEnd,partNumber,serialNumber,violatedSerialNumber)=> {
	var whereClause = {};
  if(createdAtStart && createdAtEnd  && createdAtStart != 0 && createdAtEnd != 0){
    whereClause.createdAt = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  if(partNumber){
    whereClause.partNumber = {
      [Op.like]:'%'+partNumber+'%'
    };
  }

  if(serialNumber){
    whereClause.serialNumber = {
      [Op.like]:'%'+serialNumber+'%'
    };
  }

  if(violatedSerialNumber){
    whereClause.violatedSerialNumber ={
      [Op.like]: '%'+violatedSerialNumber+'%'
    }
  }
  return whereClause;
};

exports.picklistWhereClauseFunction = async(partNumber,serialNumber,violatedSerialNumber,picklistName,site)=> {
	var picklistWhereClause = {};
  if(site){
    picklistWhereClause.siteId = site;
  }
  else{
    picklistWhereClause.siteId = {
      [Op.like]:'%'+site+'%'
    };
  }

  if(!partNumber){
    partNumber="";
  }
  if(!serialNumber){
    serialNumber="";
  }
  if(!violatedSerialNumber){
    violatedSerialNumber="";
  }

  if(picklistName){
    picklistWhereClause.picklistName = {
      [Op.like]:'%'+picklistName+'%'
    };
  }
  return picklistWhereClause;
};