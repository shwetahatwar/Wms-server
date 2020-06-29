const db = require("../models");
const PicklistMaterialList = db.picklistmateriallists;
const Op = db.Sequelize.Op;
const Picklist = db.picklists;
const PartNumber = db.partnumbes;


// Create and Save a new Picklist Material List
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.picklistId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Picklist Material List
  const picklistmateriallist = {
    picklistId: req.body.picklistId,
    batchNumber: req.body.batchNumber,
    purchaseOrderNumber: req.body.purchaseOrderNumber,
    numberOfPacks: req.body.numberOfPacks,
    PartNumber:req.body.PartNumber,
    location:req.body.location,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  // Save Picklist Material List in the database
  PicklistMaterialList.create(picklistmateriallist)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the Picklist Material List."
    });
  });
};

// Retrieve all Picklist Materials List from the database.
exports.findAll = (req, res) => {
  
 PicklistMaterialList.findAll({
  where: req.query,
  include: [{
      model: Picklist
    }] 
  })
 .then(data => {
    res.send(data);
  })
 .catch(err => {
  res.status(500).send({
    message:
    err.message || "Some error occurred while retrieving Picklist Materials List."
  });
});
};

// Find a single Picklist Material List with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  PicklistMaterialList.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Picklist Material List with id=" + id
    });
  });
};

// Update a Picklist Material List by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  PicklistMaterialList.update(req.body, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist Material List was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Picklist Material List with id=${id}. Maybe Picklist Material List was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist Material List with id=" + id
    });
  });
};

//Get Picklist Material List with Picklist Id
exports.getPicklistMaterialListByPicklistId = (req, res) => {
  var picklistId = req.query.picklistId
  PicklistMaterialList.findAll({
    where: { picklistId : picklistId },
    include: [{
      model: Picklist
    }] 
  })
 .then(data => {
    res.send(data);
  })
 .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Material List."
    });
  });
};

//get data by search query
exports.findPicklistItemsBySearchQuery = async (req, res) => {
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
  if(req.query.partNumber == undefined || req.query.partNumber == null){
    req.query.partNumber="";
  }
  if(req.query.partDescription == undefined || req.query.partDescription == null){
    req.query.partDescription="";
  }

  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  PicklistMaterialList.findAll({ 
    where: {
      picklistId:req.query.picklistId,
      partNumber: {
        [Op.or]: {
          [Op.eq]: ''+req.query.partNumber+'',
          [Op.like]: '%'+req.query.partNumber+'%'
        }
      },
      partDescription: {
        [Op.or]: {
          [Op.eq]: ''+req.query.partDescription+'',
          [Op.like]: '%'+req.query.partDescription+'%'
        }
      }
    },
    include: [{
      model: Picklist,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
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
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PicklistMaterialList."
    });
  });
};

