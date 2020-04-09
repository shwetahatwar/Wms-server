const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
const Shelf = db.shelfs;
const Op = db.Sequelize.Op;

// Create and Save a new Shelf
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  
  var serialNumber;
  var zoneId;
  var siteId;
  var rackId=req.body.rackId;
  await Shelf.findAll({
    where: { 
      rackId: req.body.rackId
    },
    include:[{
      model:Rack
    }],
    limit:1,
    offset:0,
    order: [
    ['id', 'DESC'],
    ],
  })
  .then(async data => {
    console.log("Data On line 43",data);
    if(data[0] != null || data[0] != undefined){
      console.log("In If");
      serialNumber = data[0]["dataValues"]["barcodeSerial"];
      zoneId = data[0]["dataValues"]["rack"]["zoneId"];
      serialNumber = (parseInt(serialNumber) + 1).toString();
      var str = serialNumber;
      if(str.length == 1) {
        str = '00' + str;
      }
      else if(str.length == 2) {
        str = '0' + str;
      }

      await Zone.findAll({
        where: { 
          id: zoneId
        },
      })
      .then(async data => {
        console.log("Data On line 43",data);
        if(data[0] != null || data[0] != undefined){
          siteId = data[0]["dataValues"]["siteId"]
        }
      })
      .catch(err=>{
        res.status(500).send({
          message:
          err.message || "Some error occurred while creating Shelf."
        });
      });

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
        serialNumber = '0' + rackId;
      }
      else{
        serialNumber = serialNumber + "-" + rackId;
      }

      serialNumber = serialNumber + "-" + str + "-" + req.body.vertical;
      console.log("Line 50 Serial Number", serialNumber);
    }
    else{
      await Rack.findAll({
        where: { 
          id: req.body.rackId,
        },
          include: [{
            model: Zone
          }],
      })
      .then(async data => {
        console.log("Data On line 105",data);
        if(data[0] != null || data[0] != undefined){
          zoneId = data[0]["dataValues"]["zoneId"];
          siteId = data[0]["dataValues"]["zone"]["siteId"];
        }
      })
      .catch(err=>{
        res.status(500).send({
          message:
          err.message || "Some error occurred while creating Shelf."
        });
      });
      console.log("Site Id",siteId);
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
        serialNumber = '0' + rackId;
      }
      else{
        serialNumber = serialNumber + "-" + rackId;
      }
      serialNumber = serialNumber + "-" + "001" + "-" + req.body.vertical;
      console.log("Line 50 Serial Number", serialNumber);
    }
  })
  .catch(err=>{
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating Shelf."
    });
  });

  const shelf = {
    name: req.body.name,
    status:true,
    description: req.body.description,
    barcodeSerial:serialNumber,
    rackId: req.body.rackId,
    capacity: req.body.capacity,
    loadedCapacity: 0,
    volume: req.body.volume,
    loadedVolume: 0,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };
  
  Shelf.create(shelf)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err["errors"][0]["message"] || "Some error occurred while creating the Shelf."
    });
  });
};

//Get All Shelfs
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
  Shelf.findAll({
    where:req.query,
    include:[
    {
      model : Rack
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
      err.message || "Some error occurred while retrieving Shelfs."
    });
  });
};

//Update Shelf by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Shelf.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Shelf was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Shelf with id=${id}. Maybe Shelf was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Shelf with id=" + id
    });
  });
};

//Get Shelf by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Shelf.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Shelf with id=" + id
    });
  });
}

exports.findShelfsBySearchQuery = (req, res) => {
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

  Shelf.findAll({ 
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
    include: [{model: Rack}],
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
    await Shelf.count({ 
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
        err.message || "Some error occurred while retrieving Shelf."
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
      err.message || "Some error occurred while retrieving Shelf."
    });
  });
};

// get count of all shelfs whose status =1 
exports.countOfShelfs = (req, res) => {
  var total = 0
  Shelf.count({
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
      err.message || "Some error occurred while retrieving Shelf count."
    });
  });
};
