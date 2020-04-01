'use strict';
module.exports = (sequelize, DataTypes) => {
  const PicklistPickerRelation = sequelize.define("picklistpickerrelation", {
    picklistId: {
      type: DataTypes.INTEGER,
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
  PicklistPickerRelation.belongsTo(Picklist, {foreignKey: 'picklistId',onDelete: 'CASCADE'})
  return PicklistPickerRelation;
};