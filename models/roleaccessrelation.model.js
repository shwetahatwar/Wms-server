'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoleAccessRelation = sequelize.define("roleaccessrelation", {
    roleId:{
      type: DataTypes.INTEGER,
      references: {
          model: 'roles', 
          key: 'id',
       }
    },
    accessId:{
      type: DataTypes.INTEGER,
      references: {
          model: 'sites', 
          key: 'id',
       }
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

  Role = sequelize.define("role", {
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
    
  }),

  Access = sequelize.define("access", {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    httpMethod:{
      type:DataTypes.STRING,
      allowNull:false
    }    
  });

  RoleAccessRelation.belongsTo(Role, {foreignKey: 'roleId',onDelete: 'CASCADE'});
  RoleAccessRelation.belongsTo(Access, {foreignKey: 'accessId',onDelete: 'CASCADE'});
  return RoleAccessRelation;
};