'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rack = sequelize.define("rack", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zoneId:{
      type: DataTypes.INTEGER,
      allowNull:false
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
            fields: ['name', 'zoneId']
        }
    ]
  }),

  Zone = sequelize.define("zone", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    siteId:{
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

  Rack.belongsTo(Zone, {foreignKey: 'zoneId',onDelete: 'CASCADE'});
  return Rack;
};