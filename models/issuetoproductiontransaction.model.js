'use strict';
module.exports = (sequelize, DataTypes) => {
  const IssueToProductionTransaction = sequelize.define("issuetoproductiontransaction", {
    transactionTimestamp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    performedBy:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    transactionType:{
      type: DataTypes.STRING,
      allowNull: false
    },
    remarks:{
      type: DataTypes.STRING,
      allowNull: true
    },
    materialInwardId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectId:{
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
      allowNull:true
    },
     siteId:{
      type: DataTypes.INTEGER,
      allowNull:true
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

  Project = sequelize.define("project",{
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
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

  MaterialInward = sequelize.define("materialinward", {
    partNumberId: {
      type: DataTypes.INTEGER,
    },
    shelfId: {
      type: DataTypes.INTEGER,
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
    QCRemarks:{
      type: DataTypes.STRING
    },
    materialStatus:{
      type: DataTypes.STRING,
      allowNull:false
    },
    siteId:{
      type: DataTypes.INTEGER,
    },
    createdBy:{
      type: DataTypes.STRING,
      allowNull:true
    },
    updatedBy:{
      type: DataTypes.STRING,
      allowNull:true
    }
        
  });


  IssueToProductionTransaction.belongsTo(MaterialInward, {foreignKey: 'materialInwardId',onDelete: 'CASCADE'})
  IssueToProductionTransaction.belongsTo(Project, {foreignKey: 'projectId',onDelete: 'CASCADE'});
  IssueToProductionTransaction.belongsTo(User, {as: 'doneBy',foreignKey: 'performedBy',onDelete: 'CASCADE'});
  
  return IssueToProductionTransaction;
};