'use strict';
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define("location", {
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

  Location.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});
  return Location;
};