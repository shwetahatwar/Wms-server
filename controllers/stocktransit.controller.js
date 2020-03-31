const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
 var queryString = req.query;
  var offset = 0;
  var limit = 100;

  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  
  console.log(offset);
  console.log(limit);

  StockTransit.findAll({ 
    where: req.query,
    include: [
    {model: MaterialInward},
    {model: Site},
    // {model: User},
    ],
    offset:offset,
    limit:limit 
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving StockTransit."
      });
    });
};

// Find a single Stock transit  with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  StockTransit.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving StockTransit with id=" + id
      });
    });
};
