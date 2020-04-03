const db = require("../models");
const Access = db.access;
const Op = db.Sequelize.Op;

// Create and Save a new access
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.url) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const accessData = {
    url: req.body.url,
    httpMethod:req.body.httpMethod
  };

  Access.create(accessData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the Access."
      });
    });
};

//Get All Access
exports.getAll = (req,res) =>{
  Access.findAll({
    where:req.query
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Access."
      });
    });
};

//Update Access by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Access.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Access was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Access with id=${id}. Maybe Access was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Access with id=" + id
      });
    });
};

//Get Access by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Access.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Access with id=" + id
      });
    });
}
