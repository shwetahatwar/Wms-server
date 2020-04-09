const db = require("../models");
const UOM = db.uoms;
const Op = db.Sequelize.Op;

// Create and Save a new UOM
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const uomData = {
    name: req.body.name,
    status:true,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  UOM.create(uomData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the UOM."
      });
    });
};

//Get All UOMS
exports.getAll = (req,res) =>{
  UOM.findAll({
    where:req.query
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving UOMS."
      });
    });
};

//Update UOM by Id
exports.update = (req, res) => {
  const id = req.params.id;

  UOM.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "UOM was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update UOM with id=${id}. Maybe UOM was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Role with id=" + id
      });
    });
};

//Get UOM by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  UOM.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving UOM with id=" + id
      });
    });
}
