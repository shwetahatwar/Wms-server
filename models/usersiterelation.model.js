'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSiteRelation = sequelize.define("usersiterelation", {
    userId:{
      type: DataTypes.INTEGER,
      references: {
          model: 'users', 
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

  UserSiteRelation.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});
  UserSiteRelation.belongsTo(User, {foreignKey: 'userId',onDelete: 'CASCADE'});
  return UserSiteRelation;
};