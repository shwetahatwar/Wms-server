const db = require("../models");
const PicklistMaterialList = db.picklistmateriallists;
const Op = db.Sequelize.Op;
const Picklist = db.picklists;
const PartNumber = db.partnumbes;
var HTTPError = require('http-errors');

// Create and Save a new Picklist Material List
exports.create = async (req, res,next) => {
  var { picklistId , batchNumber , purchaseOrderNumber , numberOfPacks , PartNumber , location} =req.body;
  // Validate request
  if (!picklistId) {
    return next(HTTPError(500,"Content can not be empty!"))
  }

  // Create a Picklist Material List
  const picklistmateriallist = {
    picklistId: picklistId,
    batchNumber: batchNumber,
    purchaseOrderNumber: purchaseOrderNumber,
    numberOfPacks: numberOfPacks,
    PartNumber: PartNumber,
    location: location,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  // Save Picklist Material List in the database
  var picklistMaterial = await PicklistMaterialList.create(picklistmateriallist);

  if(!picklistMaterial){
    return next(HTTPError(500,"Internal error has occurred, while creating the Picklist Materials."))
  }

  req.picklistMaterial = picklistMaterial.toJSON();

  next();  
};

// Retrieve all Picklist Materials List from the database.
exports.findAll = async (req, res,next) => {
  var { picklistId , purchaseOrderNumber , batchNumber , location , numberOfPacks , partNumber , partDescription } = req.query;

  var whereClause = new WhereBuilder()
  .clause('picklistId', picklistId)
  .clause('purchaseOrderNumber', purchaseOrderNumber)
  .clause('location', location)
  .clause('numberOfPacks', numberOfPacks)
  .clause('partNumber', partNumber)  
  .clause('partDescription', partDescription)
  .clause('batchNumber', batchNumber).toJSON();

  var getAllPicklistData;
  getAllPicklistData = await PicklistMaterialList.findAll({
    where:whereClause,
    include:[
    {
      model:Picklist
    }
    ],
    order: [
    ['id', 'DESC'],
    ],
  });
  
  if (!getAllPicklistData) {
    return next(HTTPError(400, "Picklist Materials not found"));
  }
  
  req.picklistsMaterialLists = getAllPicklistData.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistsMaterialLists;
  next();
};

// Find a single Picklist Material List with an id
exports.findOne = async(req, res,next) => {
  const { id } = req.params;

  var getPicklistData = await PicklistMaterialList.findByPk(id);
  if (!getPicklistData) {
    return next(HTTPError(500, "Picklist Materials not found"))
  }
  req.picklistsMaterialLists = getPicklistData;
  req.responseData = req.picklistsMaterialLists;
  next();
};

// Update a Picklist Material List by the id in the request
exports.update = async (req, res,next) => {
  const id = req.params.id;
  var { picklistId , purchaseOrderNumber , batchNumber , location , numberOfPacks , partNumber , partDescription } = req.body;

  var whereClause = new WhereBuilder()
  .clause('picklistId', picklistId)
  .clause('purchaseOrderNumber', purchaseOrderNumber)
  .clause('location', location)
  .clause('numberOfPacks', numberOfPacks)
  .clause('partNumber', partNumber)  
  .clause('updatedBy', req.user.username)  
  .clause('partDescription', partDescription)
  .clause('batchNumber', batchNumber).toJSON();

  var picklistMaterial = await PicklistMaterialList.update(whereClause, {
    where: { id: id }
  });

  if(!picklistMaterial){
    return next(HTTPError(500, "Picklist Material not updated"))
  }

  req.picklistMaterial = picklistMaterial;
  next();
};

//Get Picklist Material List with Picklist Id
exports.getPicklistMaterialListByPicklistId = async(req, res,next) => {
  var { picklistId } = req.query;
  var whereClause = {};
  if(picklistId){
    whereClause.picklistId = picklistId;
  }
  var getAllPicklistData =await PicklistMaterialList.findAll({
    where: whereClause,
    include: [{
      model: Picklist
    }],
    order: [
    ['id', 'DESC'],
    ] 
  });

  if (!getAllPicklistData) {
    return next(HTTPError(400, "Picklist Materials not found"));
  }
  
  req.picklistsMaterialLists = getAllPicklistData.map ( el => { return el.get({ plain: true }) } );

  next();
};

//get data by search query
exports.findPicklistItemsBySearchQuery = async (req, res,next) => {
  var {offset,limit,partNumber,partDescription,picklistId} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var picklistWhereClause = {};
  if(req.site){
    picklistWhereClause.siteId = req.site;
  }

  partNumber = (partNumber) ? partNumber:'';
  partDescription = (partDescription) ? partDescription:'';
  
  whereClause = new LikeQueryHelper()
  .clause(partNumber, "partNumber")
  .clause(partDescription, "partDescription")
  .toJSON();

  if(picklistId){
    whereClause.picklistId=picklistId;
  }

  var getAllPicklistData = await PicklistMaterialList.findAll({ 
    where: whereClause,
    include: [{
      model: Picklist,
      required:true,
      where: picklistWhereClause,
    }], 
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if (!getAllPicklistData) {
    return next(HTTPError(400, "Searched data not found"));
  }
  
  req.picklistsMaterialLists = getAllPicklistData.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistsMaterialLists; 
  next();
};

