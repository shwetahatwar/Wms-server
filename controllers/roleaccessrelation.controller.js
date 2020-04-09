const db = require("../models");
const RoleAccessRelation = db.roleaccessrelations;
const Op = db.Sequelize.Op;
const Role = db.roles;
const Access = db.access;

// Create and Save a new RoleAccessRelation
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.url) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

Access.findAll({ 
    where: {
      url: {
        [Op.or]: {
          [Op.like]: '%'+req.body.url+'%',
          [Op.eq]: '%'+req.body.url+''
        }
      }
    }
  })
  .then(async data => {
    var responseData;
    for(var i=0;i<=data.length;i++){
      const accessData = {
        roleId: req.body.roleId,
        accessId:data[i]["dataValues"]["id"],
        status:true,
        createdBy:req.user.username,
        updatedBy:req.user.username
      };

      await RoleAccessRelation.create(accessData)
      .then(data => {
        responseData.push(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
          err["errors"][0]["message"] || "Some error occurred while creating the RoleAccessRelation."
        });
      });
    }
    res.send(responseData);
  })
  .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while creating RoleAccessRelation."
      });
    }); 
};

//Get All RoleAccessRelation
exports.getAll = (req,res) =>{
  RoleAccessRelation.findAll({
    where:req.query,
    include: [{
      model: Role
    },
    {
      model: Access
    }],
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
          err.message || "Some error occurred while retrieving RoleAccessRelation."
      });
    });
};

//Update RoleAccessRelation by Id
exports.update = (req, res) => {
  const id = req.params.id;

  RoleAccessRelation.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "RoleAccessRelation was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update RoleAccessRelation with id=${id}. Maybe RoleAccessRelation was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating RoleAccessRelation with id=" + id
      });
    });
};

//Get RoleAccessRelation by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  RoleAccessRelation.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving RoleAccessRelation with id=" + id
      });
    });
}
