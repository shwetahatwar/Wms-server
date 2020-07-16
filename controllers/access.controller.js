const db = require("../models");
const Access = db.access;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new access
exports.create = async (req, res, next) => {
  var { url, httpMethod } = req.body;
  
  if (!url || !httpMethod) {
    return next(HTTPError(500, "Access not created, invalid url or httpMethod"))
  }
  
  try {
    var createdAccess = await Access.create({
      url: url,
      httpMethod: httpMethod
    })

    if (!createdAccess) {
      return next(HTTPError(500, "Access not created"))
    }
  } catch (err) {
    if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while creating the access."))
      }
  }

  createdAccess = createdAccess.toJSON();
  req.createdAccess = createdAccess;
  console.log("Access",req.createdAccess)
  next();
};

exports.getAll = async (req, res, next) =>{
  var { url, httpMethod } = req.query;

  var whereClause = new WhereBuilder()
    .clause('url', url)
    .clause('httpMethod', httpMethod).toJSON();

  var getAllAccess = await Access.findAll({
    where:whereClause
  });
  
  if (!getAllAccess) {
    return next(HTTPError(400, "Access not found"));
  }
  
  req.accessList = getAllAccess.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  var { url, httpMethod } = req.body;
  
  whereClause = new WhereBuilder()
    .clause('url', url)
    .clause('updatedBy', req.user.username) 
    .clause('httpMethod', httpMethod).toJSON();

    try{
      var updatedAccess = await Access.update(whereClause,{
        where: {
          id: id
        }
      });

      if (!updatedAccess) {
        return next(HTTPError(500, "Access not updated"))
      }
    }catch (err) {
      if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while updating the access."))
      }
    }

  req.updatedAccess = updatedAccess;
  next();
};

exports.getById = async (req, res, next) => {

  const { id } = req.params;

  var foundAccess = await Access.findByPk(id);
  if (!foundAccess) {
    return next(HTTPError(500, "Access not found"))
  }
  req.accessList = foundAccess;
  next();
}

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.accessList);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};