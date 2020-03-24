const db = require("../models");
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;

// Create and Save a new PartNumber
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.partNumber) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const partNumber = {
    partNumber: req.body.partNumber,
    description: req.body.description,
    UOM: req.body.UOM,
    status:true,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  PartNumber.create(partNumber)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the PartNumber."
      });
    });
};

//Get All PartNumbers
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
  PartNumber.findAll({
    where:req.query,
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
      err.message || "Some error occurred while retrieving PartNumbers."
    });
  });
};

//Update PartNumber by Id
exports.update = (req, res) => {
  const id = req.params.id;

  PartNumber.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "PartNumber was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update PartNumber with id=${id}. Maybe PartNumber was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating PartNumber with id=" + id
      });
    });
};

//Get PartNumber by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  PartNumber.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving PartNumber with id=" + id
      });
    });
}

//search query
exports.findPartNumbersBySearchQuery = (req, res) => {
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

  var partNumber ='';
  var UOM ='';
  var description ='';

  if(req.query.partNumber != undefined){
    partNumber = req.query.partNumber;
  }
  if(req.query.description != undefined){
    description = req.query.description;
  }
  if(req.query.UOM != undefined){
    UOM = req.query.UOM;
  }

  PartNumber.findAll({ 
    where: {
      status:1,
      partNumber: {
        [Op.or]: {
          [Op.like]: '%'+partNumber+'%',
          [Op.eq]: ''+partNumber+''
        }
      },
      description: {
        [Op.or]: {
          [Op.like]: '%'+description+'%',
          [Op.eq]: ''+description+''
        }
      },
      UOM: {
        [Op.or]: {
          [Op.like]: '%'+UOM+'%',
          [Op.eq]: ''+UOM+''
        }
      }
    },
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
    await PartNumber.count({ 
      where: {
        status:1,
        partNumber: {
          [Op.or]: {
            [Op.like]: '%'+partNumber+'%',
            [Op.eq]: ''+partNumber+''
          }
        },
        description: {
          [Op.or]: {
            [Op.like]: '%'+description+'%',
            [Op.eq]: ''+description+''
          }
        },
        UOM: {
          [Op.or]: {
            [Op.like]: '%'+UOM+'%',
            [Op.eq]: ''+UOM+''
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
        err.message || "Some error occurred while retrieving PartNumbers."
      });
    });
    var totalParts = {
      totalCount : total
    }
    countArray.push(totalParts);
    responseData.push(countArray);
    res.send(responseData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PartNumbers."
    });
  });
};

// get count of all part numbers whose status =1 
exports.countOfPartNumbers = (req, res) => {
  var total = 0
  PartNumber.count({
    where :
    {
      status :1
    }
  })
  .then(data => {
    total = data;
    var totalCount = {
      totalParts : total 
    }
     res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Parts count."
    });
  });
};
