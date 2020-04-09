'use strict';
module.exports = (sequelize, DataTypes) => {
  const StockTransit = sequelize.define("stocktransit", {
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
      references: {
        model: 'users', 
        key: 'id',
      }
    },
    transferInUserId:{
      type: DataTypes.INTEGER,
      references: {
        model: 'users', 
        key: 'id',
      }
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

  User =  sequelize.define("user",{
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
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
   shelfId: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: 'locations', 
      //   key: 'id',
      // },
      allowNull:true,
    },
    barcodeSerial:{
      type: DataTypes.STRING,
      allowNull:false,
      unique: true
    },
    partNumber: {
      type: DataTypes.STRING,
      allowNull:false
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

  StockTransit.belongsTo(Site, {foreignKey: 'fromSiteId',onDelete: 'CASCADE'});
  StockTransit.belongsTo(Site, {foreignKey: 'toSiteId',onDelete: 'CASCADE'});
  StockTransit.belongsTo(User, {foreignKey: 'transferOutUserId',onDelete: 'CASCADE'});
  StockTransit.belongsTo(User, {foreignKey: 'transferInUserId',onDelete: 'CASCADE'});
  StockTransit.belongsTo(MaterialInward, {foreignKey: 'materialInwardId',onDelete: 'CASCADE'});
  return StockTransit;
};