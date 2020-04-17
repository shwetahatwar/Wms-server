const db = require("../models");
const RoleAccessRelation = db.roleaccessrelations;
const Op = db.Sequelize.Op;
const Role = db.roles;
const Access = db.access;

// Create and Save a new RoleAccessRelation
exports.create =async (req, res) => {
  console.log(req.body);
 
  // Validate request
  if (!req.body.roleId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  let responseData=[];
  for(var i=0;i<req.body.accessData.length;i++){
    await Access.findAll({ 
      where: {
        url: req.body.accessData[i]["url"] 
      }
    })
    .then(async data => {
      let accessId =data[0]["dataValues"]["id"]; 
      await RoleAccessRelation.findAll({
        where:{
          roleId: req.body.roleId,
          accessId: data[0]["dataValues"]["id"],
        }
      })
      .then(async data => {
        if(data.length == 0){
          const accessData = {
            roleId: req.body.roleId,
            accessId: accessId,
            status: true,
            createdBy:req.user.username,
            updatedBy:req.user.username
          };

          await RoleAccessRelation.create(accessData)
          .then(data => {
            console.log("Data on 44",data);
            responseData.push(data);
          })
          .catch(err => {
            console.log("error on 48",err)
            res.status(500).send({
              message:
              err["errors"][0]["message"] || "Some error occurred while creating the RoleAccessRelation."
            });
          });
        }
        else{
          let updateData;
          if(data[0]["dataValues"]["status"]==false){
            updateData={
              status:true
            };
          }
          else{
            updateData={
              status:false
            };
          }
          RoleAccessRelation.update(updateData, {
            where: {
              id:data[0]["dataValues"]["id"]
            }
          })
          .then(num => {
            if (num == 1) {
              console.log("Updated")
            } 
            else {
              console.log("Cannot update RoleAccessRelation with id=",data[0]["dataValues"]["id"])
            }
          })
          .catch(err => {
            console.log("Error updating RoleAccessRelation with id=", data[0]["dataValues"]["id"],err)
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message:
          err["errors"][0]["message"] || "Some error occurred while creating the RoleAccessRelation."
        });
      })
    })
      .catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while creating RoleAccessRelation."
        });
      });
  }
  res.send(responseData)
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

exports.validateAccessUrl = async (req,res) =>{
  console.log("req",req.query)
  await Access.findAll({ 
    where: {
      url: req.query.accessUrl 
    }
  })
  .then(async data => {
    if(data.length !=0){
      let accessId =data[0]["dataValues"]["id"];

      await RoleAccessRelation.findAll({
        where:{
          roleId: req.query.roleId,
          accessId: data[0]["dataValues"]["id"],
          status:true
        }
      })
      .then(async data => {
        if(data.length !=0){
          res.send(data);
        }
        else{
          let data = [];
          res.status(200).send(data);
        }
      })
      .catch(err => {
        console.log("Error on 192",err)
        res.status(500).send({
          message: "Error retrieving RoleAccessRelation"
        });
      })
    }
    else{
      let data = [];
       res.status(200).send(data);
    }
  })
  .catch(err => {
    console.log("Error on 199",err)
    res.status(500).send({
      message: "Error retrieving RoleAccessRelation"
    });
  });
};
