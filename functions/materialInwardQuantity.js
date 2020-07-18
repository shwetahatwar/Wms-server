const db = require("../models");
const MaterialInward = db.materialinwards;
const Sequelize = require("sequelize");
const Op = db.Sequelize.Op;
const Shelf = db.shelfs;
var HTTPError = require('http-errors');

var materialInwardWhereClause = {};
materialInwardWhereClause.status=true;
materialInwardWhereClause.materialStatus="Available";
materialInwardWhereClause.QCStatus=1;

exports.getMaterialQuantity = async(partnumber,siteId)=> {
	if(siteId){
		materialInwardWhereClause.siteId = siteId;
	}	
	materialInwardWhereClause.partNumber=partnumber;

	var checkMaterialQty = await MaterialInward.findAll({
		where:materialInwardWhereClause,
		group: [ 'partNumberId' ],
		attributes: ['partNumberId',[Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
	});

	return checkMaterialQty;
};

exports.getMaterialPacks = async(partnumber,siteId) => {
	if(siteId){
		materialInwardWhereClause.siteId = siteId;
	}	
	materialInwardWhereClause.partNumber=partnumber;
	
	var materialPacks = await MaterialInward.findAll({
		where: materialInwardWhereClause,
		order: [
		['createdAt', 'ASC'],
		],
	});

	return materialPacks;
};

exports.getMaterialPacksWithLocation = async(partnumber,siteId,barcodeSerial) => {
	if(siteId){
		materialInwardWhereClause.siteId = siteId;
	}	
	materialInwardWhereClause.partNumber=partnumber;
	materialInwardWhereClause.barcodeSerial=barcodeSerial;
	
	var materialPacks = await MaterialInward.findAll({
		where: materialInwardWhereClause,
		include: [
		{
			model: Shelf
		}],
	});

	return materialPacks;
};