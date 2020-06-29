'use strict';
module.exports = (sequelize, DataTypes) => {
  const PicklistMaterialList = sequelize.define("picklistmateriallist", {
    picklistId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batchNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    location:{
      type: DataTypes.STRING,
    },
    numberOfPacks:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    partNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    partDescription:{
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
    siteId:{
      type: DataTypes.INTEGER,
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

  PicklistMaterialList.belongsTo(Picklist, {foreignKey: 'picklistId',onDelete: 'CASCADE'})
  return PicklistMaterialList;
};