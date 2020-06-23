'use strict';
module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define("inventorytransaction", {
    transactionTimestamp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    performedBy:{
      type:DataTypes.STRING,
      allowNull:true
    },
    transactionType:{
      type: DataTypes.STRING,
      allowNull: false
    },
    materialInwardId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    batchNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy:{
      type:DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type:DataTypes.STRING,
      allowNull:true
    }
    
  }),

  MaterialInward = sequelize.define("materialinward", {
    partNumberId: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: 'partnumbers', 
      //   key: 'id',
      // }
    },
    shelfId: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: 'locations', 
      //   key: 'id',
      // },
      allowNull:true,
    },
    barcodeSerial:{
      type: DataTypes.STRING,
      allowNull:false,
      unique: true
    },
    partNumber: {
      type: DataTypes.STRING,
      allowNull:false
    },
    eachPackQuantity:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    invoiceReferenceNumber:{
      type: DataTypes.STRING,
      allowNull:true
    },
    batchNumber:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    inwardDate:{
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status:{
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    QCStatus:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    QCRemarks:{
      type: DataTypes.STRING
    },
    materialStatus:{
      type: DataTypes.STRING,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
    },
    createdBy:{
      type: DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type: DataTypes.STRING,
      allowNull:true
    }
        
  });

  InventoryTransaction.belongsTo(MaterialInward, {foreignKey: 'materialInwardId',onDelete: 'CASCADE'})
  return InventoryTransaction;
};