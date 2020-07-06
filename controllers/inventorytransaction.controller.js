const db = require("../models");
const MaterialInward = db.materialinwards;
const InventoryTransaction = db.inventorytransactions;
const Op = db.Sequelize.Op;

// Retrieve all Inventory Transaction from the database.
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
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  InventoryTransaction.findAll({ 
    where: req.query,
    include: [{
      model: MaterialInward,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
    }],
    offset:offset,
    limit:limit 
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving InventoryTransaction."
      });
    });
};

// Find a single Inventory Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  InventoryTransaction.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving InventoryTransaction with id=" + id
      });
    });
};

