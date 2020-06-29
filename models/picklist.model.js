'use strict';
module.exports = (sequelize, DataTypes) => {
  const Picklist = sequelize.define("picklist", {
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
    siteId:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    updatedBy:{
      type:DataTypes.STRING,
      allowNull:true
    }
  });
  return Picklist;
};