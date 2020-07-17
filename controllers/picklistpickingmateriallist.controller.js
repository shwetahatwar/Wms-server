const db = require("../models");
const PicklistPickingMaterialList = db.picklistpickingmateriallists;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
const PicklistMaterialList = db.picklistmateriallists;
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');

// Create and Save a new Picklist Picking Material List
exports.create = async (req, res,next) => {
  console.log(req.body);
  // Validate request
  var { picklistId , userId , material } = req.body;
  if (!picklistId) {
    return next(HTTPError(500,"Content can not be empty"))
  }

  console.log(material.length);
  var picklistpickingmateriallist = [];
  for(var i=0;i<material.length;i++){
    if(material[i].serialNumber){
      material[i].serialNumber = material[i].serialNumber.trim();
    }
    // Create a Picklist Picking Material List
    picklistpickingmateriallist[i] = {
      picklistId: picklistId,
      userId: userId,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:material[i].partNumber,
      batchNumber:material[i].batchNumber,
      serialNumber:material[i].serialNumber,
      quantityPicked:material[i].quantity
    };
  }
  if(!picklistpickingmateriallist){
    return res.status(500).send("No Material");
  }
  var data = await PicklistPickingMaterialList.bulkCreate(picklistpickingmateriallist);

  if(!data){
    return res.status(500).send("Picklist Picking Material List not created");
  }

  next();
  
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

//Get Picklist Picking Material List
exports.getAll = async (req,res,next) =>{
  var { picklistId , partNumber , batchNumber , serialNumber , quantityPicked , userId } = req.query;

  var whereClause = new WhereBuilder()
  .clause('picklistId', picklistId)
  .clause('batchNumber', batchNumber)
  .clause('serialNumber', serialNumber)
  .clause('quantityPicked', quantityPicked)
  .clause('userId', userId)
  .clause('partNumber', partNumber).toJSON();

  var picklistData = await PicklistPickingMaterialList.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
  });
  
  if (!picklistData) {
    return next(HTTPError(400, "Some error occurred while retrieving Picklist Picking Material List"));
  }
  
  req.picklistMaterialLists = picklistData.map ( el => { return el.get({ plain: true }) } );

  next();
};

//Get Picklist Picking Material List by Id
exports.getById = async (req,res,next) => {
  const id = req.params.id;

  var picklistData = await PicklistPickingMaterialList.findByPk(id);
  if (!picklistData) {
    return next(HTTPError(500, "Error retrieving Picklist Picking Material List with id=" + id))
  }
  req.picklistMaterialLists = picklistData;
  next();
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.picklistMaterialLists);
};