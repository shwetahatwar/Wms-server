const db = require("../models");
const PicklistPickingMaterialList = db.picklistpickingmateriallists;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
const PicklistMaterialList = db.picklistmateriallists;
const MaterialInward = db.materialinwards;

// Create and Save a new Picklist Picking Material List
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.picklistId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  console.log(req.body.material.length);
  for(var i=0;i<req.body.material.length;i++){
    if(req.body.material[i].serialNumber){
     req.body.material[i].serialNumber = req.body.material[i].serialNumber.trim();
   }
    // Create a Picklist Picking Material List
    const picklistpickingmateriallist = {
      picklistId: req.body.picklistId,
      userId:req.body.userId,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:req.body.material[i].partNumber,
      batchNumber:req.body.material[i].batchNumber,
      serialNumber:req.body.material[i].serialNumber,
      quantityPicked:req.body.materials[i].quantity
    };

    // Save Picklist Picking Material List in the database
    PicklistPickingMaterialList.create(picklistpickingmateriallist)
    .then(data => {

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Picklist Picking Material List."
      });
    });
  }
  res.status(200).send({
    message:
      "Picklist Picking Material List created."
  });
  
};

//Get Picklist Picking Material List
exports.getAll = (req,res) =>{
  if(req.query.serialNumber){
    req.query.serialNumber = req.query.serialNumber.trim();
  }
  PicklistPickingMaterialList.findAll({
    where:req.query
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Picklist Picking Material List."
      });
    });
};

//Get Picklist Picking Material List by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  PicklistPickingMaterialList.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Picklist Picking Material List with id=" + id
      });
    });
};
