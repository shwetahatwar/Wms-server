const db = require("../models");
const Zone = db.zones;
const Rack = db.racks;
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

  const zone = {
    name: req.body.name,
    status:true,
    zoneId: req.body.zoneId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  Rack.create(zone)
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
  Rack.findAll({
    where:req.query,
    include:[
    {
      model:Zone
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
  var total = 0
  Rack.count({
    where :
    {
      status :1
    }
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
  var zoneId ='';

  if(req.query.name != undefined){
    name = req.query.name;
  }
  if(req.query.zoneId != undefined){
    zoneId = req.query.zoneId;
  }

  Rack.findAll({ 
    where: {
      status:1,
      name: {
        [Op.or]: {
          [Op.like]: '%'+name+'%',
          [Op.eq]: '%'+name+''
        }
      },
      zoneId: {
        [Op.or]: {
          [Op.like]: ''+zoneId+'%',
          [Op.eq]: ''+zoneId+''
        }
      }
    },
    include: [{model: Zone}],
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
        },
        zoneId: {
          [Op.or]: {
            [Op.like]: '%'+zoneId+'%',
            [Op.eq]: ''+zoneId+''
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
