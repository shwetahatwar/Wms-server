'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuditItems = sequelize.define('audititems', {
    auditId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'audits', 
        key: 'id',
      }
    },
    partNumber:{
      type:DataTypes.STRING,
      allowNull:false
    },
    serialNumber:{
      type:DataTypes.STRING,
      allowNull:false
    },
    status:{
      type:DataTypes.BOOLEAN,
      allowNull:false
    },
    itemStatus:{
      type:DataTypes.STRING,
      allowNull:true
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

  Audit = sequelize.define("audit", {
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

  AuditItems.belongsTo(Audit, {foreignKey: 'auditId',onDelete: 'CASCADE'})

  return AuditItems;
};