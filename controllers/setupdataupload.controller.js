const db = require("../models");
const Material = db.materials;
const User = db.users;
const Role = db.roles;

exports.uploadUserMaster = async (req,res) =>{
  const role = {
      name: "Admin",
      status:true,
      createdBy:"admin",
      updatedBy:"admin"
    };

    var roleData;
    Role.create(role)
    .then(data => {
      console.log("Line 180",data["dataValues"]["id"]);
      roleData = data["dataValues"]["id"];
      const user = {
        username: "admin",
        password: "briot",
        status: "1",
        roleId: roleData,
        employeeId:1004,
        createdBy:"admin",
        updatedBy:"admin"
      };

      // Save User in the database
      User.create(user)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the role."
      });
    });

}