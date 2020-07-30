'use strict';
module.exports = (sequelize, DataTypes) => {
  const FIFOViolationList = sequelize.define("fifoviolationlist", {
    picklistId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serialNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    violatedSerialNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    partNumber:{
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

  Picklist = sequelize.define("picklist", {
    picklistName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status:{
      type:DataTypes.BOOLEAN,
      allowNull:false
    },
    picklistStatus:{
      type:DataTypes.STRING,
      allowNull:false
    },
    isIssuedToProduction:{
      type:DataTypes.BOOLEAN,
      allowNull:false
    },
    createdBy:{
      type:DataTypes.STRING,
      allowNull:true
    },
    siteId:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    updatedBy:{
      type:DataTypes.STRING,
      allowNull:true
    }
  });

  FIFOViolationList.belongsTo(Picklist, {foreignKey: 'picklistId',onDelete: 'CASCADE'})
  return FIFOViolationList;
};