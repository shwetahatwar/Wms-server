const db = require("../models");
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new PartNumber
exports.create =async (req, res,next) => {
  var {partNumber,description,UOM,netWeight,netVolume} = req.body;
  
  if (!partNumber || !description) {
    return next(HTTPError(500, "Part Number not created,partNumber or description field is empty"))
  }

  var partNumber;
  try {
    partNumber = await PartNumber.create({
      partNumber: partNumber,
      description: description,
      UOM: UOM,
      netWeight: netWeight,
      netVolume: netVolume,
      status:true,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!partNumber) {
      return next(HTTPError(500, "Part Number not created"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the part number."))
    }
  }

  partNumber = partNumber.toJSON();
  req.partNumber = partNumber;

  next();
};

//Get All PartNumbers
exports.getAll =async (req,res,next) =>{
  var {partNumber,description,UOM,status,offset,limit} = req.query;
  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('description', description)
  .clause('UOM', UOM)
  .clause('status', status).toJSON();

  var getAllParts;
  getAllParts = await PartNumber.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit
  });

  if (!getAllParts) {
    return next(HTTPError(400, "Part Numbers not found"));
  }
  
  req.partsList = getAllParts.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.partsList);
};

//Update PartNumber by Id
exports.update = async (req, res,next) => {
  const id = req.params.id;
  var { partNumber, description , status , UOM , netWeight , netVolume } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('description', description)
  .clause('UOM', UOM)
  .clause('netWeight', netWeight)
  .clause('netVolume', netVolume)
  .clause('updatedBy', req.user.username) 
  .clause('status', status).toJSON();
  console.log(whereClause);

  var updatedPart;
  try {
    updatedPart = await PartNumber.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedPart) {
      return next(HTTPError(500, "Part Number not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the part number."))
    }
  }

  req.updatedPart = updatedPart;
  next();
  
};

//Get PartNumber by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;
  var partNumber = await PartNumber.findByPk(id);
  if (!partNumber) {
    return next(HTTPError(500, "Part Number not found"))
  }
  req.partsList = partNumber;
  next();
}

exports.getPartNumber=async (req,res,next) => {
  var {partNumberId} = req.body;
  console.log("id",partNumberId);
  var partNumber = await PartNumber.findByPk(partNumberId);
  if (!partNumber) {
    return next(HTTPError(500, "Part Number not found"))
  }
  req.partNumber = partNumber;
  next();
};

//search query
exports.findPartNumbersBySearchQuery = async (req, res,next) => {

  var {partNumber,UOM,description,status,offset,limit} = req.query;
  var newOffset = 0;
  var newLimit = 100;
  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  if(!partNumber){
    partNumber ='';
  }
  if(!UOM){
    UOM ='';
  }
  if(!description){
    description = '';
  }

  var whereClause = {};
  whereClause.status = true;
  if(partNumber){
    whereClause.partNumber = {
      [Op.like]:'%'+partNumber+'%'
    };
  }
  if(description){
    whereClause.description = {
      [Op.like]:'%'+description+'%'
    };
  }
  if(partNumber){
    whereClause.UOM = {
      [Op.like]:'%'+UOM+'%'
    };
  }

  var data = await PartNumber.findAll({ 
    where: whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit
  });

  if(!data){
    return next(HTTPError(500, "No data found"))
  }

  var responseData =[];
  responseData.push(data);

  var total = await PartNumber.count({ 
    where: whereClause
  });

  var countArray=[];
  var totalParts = {
    totalCount : total
  }
  countArray.push(totalParts);
  responseData.push(countArray);

  res.status(200).send(responseData);
};


// get count of all part numbers whose status =1 
exports.countOfPartNumbers = async (req, res) => {
  var whereClause = {};
  whereClause.status = true;
  var total = await PartNumber.count({
    where :whereClause
  })

  if(!total){
    return next(HTTPError(500, "Internal error has occurred, while getting count of parts"))
  }

  var totalCount = {
    totalParts : total 
  }
  res.status(200).send(totalCount);
}
