'use strict';
module.exports = (sequelize, DataTypes) => {
  const Access = sequelize.define("access", {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    httpMethod:{
      type:DataTypes.STRING,
      allowNull:false
    }    
  });
  return Access;
};