const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Site = db.sites;
const Op = db.Sequelize.Op;

// Create and Save a new Rack
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const rack = {
    name: req.body.name,
    status:true,
    zoneId: req.body.zoneId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  Rack.create(rack)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err["errors"][0]["message"] || "Some error occurred while creating the Rack."
    });
  });
};

//Get All Rack
exports.getAll = (req,res) =>{
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
  delete queryString['offset'];
  delete queryString['limit'];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  Rack.findAll({
    where:req.query,
    include:[
    {
      model:Zone,
      include:[{
        model:Site,
        required:true,
        where: {
          id: {
            [Op.like]: checkString
          }
        }}]
      }
      ],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Rack."
    });
  });
};

//Update Rack by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Rack.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Rack was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Rack with id=${id}. Maybe Rack was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Rack with id=" + id
    });
  });
};

//Get Rack by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Rack.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Rack with id=" + id
    });
  });
}

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
      include:[{
        model:Site,
        required:true,
        where: {
          id: {
            [Op.like]: checkString
          }
        }}]
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
      include:[{
        model:Site,
        required:true,
        where: {
          id: {
            [Op.like]: checkString
          }
        }}]
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
        }
      },
      include:[{
        model:Site,
        required:true,
        where: {
          name: {
            [Op.like]: '%'+site+'%'
          },
          id: {
            [Op.like]: checkString
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
          }
        },
        include:[{
          model:Site,
          required:true,
          where: {
            name: {
              [Op.like]: '%'+site+'%'
            },
            id: {
              [Op.like]: checkString
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
