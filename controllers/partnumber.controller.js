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
  PartNumber.findAll({
    where:req.query
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
