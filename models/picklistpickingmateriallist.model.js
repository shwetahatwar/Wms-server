'use strict';
module.exports = (sequelize, DataTypes) => {
  const PicklistPickingMaterialList = sequelize.define("picklistpickingmateriallist", {
    picklistId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    partNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    batchNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    serialNumber:{
      type: DataTypes.STRING,
      allowNull: false
    },
    userId:{
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
    createdBy:{
      type:DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type:DataTypes.STRING,
      allowNull:true
    }
  });

  PicklistPickingMaterialList.belongsTo(Picklist, {foreignKey: 'picklistId',onDelete: 'CASCADE'})
  return PicklistPickingMaterialList;
};