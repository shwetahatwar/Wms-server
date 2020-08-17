'use strict';
module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define("audit", {
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    start:{
      type:DataTypes.BIGINT,
      allowNull:true
    },
    end:{
      type:DataTypes.BIGINT,
      allowNull:true
    },
    status:{
      type:DataTypes.BOOLEAN,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    auditStatus:{
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
  return Audit;
};