const db = require("../models");
const PutawayTransaction = db.putawaytransactions;
const InventoryTransaction = db.inventorytransactions;

exports.createPutawayTransaction = async(materialInward,username)=> {

	var putawayTransactMaterial = materialInward.map(el => {
    return {
      transactionTimestamp: Date.now(),
        performedBy: username,
        materialInwardId:el["id"],
        currentLocationId :null, 
        createdBy:username,
        updatedBy:username 
    }
  });

  var putawayTransactionsList = await PutawayTransaction.bulkCreate(putawayTransactMaterial);
  putawayTransactionsList = putawayTransactionsList.map(el => { return el.get({ plain: true }) } );
  console.log(putawayTransactionsList);
  return putawayTransactionsList;
}

exports.createInventoryTransaction = async(materialInward,username)=> {

	var TransactMaterial = materialInward.map(el => {
    return {
      transactionTimestamp: Date.now(),
      performedBy:username,
      transactionType:"Inward",
      materialInwardId:el["id"],
      batchNumber: el["batchNumber"],
      createdBy:username,
      updatedBy:username 
    }
  });

  var transactionsList = await InventoryTransaction.bulkCreate(TransactMaterial);
  transactionsList = transactionsList.map ( el => { return el.get({ plain: true }) } );
 
  return transactionsList;
}