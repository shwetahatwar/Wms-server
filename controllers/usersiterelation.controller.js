const db = require("../models");
const UserSiteRelation =  db.usersiterelations
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

exports.findAll = async (req, res, next) => {
  var {offset,limit,userId,siteId} = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('userId', userId)
  .clause('siteId', siteId).toJSON();

  var getData;
  getData = await UserSiteRelation.findAll({ 
    where: whereClause,
    include: [
    {model: Site},
    ],
    order: [
    ['id', 'DESC'],
    ],
    offset:newOffset,
    limit:newLimit 
  })
  
  if (!getData) {
    return next(HTTPError(400, "User site relation not found"));
  }
  
  req.dataList = getData.map ( el => { return el.get({ plain: true }) } );

  next();
};

// Find a single User Site Relation with an id
exports.findOne = async(req, res,next) => {
  const id = req.params.id;

  var data = await UserSiteRelation.findByPk(id);
  if (!data) {
    return next(HTTPError(500, "User site relation not found"))
  }
  req.dataList = data;
  next();
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.dataList);
};