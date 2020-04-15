'use strict';
module.exports = (sequelize, DataTypes) => {
  const MaterialInward = sequelize.define("materialinward", {
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
    materialStatus:{
      type: DataTypes.STRING,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
      // references: {
      //   model: 'sites', 
      //   key: 'id',
      // }
    },
    createdBy:{
      type: DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type: DataTypes.STRING,
      allowNull:true
    }
    
  }),

  PartNumber = sequelize.define("partnumber", {
   partNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    UOM: {
      type: DataTypes.STRING,
      allowNull: false
    },
    netWeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    netVolume: {
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

  Site = sequelize.define("site", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    
  });

  MaterialInward.belongsTo(PartNumber, {foreignKey: 'partNumberId',onDelete: 'CASCADE'});
  MaterialInward.belongsTo(Shelf, {foreignKey: 'shelfId',onDelete: 'CASCADE'});
  MaterialInward.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});
  return MaterialInward;
};