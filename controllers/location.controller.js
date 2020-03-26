const db = require("../models");
const Location = db.locations;
const Site = db.sites;
const Op = db.Sequelize.Op;

// Create and Save a new Location
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  var siteId;
  await Site.findAll({
    where: {
      name:req.body.site
    }
  })
  .then(data => {
    siteId = data[0]["dataValues"]["id"];
  })
  .catch(err => {
    return res.status(401).json({ message: 'Invalid Site' });
  })

  var serialNumberId;
  await Location.findAll({
    order: [
    ['id', 'DESC'],
    ],
  })
  .then(data => {
    if(data[0] != null || data[0] != undefined){
      serialNumberId = data[0]["dataValues"]["barcodeSerial"];
      serialNumberId = serialNumberId.substring(serialNumberId.length -6, serialNumberId.length);
      serialNumberId = (parseInt(serialNumberId) + 1).toString();
      var str = '' + serialNumberId;
      while (str.length < 6) {
        str = '0' + str;
      }
      serialNumberId = "LOC" + str;
      console.log("Line 46 Serial Number", str);
    }
    else{
      serialNumberId = "LOC" + "000001";
    }
  })
  .catch(err=>{
    serialNumberId = "LOC" + "000001";
  });

  const location = {
    name: req.body.name,
    description: req.body.description,
    barcodeSerial: serialNumberId, 
    siteId:siteId,
    status:true,
    capacity: req.body.capacity,
    loadedCapacity: 0,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  Location.create(location)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the location."
      });
    });
};

//Get All Locations
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
  Location.findAll({
    where:req.query,
    order: [
    ['id', 'DESC'],
    ],
    include: [{model: Site}],
    offset:offset,
    limit:limit
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Locations."
    });
  });
};

//Update Locations by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Location.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Location was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Location with id=${id}. Maybe Location was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Locations with id=" + id
      });
    });
};

//Get Locations by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Location.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Locations with id=" + id
      });
    });
}

//search query
exports.findLocationsBySearchQuery = (req, res) => {
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
  var description ='';

  if(req.query.name != undefined){
    name = req.query.name;
  }
  if(req.query.description != undefined){
    description = req.query.description;
  }

  Location.findAll({ 
    where: {
      status:1,
      name: {
        [Op.or]: {
          [Op.like]: '%'+name+'%',
          [Op.eq]: '%'+name+''
        }
      },
      description: {
        [Op.or]: {
          [Op.like]: ''+description+'%',
          [Op.eq]: ''+description+''
        }
      }
    },
    include: [{model: Site}],
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
    await Location.count({ 
      where: {
        status:1,
        name: {
          [Op.or]: {
            [Op.like]: '%'+name+'%',
            [Op.eq]: ''+name+''
          }
        },
        description: {
          [Op.or]: {
            [Op.like]: '%'+description+'%',
            [Op.eq]: ''+description+''
          }
        }
      },
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
    var totalLocations = {
      totalCount : total
    }
    countArray.push(totalLocations);
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

// get count of all locations whose status =1 
exports.countOfLocations = (req, res) => {
  var total = 0
  Location.count({
    where :
    {
      status :1
    }
  })
  .then(data => {
    total = data;
    var totalCount = {
      totalLocations : total 
    }
     res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Location count."
    });
  });
};