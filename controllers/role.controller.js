const db = require("../models");
const Role = db.roles;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new access
exports.create = async (req, res, next) => {
  var { name} = req.body;
  
  if (!name) {
    return next(HTTPError(500, "Role not created,name field is empty"))
  }

  try {
    var role = await Role.create({
      name: name,
      status:true,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!role) {
      return next(HTTPError(500, "Role not created"))
    }
  } 
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the role."))
    }
  }

  role = role.toJSON();
  req.role = role;

  next();
};

exports.getAll = async (req, res, next) =>{
  
  var { name, status } = req.query;

  var whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('status', status).toJSON();

  var getAllRole = await Role.findAll({
    where:whereClause
  });
  
  if (!getAllRole) {
    return next(HTTPError(400, "Role not found"));
  }
  
  req.roleList = getAllRole.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.roleList;
  next();
};

exports.update = async (req, res, next) => {
  
  const { id } = req.params;
  var { name, status } = req.body;
  
  updateClause = new WhereBuilder()
  .clause('name', name)
  .clause('updatedBy', req.user.username) 
  .clause('status', status).toJSON();

  try {
    var updatedRole = await Role.update(updateClause,{
      where: {
        id: id
      }
    });

    if (!updatedRole) {
      return next(HTTPError(500, "Role not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the role."))
    }
  }

  req.updatedRole = updatedRole;
  next();
};

exports.getById = async (req, res, next) => {

  const { id } = req.params;

  var foundRole = await Role.findByPk(id);
  if (!foundRole) {
    return next(HTTPError(500, "Role not found"))
  }
  req.roleList = foundRole;
  req.responseData = req.roleList;
  next();
}