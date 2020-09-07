const db = require("../models");
const UserSiteRelation =  db.usersiterelations
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

exports.findAll = async (req, res, next) => {
  var {offset,limit,userId,siteId} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

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
  req.responseData = req.dataList;
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
  req.responseData = req.dataList;
  next();
};