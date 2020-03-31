const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
var jwt = require('jsonwebtoken');
const Role = db.roles;
const Site = db.sites;
const UserSiteRelation = db.usersiterelations;
var bcrypt = require('bcrypt-nodejs');
var bbPromise = require('bluebird');

// Create and Save a new User
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  var roleId;
  await Role.findAll({
    where: {
      name:req.body.role
    }
  })
  .then(data => {
    roleId = data[0]["dataValues"]["id"];
  })
  .catch(err => {
    return res.status(401).json({ message: 'Invalid Role' });
  })

  var siteId;
  console.log("SIte",req.body.site);
  await Site.findAll({
    where: {
      name:req.body.site
    }
  })
  .then(data => {
    siteId = data[0]["dataValues"]["id"];
  })
  .catch(err => {
    return res.status(401).json({ message: 'Invalid Site' });
  })

  // Create a User
  const user = {
    username: req.body.username,
    password: req.body.password,
    status: "1",
    roleId: roleId,
    siteId: siteId,
    employeeId:req.body.employeeId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  // Save User in the database
  await User.create(user)
    .then(async data => {
      console.log("Data",data["id"])
      var userSite = {
        userId : data["id"],
        siteId : siteId,
        createdBy:req.user.username,
        updatedBy:req.user.username

      }
      await UserSiteRelation.create(userSite)
      .then(data => {

      })
      .catch(err => {
        console.log("Error",err);
        res.status(500).send({
          message:
          err["errors"][0]["message"] || "Some error occurred while creating the UserSite Relation."
        });
      });
      res.send(data);
    })
    .catch(err => {
      console.log("Error",err["errors"]);
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the User."
      });
    });
};

exports.sign_in = (req, res) => {
  User.scope('withPassword').findOne({
    where: {
      username: req.body.username,
    },
    include: [{
      model: Role
    }],
  }).then((user) => {
    if(user.status == false){
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }

    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }

    return res.json(
      { token: jwt.sign({ username: user.username }, 'THISISLONGSTRINGKEY'),
      username: user.username,
      userId:user.id,
      siteId:user.siteId,
      employeeId: user.employeeId,
      roleId:user["role"]["id"],
      role:user["role"]["name"]
    })
  })
  .catch((err) => {
    console.log('err', err);
    if (err) {
      return res.status(401).json({ message: 'Error while authenticating.' });
    }
  });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {

  User.findAll({ 
    where: req.query,
    include: [
    {
      model: Role
    },
    {
      model: Site
    },
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
          err.message || "Some error occurred while retrieving users."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all users."
      });
    });
};

// Find all published Users
exports.findAllPublished = (req, res) => {
  User.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
};

exports.loginRequired = (req,res,next) => {
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
};

exports.reset_pass = (req, res) => {
  console.log("Inside reset Pass");
  var resetPassword = req.query.password;
  
  var passwordReset = new bbPromise(function(resolve, reject) {
    bcrypt.genSalt(5, function(err, salt) {
      if (err) { reject(err); return; }

      bcrypt.hash(resetPassword, salt, null, function(err, hash) {
        if (err) { reject(err); return; }
        var hashGenerated = hash;
        var json = {
          "password":hashGenerated
        };
        console.log("json",json);
        console.log("resetPassword",hashGenerated);
        User.update(json, {
          where: req.params
        })
        .then(num => {
          if (num == 1) {
            res.send({
              message: "User was updated successfully."
            });
          } else {
            res.send({
              message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating User with id=" + id
          });
        });
      });
    });
  });
};