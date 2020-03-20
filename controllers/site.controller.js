const db = require("../models");
const Site = db.sites;
const Op = db.Sequelize.Op;

// Create and Save a new Site
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const site = {
    name: req.body.name,
    status:true,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  Site.create(site)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the site."
      });
    });
};

//Get All Sites
exports.getAll = (req,res) =>{
  console.log("Line 37 IN");
  Site.findAll({
    where:req.query
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Sites."
      });
    });
};

//Update Site by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Site.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Site was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Site with id=${id}. Maybe Site was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Site with id=" + id
      });
    });
};

//Get Site by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Site.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Site with id=" + id
      });
    });
}
