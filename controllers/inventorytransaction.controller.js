const db = require("../models");
const MaterialInward = db.materialinwards;
const InventoryTransaction = db.inventorytransactions;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

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
  });

  if (!inventoryTransactions) {
    return next(HTTPError(400, "Inventory transactions not found"));
  }
  
  req.inventoryTransactionsList = inventoryTransactions.map ( el => { return el.get({ plain: true }) } );

  next();
    
};

// Find a single Inventory Transaction with an id
exports.findOne =async (req, res,next) => {
  const id = req.params.id;
  var inventorytransaction = await InventoryTransaction.findByPk(id);
  if (!inventorytransaction) {
    return next(HTTPError(500, "Inventory transaction not found with id=" + id))
  }
  req.inventoryTransactionsList = inventorytransaction;
  next();
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.inventoryTransactionsList);
};