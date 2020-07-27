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