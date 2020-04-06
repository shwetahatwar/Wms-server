'use strict';
var bcrypt = require('bcrypt-nodejs');
var bbPromise = require('bluebird');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
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
      // references: {
      //     model: 'roles', 
      //     key: 'id',
      //  }
    },
     siteId:{
      type: DataTypes.INTEGER,
      // references: {
      //     model: 'sites', 
      //     key: 'id',
      //  }
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
  }, {
    hooks: {
      beforeUpdate: function(user) {
        return new bbPromise(function(resolve, reject) {
          bcrypt.genSalt(5, function(err, salt) {
            if (err) { reject(err); return; }

            bcrypt.hash(user.password, salt, null, function(err, hash) {
              if (err) { reject(err); return; }
              user.password = hash;
              resolve(user);
            });
          });
        });
      },
      beforeCreate: function(user) {
        return new bbPromise(function(resolve, reject) {
          bcrypt.genSalt(5, function(err, salt) {
            if (err) { reject(err); return; }

            bcrypt.hash(user.password, salt, null, function(err, hash) {
              if (err) { reject(err); return; }
              user.password = hash;
              resolve(user);
            });
          });
        });
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    scopes: {
      withPassword: {
        attributes: { },
      }
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

  User.belongsTo(Role, {foreignKey: 'roleId',onDelete: 'CASCADE'});
  User.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});

  User.associate = function(models) {
  };

  User.prototype.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  }

  return User;
};
