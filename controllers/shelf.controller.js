const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Shelf = db.shelfs;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const serialNumberFinder = require('../functions/serialNumberFinder');

//Get All Shelfs
exports.getAll =async (req,res,next) =>{

  var {description,rackId,barcodeSerial,name,status,limit,offset} = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

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
    offset:newOffset,
    limit:newLimit
  });

  if (!getAllShelves) {
    return next(HTTPError(400, "Shelfs not found"));
  }
  
  req.shelfsList = getAllShelves.map ( el => { return el.get({ plain: true }) } );

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
  
  console.log("shelfData",shelfData)
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
  console.log("rackData",rackData);
  siteName=rackData["zone"]["site"]["name"];
  zoneName=rackData["zone"]["name"];
  rackName=rackData["name"];

  serialNumber = await generateSerialNumber(shelfData,rackId,zoneId,siteId,vertical); 
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

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send(req.shelfCreated);
};

//Update Shelf by Id
exports.update = async(req, res,next) => {
  const id = req.params.id;

  var { name , rackId , description , capacity , loadedCapacity , volume , loadedVolume ,
    status , updatedBy} = req.body;

    whereClause = new WhereBuilder()
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
      updatedShelf = await Shelf.update(whereClause,{
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

  exports.sendUpdateResponse = async (req, res, next) => {
    res.status(200).send({message: "success"});
  };

//Get Shelf by Id
exports.getById = async (req,res,next) => {
  const id = req.params.id;

  var shelf = await Shelf.findByPk(id);
  if (!shelf) {
    return next(HTTPError(500, "shelf not found"))
  }
  req.shelfsList = shelf;
  next();
};

exports.findShelfsBySearchQuery = async(req, res,next) => {

  var { name, zone , rack , site , status , offset , limit } = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  if(!name){
    name ='';
  }
  if(!zone){
    zone = '';
  }
  if(!site){
    site = '';
  }
  if(!rack){
    rack = '';
  }

  var whereClause = {};
  var siteWhereClause = {};
  var zoneWhereClause = {};
  var rackWhereClause = {};

  if(name){
    whereClause.name = {
      [Op.like] : '%'+name+'%'
    }
  }

  whereClause.status = true;

  if(rack){
    rackWhereClause.name = {
      [Op.like]:'%'+rack+'%'
    };
  }

  if(site){
    siteWhereClause.name = {
      [Op.like]:'%'+site+'%'
    };
  }

  if(zone){
    zoneWhereClause.name = {
      [Op.like]:'%'+zone+'%'
    };
  }

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
      offset:newOffset,
      limit:newLimit
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

  res.status(200).send(responseData);
};

// get count of all shelfs whose status =1 
exports.countOfShelfs = async (req, res) => {
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

  res.status(200).send(totalCount);
};

// Bulk upload of Shelf's
exports.BulkUpload = async (req, res) => {
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
            console.log("Line 415",rackId,siteId,zoneId,verticalData,verticalBarcode,req.body.siteName,req.body.zoneName,rackName)
            await createShelf(req.body.locations[a]["weight"],req.body.locations[a]["volume"],responseDataArray,rackId,siteId,zoneId,verticalBarcode,req.body.siteName,req.body.zoneName,rackName,req.user.username)
          }
          verticalData=0;
        }

      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message:
          err["errors"][0]["message"] || "Some error occurred while creating the Rack."
        });
      });
    }
    res.status(200).send({
      responseDataArray
    });
  }
  else{
    res.status(500).send({
      message:
      err.message || "Zone & Site Not found."
    });
  }
};

async function generateSerialNumber(shelfData,rackId,zoneId,siteId,vertical){
  let serialNumber;
  if(shelfData){
    serialNumber = shelfData["barcodeSerial"];
    zoneId = shelfData["rack"]["zoneId"];
    siteId = shelfData["rack"]["zone"]["siteId"];
    serialNumber = serialNumber.substring(10,13);
    serialNumber = (parseInt(serialNumber) + 1).toString();
    var str = serialNumber;
    if(str.length == 1) {
      str = '00' + str;
    }
    else if(str.length == 2) {
      str = '0' + str;
    }

    if(siteId.toString().length < 2) {
      serialNumber = '0' + siteId;
    }
    else{
      serialNumber = siteId;
    }
    if(zoneId.toString().length < 2) {
      serialNumber = serialNumber + "-" + '0' + zoneId;
    }
    else{
      serialNumber = serialNumber + "-" + zoneId;
    }
    if(rackId.toString().length == 1) {
      serialNumber = serialNumber + "-" + '00' + rackId;
    }
    else if(rackId.toString().length == 2) {
      serialNumber = serialNumber + "-" +'0' + rackId;
    }
    else{
      serialNumber = serialNumber + "-" + rackId;
    }
    serialNumber = serialNumber + "-" + str + "-" + vertical;

  }
  else{
    if(!zoneId || !siteId){
      var rackData = await Rack.findOne({
        where: { 
          id: rackId,
        },
        include: [{
          model: Zone
        }],
      });

      if(!rackData){
        return next(HTTPError(500, "Shelf not created,invalid rack"))
      }

      if(rackData){
        rackData = rackData.toJSON();
        zoneId = rackData["zoneId"];
        siteId = rackData["zone"]["siteId"]
      }
    }

    if(siteId.toString().length < 2) {
      serialNumber = '0' + siteId;
    }
    else{
      serialNumber = siteId;
    }
    if(zoneId.toString().length < 2) {
      serialNumber = serialNumber + "-" + '0' + zoneId;
    }
    else{
      serialNumber = serialNumber + "-" + zoneId;
    }
    if(rackId.toString().length == 1) {
      serialNumber = serialNumber + "-" + '00' + rackId;
    }
    else if(rackId.toString().length == 2) {
      serialNumber =serialNumber +"-" +  '0' + rackId;
    }
    else{
      serialNumber = serialNumber + "-" + rackId;
    }
    serialNumber = serialNumber + "-" + "001" + "-" + vertical;

  }
  console.log("serialNumber",serialNumber);
  return serialNumber
}

async function createShelf(weight,volume,responseDataArray,rackId,siteId,zoneId,verticalBarcode,siteName,zoneName,rackName,username,req,res){
  var serialNumber;

  var shelfData = await serialNumberFinder.getShelfSerialNumber(rackId);
  
  serialNumber = await generateSerialNumber(shelfData,rackId,zoneId,siteId,verticalBarcode);   
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
}

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.shelfsList);
};