const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Shelf = db.shelfs;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const serialNumberFinder = require('../functions/serialNumberFinder');
const shelfSerialNumber = require('../functions/shelfSerialNumber');

//Get All Shelfs
exports.getAll =async (req,res,next) =>{

  var {description,rackId,barcodeSerial,name,status,limit,offset} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('rackId', rackId)
  .clause('barcodeSerial',barcodeSerial)
  .clause('description', description)
  .clause('status', status).toJSON();

  var zoneWhereClause = {};
  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var getAllShelves;
  getAllShelves = await Shelf.findAll({
    where:req.query,
    include:[
    {
      model : Rack,
      include:[{
        model:Zone,
        required:true,
        where: zoneWhereClause,
      }]
    }
    ],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if (!getAllShelves) {
    return next(HTTPError(400, "Shelfs not found"));
  }
  
  req.shelfsList = getAllShelves.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.shelfsList;
  next();
};

// Create and Save a new Shelf
exports.create = async (req, res, next) => {
  var { name,rackId,description,vertical,capacity,volume} = req.body;
  
  if (!rackId) {
    return next(HTTPError(500, "Shelf not created,name or rack or description field is empty"))
  }

  if(!vertical){
    vertical = "001";
  }
  
  var serialNumber;
  var zoneId;
  var siteId;
  var rackId=rackId;

  var shelfData = await serialNumberFinder.getShelfSerialNumber(rackId);
  
  let siteName;
  let zoneName;
  let rackName;

  let rackData = await Rack.findOne({
    where:{
      id:rackId
    },
    include:[{
      model:Zone,
      include:[{
        model:Site
      }]
    }]
  });
  rackData =rackData.toJSON();
  siteName=rackData["zone"]["site"]["name"];
  zoneName=rackData["zone"]["name"];
  rackName=rackData["name"];

  serialNumber = await shelfSerialNumber.generateSerialNumber(shelfData,rackId,zoneId,siteId,vertical); 
  const shelf = {
    name: "SH-"+serialNumber+"",
    status:true,
    description: ""+siteName + "-" +zoneName+"-"+rackName+"",
    barcodeSerial:serialNumber,
    rackId: rackId,
    capacity: capacity,
    loadedCapacity: 0,
    volume: volume,
    loadedVolume: 0,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  var shelfCreated;
  try {
    shelfCreated = await Shelf.create(shelf);

    if (!shelfCreated) {
      return next(HTTPError(500, "Shelf not created"))
    }
  } catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the shelf."))
    }
  }

  req.shelfCreated = shelfCreated.toJSON();
  next();
};

//Update Shelf by Id
exports.update = async(req, res,next) => {
  const id = req.params.id;

  var { name , rackId , description , capacity , loadedCapacity , volume , loadedVolume ,
    status , updatedBy} = req.body;

    updateClause = new WhereBuilder()
    .clause('name', name)
    .clause('rackId', rackId)
    .clause('description', description)
    .clause('capacity', capacity)
    .clause('loadedCapacity', loadedCapacity)
    .clause('volume', volume)
    .clause('updatedBy', req.user.username)  
    .clause('loadedVolume', loadedVolume)
    .clause('status', status).toJSON();

    var updatedShelf;
    try {
      updatedShelf = await Shelf.update(updateClause,{
        where: {
          id: id
        }
      });

      if (!updatedShelf) {
        return next(HTTPError(500, "Shelf not updated"))
      }
    }catch (err) {
      if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while updating the shelf."))
      }
    }

    req.updatedShelf = updatedShelf;
    next();
  };

//Get Shelf by Id
exports.getById = async (req,res,next) => {
  const id = req.params.id;

  var shelf = await Shelf.findByPk(id);
  if (!shelf) {
    return next(HTTPError(500, "shelf not found"))
  }
  req.shelfsList = shelf;
  req.responseData = req.shelfsList;
  next();
};

exports.findShelfsBySearchQuery = async(req, res,next) => {

  var { name, zone , rack , site , status , offset , limit } = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  name = (name) ? name:'';
  zone = (zone) ? zone:'';
  site = (site) ? site:'';
  rack = (rack) ? rack:'';

  whereClause = new LikeQueryHelper()
  .clause(name, "name")
  .toJSON();

  whereClause.status = true;

  rackWhereClause = new LikeQueryHelper()
  .clause(rack, "name")
  .toJSON();

  siteWhereClause = new LikeQueryHelper()
  .clause(site, "name")
  .toJSON();

  zoneWhereClause = new LikeQueryHelper()
  .clause(zone, "name")
  .toJSON();

  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  var data = await Shelf.findAll({ 
    where: whereClause,
    include: [{model: Rack,
      required:true,
      where: rackWhereClause,
      include:[{
        model:Zone,
        required:true,
        where: zoneWhereClause,
        include:[{
          model:Site,
          required:true,
          where: siteWhereClause,
        }]
      }]}],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });
  
  var countArray =[];
  var responseData =[];
  responseData.push(data);

  var total = 0;

  total = await Shelf.count({ 
    where: whereClause,
    include: [{model: Rack,
      required:true,
      where: rackWhereClause,
      include:[{
        model:Zone,
        required:true,
        where: zoneWhereClause,
        include:[{
          model:Site,
          required:true,
          where: siteWhereClause,
        }]
      }]}]
    });

  var totalLocations = {
    totalCount : total
  }

  countArray.push(totalLocations);
  responseData.push(countArray);
  req.responseData = responseData;
  next();
};

// get count of all shelfs whose status =1 
exports.countOfShelfs = async (req, res,next) => {
  var total = 0;
  var zoneWhereClause = {};

  if(req.site){
    zoneWhereClause.siteId = req.site;
  }
  else{
    zoneWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }
  var whereClause = {};
  whereClause.status =  true;

  total = await Shelf.count({
    where :whereClause,
    include: [{model: Rack,
      include:[{
        model:Zone,
        required:true,
        where: zoneWhereClause
      }]}]
    })
  
  var totalCount = {
    totalLocations : total 
  }
  req.responseData = totalCount;
  next();
};

// get count of all shelfs whose capacity exceeded
exports.excessCountOfShelfs = async (req, res,next) => {
  var total = 0;
  var query = "select count(id) as total from shelves where status = true and shelves.loadedCapacity > shelves.capacity;";
  if(req.site){
    query = "SELECT count(shelf.id) as total FROM `shelves` AS `shelf` INNER JOIN `racks` AS `rack` ON `shelf`.`rackId` = `rack`.`id` INNER JOIN `zones` AS `rack->zone` ON `rack`.`zoneId` = `rack->zone`.`id` AND `rack->zone`.`siteId` LIKE '%%' INNER JOIN `sites` AS `rack->zone->site` ON `rack->zone`.`siteId` = `rack->zone->site`.`id` AND `rack->zone->site`.`id` = "+req.site+" WHERE `shelf`.`status` = true and shelf.loadedCapacity > shelf.capacity;";
  }
  total = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT});
  var totalCount;
  if(total[0]){
    total = total[0]["total"];
  }

  var totalCapacity = 0;
  var query = `select sum(capacity) as totalCapacity from shelves where status = true;`;
  if(req.site){
    query = "select sum(capacity) as totalCapacity FROM `shelves` AS `shelf` INNER JOIN `racks` AS `rack` ON `shelf`.`rackId` = `rack`.`id` INNER JOIN `zones` AS `rack->zone` ON `rack`.`zoneId` = `rack->zone`.`id` AND `rack->zone`.`siteId` LIKE '%%' INNER JOIN `sites` AS `rack->zone->site` ON `rack->zone`.`siteId` = `rack->zone->site`.`id` AND `rack->zone->site`.`id` = "+req.site+" WHERE `shelf`.`status` = true;";
  }
  totalCapacity = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT});
  if(totalCapacity[0]){
    totalCapacity = totalCapacity[0]["totalCapacity"];
  }

  var totalLoadedCapacity = 0;
  var query = `select sum(loadedCapacity) as totalLoadedCapacity from shelves where status = true;`;
  if(req.site){
    query = "select sum(loadedCapacity) as totalLoadedCapacity FROM `shelves` AS `shelf` INNER JOIN `racks` AS `rack` ON `shelf`.`rackId` = `rack`.`id` INNER JOIN `zones` AS `rack->zone` ON `rack`.`zoneId` = `rack->zone`.`id` AND `rack->zone`.`siteId` LIKE '%%' INNER JOIN `sites` AS `rack->zone->site` ON `rack->zone`.`siteId` = `rack->zone->site`.`id` AND `rack->zone->site`.`id` = "+req.site+" WHERE `shelf`.`status` = true;";
  }
  totalLoadedCapacity = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT});
  if(totalLoadedCapacity[0]){
    totalLoadedCapacity = totalLoadedCapacity[0]["totalLoadedCapacity"];
  }
  if(totalLoadedCapacity){
    totalLoadedCapacity = 0;
  }
  totalCount = {
    totalLocations : total,
    totalCapacity : totalCapacity, 
    totalLoadedCapacity :totalLoadedCapacity
  }
  req.responseData = totalCount;
  next();
};

// Bulk upload of Shelf's
exports.BulkUpload = async (req, res,next) => {
  console.log(req.body);
  let responseDataArray = [];
  var serialNumber;
  var zoneId;
  var siteId;
  var rackId;

  var zoneData = await Zone.findAll({
    where: { 
      name: req.body.zoneName
    },
  });
  if(zoneData[0]){
    siteId = zoneData[0]["dataValues"]["siteId"];
    zoneId = zoneData[0]["dataValues"]["id"];
  }

  if(zoneId != null && zoneId != undefined && siteId != null && siteId != undefined){
    console.log("Line 398",req.body.locations.length);
    for(var a = 0; a<req.body.locations.length; a++){
      let name;
      var latestRack = await Rack.count({ 
        where:{
          zoneId:zoneId
        }
      });

      if(latestRack){
        let latestRackId = latestRack;
        latestRackId = parseInt(latestRackId) + 1;
        name = "RAC"+latestRackId;
      }
      else{
        name = "RAC1" 
      }
      const rack = {
        name: name,
        status:true,
        zoneId: zoneId,
        createdBy:req.user.username,
        updatedBy:req.user.username
      };

      await Rack.create(rack)
      .then(async data => {
        rackId = data["dataValues"]["id"];
        let rackName = data["dataValues"]["name"];
        let verticalData=0;
        for(var b = 0;b<req.body.locations[a]["row"];b++){
          for(var c = 0;c<req.body.locations[a]["column"];c++){
            verticalData = verticalData+1;
            let verticalBarcode = "0" +verticalData;
            await createShelf(req.body.locations[a]["weight"],req.body.locations[a]["volume"],responseDataArray,rackId,siteId,zoneId,verticalBarcode,req.body.siteName,req.body.zoneName,rackName,req.user.username)
          }
          verticalData=0;
        }

      })
      .catch(err => {
        console.log(err);
        return next(HTTPError(500, err["errors"][0]["message"] || "Some error occurred while creating the Shelfs."));  
      });
    }
    next();
    // res.status(200).send({
    //   responseDataArray
    // });
  }
  else{
    return next(HTTPError(500, "Zone & Site Not found."));
  }
};

async function createShelf(weight,volume,responseDataArray,rackId,siteId,zoneId,verticalBarcode,siteName,zoneName,rackName,username,req,res){
  var serialNumber;

  var shelfData = await serialNumberFinder.getShelfSerialNumber(rackId);
  
  serialNumber = await shelfSerialNumber.generateSerialNumber(shelfData,rackId,zoneId,siteId,verticalBarcode);   
  const shelf = {
    name: "SH-"+serialNumber+"",
    status:true,
    description: ""+siteName + "-" +zoneName+"-"+rackName+"",
    barcodeSerial:serialNumber,
    rackId: rackId,
    capacity: weight,
    loadedCapacity: 0,
    volume: volume,
    loadedVolume: 0,
    createdBy:username,
    updatedBy:username
  };

  var shelfCreated;
  try {
    shelfCreated = await Shelf.create(shelf);

    if (!shelfCreated) {
      return next(HTTPError(500, "Shelf not created"))
    }
  } 
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the shelf."))
    }
  }
  responseDataArray.push(shelfCreated);
};