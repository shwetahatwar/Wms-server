const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
var jwt = require('jsonwebtoken');
const Role = db.roles;
const Site = db.sites;
const UserSiteRelation = db.usersiterelations;
const userConfig = require('../config/user.config');
var HTTPError = require('http-errors');
const WhereBuilder = require('../helpers/WhereBuilder');

exports.create = async (req, res, next) => {
  const { username, password, role, site, employeeId } = req.body;

  if (!username) {
    return next(HTTPError(500, "User not created, invalid username"))
  }

  var foundRole = await Role.findOne({
    where: {
      name: role
    }
  });

  if (!foundRole) {
    return next(HTTPError(500, "User not created, inappropriate role"))
  }

  foundRole = foundRole.toJSON();

  // var foundSite = await Site.findOne({
  //   where: {
  //     name: site
  //   }
  // });

  // if (!foundSite) {
  //   return next(HTTPError(500, "User not created, inappropriate site"))
  // }

  // foundSite = foundSite.toJSON();

  try{
    var user = await User.create({
      username: username,
      password: password,
      status: "1",
      roleId: foundRole["id"],
      siteId: req.body.site,
      employeeId: employeeId,
      createdBy: req.user.username,
      updatedBy: req.user.username
    });

    if (!user) {
      return next(HTTPError(500, "User not created"))
    }

    user = user.toJSON();
    req.user = user;

    var userSiteRelation = await UserSiteRelation.create({
      userId : user["id"],
      siteId : foundSite["id"],
      createdBy:req.user.username,
      updatedBy:req.user.username
    });
    
    if (!userSiteRelation) {
      return next(HTTPError(500, "User Site Relation not created"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the user."))
    }     
  }

  next();
};

// Retrieve all Users from the database.
exports.findAll = async (req, res, next) => {
  var { name, siteId } = req.query;

  var whereClause = new WhereBuilder()
    .clause('name', name)
    .clause('siteId',siteId).toJSON();

  var list = await User.findAll({ 
    where: whereClause,
    include: [
    {
      model: Role
    },
    {
      model: Site
    }],
    order: [
      ['id', 'DESC'],
    ],
  });

  if (!list) {
    return next(HTTPError(400, "User not found"));
  }
  
  req.userList = list.map ( el => { return el.get({ plain: true }) } );
  next();
};

exports.getUser = async (req, res, next) => {
  var { username } = req.body;
  var user = null;

  if (username) {
    user = await User.scope('withPassword').findOne({
      where: {
        username: username
      },
      include: [{
        model: Role, as: 'role'
      }]
    });

    if (!user) {
      return next(HTTPError(404, "User not found"));
    }

    req.signinuser = user.toJSON();
  }

  if (req.signinuser) {
    req.username = req.signinuser.username;
    next();
  } else {
    next(HTTPError(404, "User not found"));
  }
}

exports.matchPassword = async (req, res, next) => {
  var { password } = req.body;

  if (!password) {
    return next(HTTPError(400, "Password required"))
  }

  console.log(password);
  const passwordMatched = await User.comparePassword(password, req.signinuser.password);

  if (!passwordMatched) {
    return next(HTTPError(400, "Password mismatched"))
  }

  next();
}

exports.sign_in = async (req, res, next) => {
  if (req.signinuser) {
    var user = req.signinuser;
    var jwtToken = jwt.sign({ username: user.username }, userConfig.SECRET)
    var response = { 
      token: jwtToken,
      username: user.username,
      userId:user.id,
      siteId:user.siteId,
      employeeId: user.employeeId,
      roleId:user["role"]["id"],
      role:user["role"]["name"]
    };

    req.userList = response;
    req.user = response;
    if(!response){
      return next(HTTPError(500, "User not found"));
    }
    next();
  }
  else {
    return next(HTTPError(500, "User not found"));
  }
};

exports.sendFindUserResponse = async (req, res, next) => {
  if(!req.userList) {
    req.userList = [];
    return next(HTTPError(401, "User not found"))
  }
  res.status(200).send(req.userList);
};

exports.sendCreateUserResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.findOne = async (req, res, next) => {
  const { id } = req.params;

  var foundUser = await User.findByPk(id);
  if (!foundUser) {
    return next(HTTPError(500, "User not found"))
  }
  req.userList = foundUser;
  next();
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  var { username, password, role, site, employeeId } = req.body;

  if (password) {
    password = await User.encryptPassword(password);
  }
  // console.log(password);
  whereClause = new WhereBuilder()
    .clause('username', username)
    .clause('password', password)
    .clause('roleId', role)
    .clause('siteId', site).toJSON();

    try{
      var updatedUser = await User.update(whereClause,{
        where: {
          id: id
        }
      });

      if (!updatedUser) {
        return next(HTTPError(500, "User not updated"))
      }
    }
    catch (err) {
      if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while updating the user."))
      }     
    }

  req.updatedUser = updatedUser;
  next();
};

exports.loginRequired = (req,res,next) => {
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' });
  }
};