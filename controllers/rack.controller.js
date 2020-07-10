const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new Rack
exports.create = async (req, res,next) => {
  var { name,zoneId} = req.body;
  
  if (!name || !zoneId) {
    return next(HTTPError(500, "Rack not created,name or zone field is empty"))
  }

  var rack;
  try {
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
  } catch (err) {
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
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  console.log("Line 51", req.query);
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  var {siteId,zoneId, name,status} = req.query;

  var whereClause = new WhereBuilder()
  .clause('siteId', siteId)
  .clause('name', name)
  .clause('zoneId', zoneId)
  .clause('status', status).toJSON();

  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  var getAllRacks;
  getAllRacks = await Rack.findAll({
    where:whereClause,
    include:[
    {
      model:Zone,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
      include:[{
        model:Site,
        }]
      }
      ],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });

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
  }catch (err) {
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
exports.countOfRacks = (req, res) => {
  var total = 0;
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  Rack.count({
    where :
    {
      status :1
    },
    include:[
    {
      model:Zone,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
      include:[{
        model:Site,
        }]
      }
      ]
    })
  .then(data => {
    total = data;
    var totalCount = {
      totalRacks : total 
    }
    res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Racks count."
    });
  });
};

// get count of all Racks by Zone 
exports.countOfRacksByZoneId = (req, res) => {
  var total = 0;
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  Rack.count({
    where :
    {
      zoneId :req.query.zoneId
    },
    include:[
    {
      model:Zone,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
      include:[{
        model:Site,
        }]
      }
      ]
    })
  .then(data => {
    total = data;
    var totalCount = {
      totalRacks : total 
    }
    res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Racks count."
    });
  });
};

//search query
exports.findRacksBySearchQuery = (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];

  var name ='';
  var zone ='';
  var site = '';

  if(req.query.name != undefined){
    name = req.query.name;
  }
  if(req.query.zone != undefined){
    zone = req.query.zone;
  }
  if(req.query.site != undefined){
    site = req.query.site;
  }
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  Rack.findAll({ 
    where: {
      status:1,
      name: {
        [Op.or]: {
          [Op.like]: '%'+name+'%',
          [Op.eq]: '%'+name+''
        }
      }
    },
    include: [{model: Zone,
      required:true,
      where: {
        name: {
          [Op.like]: '%'+zone+'%'
        },
        siteId: {
            [Op.like]: checkString
          }
      },
      include:[{
        model:Site,
        required:true,
        where: {
          name: {
            [Op.like]: '%'+site+'%'
          }
        },
      }]}],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    })
  .then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    await Rack.count({ 
      where: {
        status:1,
        name: {
          [Op.or]: {
            [Op.like]: '%'+name+'%',
            [Op.eq]: ''+name+''
          }
        }
      },
      include: [{model: Zone,
        required:true,
        where: {
          name: {
            [Op.like]: '%'+zone+'%'
          },
          siteId: {
            [Op.like]: checkString
          }
        },
        include:[{
          model:Site,
          required:true,
          where: {
            name: {
              [Op.like]: '%'+site+'%'
            }
          },
        }]}],
      })
    .then(data => {
      total = data;
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving Locations."
      });
    });
    var totalRacks = {
      totalCount : total
    }
    countArray.push(totalRacks);
    responseData.push(countArray);
    res.send(responseData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Locations."
    });
  });
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.racksList);
};