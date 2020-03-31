'use strict';
module.exports = (sequelize, DataTypes) => {
  const StockTransaction = sequelize.define("stocktransaction", {
    transactionTimestamp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fromSiteId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'sites', 
        key: 'id',
      }
    },
    toSiteId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'sites', 
        key: 'id',
      }
    },
    transferOutUserId:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transferInUserId:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transactionType:{
      type: DataTypes.STRING,
      allowNull: false
    },
    materialInwardId:{
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

  User =  sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status:{
      type:DataTypes.BOOLEAN,
      allowNull:true
    },
    roleId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'roles', 
        key: 'id',
      }
    },
    siteId:{
      type: DataTypes.INTEGER,
      references: {
          model: 'sites', 
          key: 'id',
       }
    },
    employeeId:{
      type:DataTypes.STRING,
      allowNull:false,
      unique: true
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

  MaterialInward = sequelize.define("materialinward", {
    partNumberId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'partnumbers', 
        key: 'id',
      }
    },
    locationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'locations', 
        key: 'id',
      },
      allowNull:true,
    },
    barcodeSerial:{
      type: DataTypes.STRING,
      allowNull:false,
      unique: true
    },
    eachPackQuantity:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    invoiceReferenceNumber:{
      type: DataTypes.STRING,
      allowNull:true
    },
    batchNumber:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    inwardDate:{
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status:{
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    QCStatus:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    materialStatus:{
      type: DataTypes.STRING,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'sites', 
        key: 'id',
      }
    },
    createdBy:{
      type: DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type: DataTypes.STRING,
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

  StockTransaction.belongsTo(Site, {foreignKey: 'fromSiteId',onDelete: 'CASCADE'});
  StockTransaction.belongsTo(Site, {foreignKey: 'toSiteId',onDelete: 'CASCADE'});
  StockTransaction.belongsTo(User, {foreignKey: 'transferOutUserId',onDelete: 'CASCADE'});
  StockTransaction.belongsTo(User, {foreignKey: 'transferInUserId',onDelete: 'CASCADE'});
  StockTransaction.belongsTo(MaterialInward, {foreignKey: 'materialInwardId',onDelete: 'CASCADE'})
  return StockTransaction;
};