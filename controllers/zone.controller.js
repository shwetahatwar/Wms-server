const db = require("../models");
const Site = db.sites;
const Zone = db.zones;
const Op = db.Sequelize.Op;

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
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while creating the zone."
        ))
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

  console.log(whereClause);
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
  }catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while updating the zone."
        ))
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

exports.findZonesBySearchQuery = (req, res) => {
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }

  var zone ='';
  var site = '';
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  if(req.query.zone != undefined){
    zone = req.query.zone;
  }
  if(req.query.site != undefined){
    site = req.query.site;
  }

  Zone.findAll({ 
    where: {
      status:1,
      name: {
        [Op.or]: {
          [Op.like]: '%'+zone+'%',
          [Op.eq]: '%'+zone+''
        }
      },
      siteId: {
          [Op.like]: checkString
        }
    },
    include: [{model: Site,
      required:true,
      where: {
        name: {
          [Op.like]: '%'+site+'%'
        }
      },
    }],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  }).then(async data => {
    res.send(data);
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
  res.status(200).send(req.zonesList);
};