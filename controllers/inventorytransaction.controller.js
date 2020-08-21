const db = require("../models");
const MaterialInward = db.materialinwards;
const InventoryTransaction = db.inventorytransactions;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

exports.materialInventoryTransactions=async (req, res,next) => {
  if (!req.materialInwardBulkUpload) {
    return res.status(500).send("No Material Inwarded");
  }
  var { batchNumber } = req.body;
  var TransactMaterial = req.materialInwardBulkUpload.map(el => {
    return {
      transactionTimestamp: Date.now(),
      performedBy:req.user.username,
      transactionType:"Inward",
      materialInwardId:el["id"],
      batchNumber: batchNumber,
      createdBy:req.user.username,
      updatedBy:req.user.username 
    }
  });

  var transactionsList = await InventoryTransaction.bulkCreate(TransactMaterial);
  transactionsList = transactionsList.map ( el => { return el.get({ plain: true }) } );
  
  next();
}


// Retrieve all Inventory Transaction from the database.
exports.findAll =async (req, res,next) => {
  // var materialinwardsWhereClause = {};
  materialinwardsWhereClause = new LikeQueryHelper()
  .clause(req.site, "siteId")
  .toJSON();

  var {transactionTimestamp,performedBy,transactionType,materialInwardId,batchNumber,offset,limit} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('performedBy', performedBy)
  .clause('materialInwardId', materialInwardId)
  .clause('batchNumber', batchNumber)
  .clause('transactionType', transactionType).toJSON();
  
  var inventoryTransactions;
  inventoryTransactions = await InventoryTransaction.findAll({ 
    where:whereClause,
    include: [{model: MaterialInward,
      required:true,
      where: materialinwardsWhereClause
    }],
    order: [
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });

  if (!inventoryTransactions) {
    return next(HTTPError(400, "Inventory transactions not found"));
  }
  
  req.inventoryTransactionsList = inventoryTransactions.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.inventoryTransactionsList;
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
  req.responseData = req.inventoryTransactionsList;
  next();
};