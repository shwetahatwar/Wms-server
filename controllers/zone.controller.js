const db = require("../models");
const Site = db.sites;
const Zone = db.zones;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const LikeQueryHelper = require('../helpers/likequeryhelper');

// Create and Save a new Zone
exports.create = async (req, res,next) => {
  var { name,siteId} = req.body;
  
  if (!name || !siteId) {
    return next(HTTPError(500, "Zone not created,name or site field is empty"))
  }

  var zone;
  try {
    zone = await Zone.create({
      name: name,
      status:true,
      siteId:siteId,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!zone) {
      return next(HTTPError(500, "Zone not created"))
    }
  } catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the zone."))
    }
  }

  zone = zone.toJSON();
  req.zone = zone;

  next();
};

//Get All Zone
exports.getAll =async (req,res,next) =>{
  if(req.site){
    req.query.siteId = req.site
  }

  var {siteId, name,status} = req.query;

  var whereClause = new WhereBuilder()
  .clause('siteId', siteId)
  .clause('name', name)
  .clause('status', status).toJSON();

  var getAllZones;
  getAllZones = await Zone.findAll({
    where:whereClause,
    include:[
    {
      model:Site
    }
    ],
    order: [
    ['id', 'DESC'],
    ],
  });
  
  if (!getAllZones) {
    return next(HTTPError(400, "Zones not found"));
  }
  
  req.zonesList = getAllZones.map ( el => { return el.get({ plain: true }) } );

  next();
};

//Update Zone by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { name, siteId ,status } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('siteId', siteId)
  .clause('updatedBy', req.user.username) 
  .clause('status', status).toJSON();
  console.log(whereClause);

  var updatedZone;
  try {
    updatedZone = await Zone.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedZone) {
      return next(HTTPError(500, "Zone not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the zone."))
    }
  }

  req.updatedZone = updatedZone;
  next();
};

//Get Zone by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;

  var zone = await Zone.findByPk(id);
  if (!zone) {
    return next(HTTPError(500, "Zone not found"))
  }
  req.zonesList = zone;
  next();
};

exports.findZonesBySearchQuery = async (req, res,next) => {
  var {zone,site,offset,limit} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  site = (site) ? site:'';
  zone = (zone) ? zone:'';

  var zoneWhereClause = {};
  var siteWhereClause = {};
  if(zone){
    zoneWhereClause.name = { [Op.like]: '%'+ zone + '%' };
  }

  zoneWhereClause = new LikeQueryHelper()
  .clause(req.site, "siteId")
  .toJSON();
  zoneWhereClause.status = true;

  if(site){
    siteWhereClause.name = { [Op.like]: '%'+ site + '%' };
  }
  
  var list = await Zone.findAll({ 
    where: zoneWhereClause,
    include: [
    {model: Site,
      required:true,
      where: siteWhereClause
    }],
    order: [
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });

  if (!list) {
    return next(HTTPError(400, "Zones not found"));
  }
  
  req.zonesList = list.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.zonesList;
  next();
};