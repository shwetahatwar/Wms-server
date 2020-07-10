const db = require("../models");
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new Site
exports.create = async (req, res, next) => {
  var { name} = req.body;
  
  if (!name) {
    return next(HTTPError(500, "Site not created,name field is empty"))
  }
  var site;
  try {
      site = await Site.create({
      name: name,
      status:true,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!site) {
      return next(HTTPError(500, "Site not created"))
    }
  } catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while creating the site."
        ))
    }
  }

  site = site.toJSON();
  req.site = site;

  next();
};

exports.getAll = async (req, res, next) =>{
  if(req.site){
    req.query.id= req.site;
  }

  var {id, name, status } = req.query;

  var whereClause = new WhereBuilder()
  .clause('id', id)
  .clause('name', name)
  .clause('status', status).toJSON();
  var getAllSites;
  getAllSites = await Site.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
  });
  
  if (!getAllSites) {
    return next(HTTPError(400, "Site not found"));
  }
  
  req.siteList = getAllSites.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.update = async (req, res, next) => {
  
  const { id } = req.params;
  var { name, status } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('status', status).toJSON();
   var updatedSite;
  try {
     updatedSite = await Site.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedSite) {
      return next(HTTPError(500, "Site not updated"))
    }
  }catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while updating the Site."
        ))
    }
  }

  req.updatedSite = updatedSite;
  next();
};

exports.getById = async (req, res, next) => {

  const { id } = req.params;

  var foundSite = await Site.findByPk(id);
  if (!foundSite) {
    return next(HTTPError(500, "Site not found"))
  }
  req.siteList = foundSite;
  next();
}

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.siteList);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};
