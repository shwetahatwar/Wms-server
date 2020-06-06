'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shelf = sequelize.define("shelf", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    
  },
  {
    indexes: [
    {
      unique: true,
      fields: ['name', 'rackId']
    }
    ]
  }),

  Rack = sequelize.define("rack", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    zoneId:{
      type: DataTypes.INTEGER,
      allowNull:true
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

  Shelf.belongsTo(Rack, {foreignKey: 'rackId',onDelete: 'CASCADE'});
  return Shelf;
};