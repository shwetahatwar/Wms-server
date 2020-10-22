const db = require("../models");
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const Sequelize = require("sequelize");
const Op = db.Sequelize.Op;
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');

exports.getQuantityData = async(materialId,projectId)=> {
  var issuedData =  await IssueToProductionTransaction.findAll({
    where: {
      materialInwardId:materialId,
      projectId: projectId
    },
    include: [{
      model: MaterialInward
    }],
    order: [
    ['id', 'DESC'],
    ] 
  });

  let updateQuantity = 0;
  if(issuedData){
    updateQuantity = parseInt(issuedData[0]["dataValues"]["materialinward"]["eachPackQuantity"]);   
  }

  return updateQuantity;
}
