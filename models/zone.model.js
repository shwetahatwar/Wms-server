'use strict';
module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define("zone", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    siteId:{
      type: DataTypes.INTEGER,
      allowNull:false
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
  },{
     indexes: [
        {
            unique: true,
            fields: ['name', 'siteId']
        }
    ]
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

  Zone.belongsTo(Site, {foreignKey: 'siteId',onDelete: 'CASCADE'});
  return Zone;
};