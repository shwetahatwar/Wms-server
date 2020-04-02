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

   Location = sequelize.define("location", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    siteId:{
      type: DataTypes.INTEGER,
      references: {
          model: 'sites', 
          key: 'id',
       }
    },
    barcodeSerial: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    loadedCapacity: {
      type: DataTypes.FLOAT,
      allowNull: false
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
      references: {
        model: 'partnumbers', 
        key: 'id',
      }
    },
    locationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'locations', 
        key: 'id',
      },
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
    materialStatus:{
      type: DataTypes.STRING,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'sites', 
        key: 'id',
      }
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
  PutawayTransaction.belongsTo(Location, {foreignKey: 'prevLocationId',onDelete: 'CASCADE'});
  PutawayTransaction.belongsTo(Location, {foreignKey: 'currentLocationId',onDelete: 'CASCADE'});
  return PutawayTransaction;
};