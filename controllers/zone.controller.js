const db = require("../models");
const Site = db.sites;
const Zone = db.zones;
const Op = db.Sequelize.Op;

// Create and Save a new Zone
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
    siteId: req.body.siteId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };
  
  Zone.create(zone)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the Zone."
      });
    });
};

//Get All Zone
exports.getAll = (req,res) =>{
  Zone.findAll({
    where:req.query,
    include:[
    {
      model:Site
    }
    ],
     order: [
    ['id', 'DESC'],
    ],
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Zone."
      });
    });
};

//Update Zone by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Zone.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Zone was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Zone with id=${id}. Maybe Zone was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Zone with id=" + id
      });
    });
};

//Get Zone by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Zone.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Zone with id=" + id
      });
    });
}
