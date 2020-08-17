const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new Rack
exports.create = async (req, res,next) => {
  var { name,zoneId} = req.body;
  
  if (!zoneId) {
    return next(HTTPError(500, "Rack not created,name or zone field is empty"))
  }

  var rack;
  try {

    var latestRack = await Rack.count({ 
      where:{
        zoneId:zoneId
      }
    });

    if(latestRack){
      let rackId = latestRack;
      rackId = parseInt(rackId) + 1;
      name = "RAC"+rackId;
    }
    else{
     name = "RAC1" 
    }
    console.log("latestRack",name)

    rack = await Rack.create({
      name: name,
      status:true,
      zoneId:zoneId,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!rack) {
      return next(HTTPError(500, "Rack not created"))
    }
  } 
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the rack."))
    }
  }

  rack = rack.toJSON();
  req.rack = rack;

  next();
};

//Get All Rack
exports.getAll =async (req,res,next) =>{
  
  var {siteId,zoneId, name,status,offset,limit} = req.query;
  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('siteId', siteId)
  .clause('name', name)
  .clause('zoneId', zoneId)
  .clause('status', status).toJSON();
  console.log(whereClause);

  var zoneWhereClause = {};
  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }
  console.log("zoneWhereClause",zoneWhereClause);
  var getAllRacks;
  getAllRacks = await Rack.findAll({
    where:whereClause,
    include:[
    {
      model:Zone,
      required:true,
      where:zoneWhereClause,
      include:[{
        model:Site,
      }]
    }
    ],
    order: [
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit
  });
  console.log(getAllRacks);
  if (!getAllRacks) {
    return next(HTTPError(400, "Racks not found"));
  }
  
  req.racksList = getAllRacks.map ( el => { return el.get({ plain: true }) } );

  next();
};

//Update Rack by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { name, zoneId ,status } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('zoneId', zoneId)
  .clause('updatedBy', req.user.username) 
  .clause('status', status).toJSON();
  console.log(whereClause);

  var updatedRack;
  try {
    updatedRack = await Rack.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedRack) {
      return next(HTTPError(500, "Rack not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the rack."))
    }
  }

  req.updatedRack = updatedRack;
  next();

};

//Get Rack by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;

  var rack = await Zone.findByPk(id);
  if (!rack) {
    return next(HTTPError(500, "Rack not found"))
  }
  req.racksList = rack;
  next();
};

// get count of all Racks whose status =1 
exports.countOfRacks = async (req, res) => {
  var total = 0;
  var zoneWhereClause = {};
  var whereClause = {};

  whereClause.status = true;

  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  total = await Rack.count({
    where :whereClause,
    include:[
    {
      model:Zone,
      required:true,
      where: zoneWhereClause
    }
    ]
  })

  if (!total) {
    return next(HTTPError(500, "Internal error has occurred, while calculating the rack count"))
  } 

  total = data;
  var totalCount = {
    totalRacks : total 
  }
  res.send(totalCount);
};

// get count of all Racks by Zone 
exports.countOfRacksByZoneId = async (req, res) => {
  var total = 0;
  var { zoneId } = req.query;
  var zoneWhereClause = {};
  var whereClause={};
  whereClause.zoneId = zoneId;
  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var total = await Rack.count({
    where :whereClause,
    include:[
    {
      model:Zone,
      required:true,
      where:zoneWhereClause,
      include:[{
        model:Site,
      }]
    }
    ]
  });

  if (!total) {
    return next(HTTPError(500, "Internal error has occurred, while calculating the rack count"))
  }
  
  var totalCount = {
    totalRacks : total 
  }

  res.status(200).send(totalCount);
};

//search query
exports.findRacksBySearchQuery = async(req, res) => {
  var {name,zone,site,offset,limit} = req.query;
  if(!name){
    name ='';
  }
  if(!site){
    site ='';
  }
  if(!zone){
    zone ='';
  }

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }
  var whereClause = {};
  var siteWhereClause = {};
  var zoneWhereClause = {};

  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  if(zone){
    zoneWhereClause.name = {
      [Op.like]:'%'+zone+'%'
    };
  }

  if(name){
    whereClause.name = {
      [Op.like] : '%'+name+'%'
    }
  }

  if(site){
    siteWhereClause.name = {
      [Op.like]:'%'+site+'%'
    };
  }

  whereClause.status = true;

  var rackData = await Rack.findAll({ 
    where: whereClause,
    include: [{model: Zone,
      required:true,
      where: zoneWhereClause,
      include:[{
        model:Site,
        required:true,
        where:siteWhereClause,
      }]}],
      order: [
      ['id', 'DESC'],
      ],
      offset:newOffset,
      limit:newLimit
    });

  var responseData =[];
  responseData.push(rackData);

  var total = 0;
  total = await Rack.count({ 
    where: whereClause,
    include: [{model: Zone,
      required:true,
      where: zoneWhereClause,
      include:[{
        model:Site,
        required:true,
        where:siteWhereClause,
      }]}]
    });

  var totalRacks = {
    totalCount : total
  }
  let countArray = [];
  countArray.push(totalRacks);
  responseData.push(countArray);

  res.status(200).send(responseData);
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.racksList);
};