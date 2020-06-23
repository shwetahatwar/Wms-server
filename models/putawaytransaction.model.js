'use strict';
module.exports = (sequelize, DataTypes) => {
  const PutawayTransaction = sequelize.define("putawaytransaction", {
    transactionTimestamp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    performedBy:{
      type:DataTypes.STRING,
      allowNull:true
    },
    materialInwardId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
     prevLocationId:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
     currentLocationId:{
      type: DataTypes.INTEGER,
      // allowNull: false
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

   Shelf = sequelize.define("shelf", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    rackId:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    barcodeSerial:{
      type: DataTypes.STRING,
      allowNull:false,
      unique: true
    },
    capacity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    loadedCapacity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
     volume: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    loadedVolume: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    status:{
      type:DataTypes.BOOLEAN,
      allowNull:false
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

  PutawayTransaction.belongsTo(MaterialInward, {foreignKey: 'materialInwardId',onDelete: 'CASCADE'});
  PutawayTransaction.belongsTo(Shelf, {as: 'prevLocation',foreignKey: 'prevLocationId',onDelete: 'CASCADE'});
  PutawayTransaction.belongsTo(Shelf, {as: 'currentLocation',foreignKey: 'currentLocationId',onDelete: 'CASCADE'});
  return PutawayTransaction;
};