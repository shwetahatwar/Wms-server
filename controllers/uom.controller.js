const db = require("../models");
const UOM = db.uoms;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new UOM
exports.create = async (req, res,next) => {
  var { name} = req.body;
  
  if (!name) {
    return next(HTTPError(500, "UOM not created,name field is empty"))
  }

  var uom;
  try {
    uom = await UOM.create({
      name: name,
      status:true,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!uom) {
      return next(HTTPError(500, "UOM not created"))
    }
  } catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the uom."))
    }
  }

  uom = uom.toJSON();
  req.uom = uom;

  next();
};

//Get All UOM
exports.getAll =async (req,res,next) =>{
  var {name,status} = req.query;

  var whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('status', status).toJSON();

  var getAllUOM;
  getAllUOM = await UOM.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
  });
  
  if (!getAllUOM) {
    return next(HTTPError(400, "UOM's not found"));
  }
  
  req.uomsList = getAllUOM.map ( el => { return el.get({ plain: true }) } );

  next();
};

//Update UOM by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { name,status } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('status', status).toJSON();

  var updatedUOM;
  try {
    updatedUOM = await UOM.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedUOM) {
      return next(HTTPError(500, "UOM not updated"))
    }
  }catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the uom."))
    }
  }

  req.updatedUOM = updatedUOM;
  next();
};

//Get UOM by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;

  var uom = await UOM.findByPk(id);
  if (!uom) {
    return next(HTTPError(500, "UOM not found"))
  }
  req.uomsList = uom;
  next();
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.uomsList);
};
