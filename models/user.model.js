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

  User.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});
  User.belongsTo(Role, {foreignKey: 'roleId',onDelete: 'CASCADE'});

  User.associate = function(models) {
  };

  User.comparePassword = function(reqpass, password) {
    return new bbPromise((resolve, reject) => {
      bcrypt.compare(reqpass, password, function(err, res) {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  };

  User.encryptPassword = function (password) {
    return new bbPromise(function(resolve, reject) {
      bcrypt.genSalt(5, function(err, salt) {
        if (err) { reject(err); return; }

        bcrypt.hash(password, salt, null, function(err, hash) {
          if (err) { reject(err); return; }
          password = hash;
          resolve(password);
        });
      });
    });
  }

  return User;
};
