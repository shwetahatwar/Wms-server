const db = require("../models");
const MaterialInward = db.materialinwards;
const Project = db.projects;
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const User = db.users;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const PicklistPickingMaterialList = db.picklistpickingmateriallists;
const issueToProdFunction = require('../functions/issueToProduction');
const materialInwardUpdateFunction = require('../functions/materialInwardUpdate');

// Retrieve all Issue To ProductionTransaction from the database.
exports.findAll =async (req, res,next) => {
  var { transactionTimestamp, performedBy, transactionType, quantity, remarks, materialInwardId, projectId, offset, limit } = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('performedBy', performedBy)
  .clause('materialInwardId', materialInwardId)
  .clause('quantity', quantity)
  .clause('projectId', projectId)
  .clause('remarks', remarks)
  .clause('transactionType', transactionType).toJSON();

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(req.site, "siteId")
  .toJSON();

  var issueToProductionTransactions;
  issueToProductionTransactions = await IssueToProductionTransaction.findAll({ 
    where:whereClause,
    include: [
    { 
      model: MaterialInward,
      required: true,
      where: materialInwardWhereClause,
    },
    {
      model: Project
    },
    {
      model: User,
      as: 'doneBy'
    },
    ],
    order: [
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });

  if (!issueToProductionTransactions) {
    return next(HTTPError(400, "Issue To Production transactions not found"));
  }

  req.issueToProductionTransactionsList = issueToProductionTransactions.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.issueToProductionTransactionsList;
  next();

};

// Find a single IssueToProductionTransaction with an id
exports.findOne = async (req, res,next) => {
	const id = req.params.id;
	var inventorytransaction = await IssueToProductionTransaction.findByPk(id);
	if (!inventorytransaction) {
		return next(HTTPError(500, "Issue To Production transaction not found with id=" + id))
	}
	req.issueToProductionTransactionsList = inventorytransaction;
	req.responseData = req.issueToProductionTransactionsList;
  next();
};

//Issue to Production API
exports.issueToProduction = async (req, res,next) => {

  var issueToProductionDataArray = req.body.map(el => {
    return {
      transactionTimestamp: Date.now(),
      materialInwardId: el["materialInwardId"],
      projectId: el["projectId"],
      performedBy: el["userId"],      
      quantity: el["quantity"],
      transactionType :"Issue To Production",
      createdBy:req.user.username,
      updatedBy:req.user.username
    }
  });

  var issueToProductionData = await IssueToProductionTransaction.bulkCreate(issueToProductionDataArray);

  if (!issueToProductionData) {
    return next(HTTPError(500, "Issue To Production transaction not Created"))
  }

  var issueToProductionUpdateArray = req.body.map(async el => {
    let updatePicklistMaterialData = {
      'isMaterialIssuedToProduction':true
    }

    var picklistMaterialUpdated = await PicklistPickingMaterialList.update(updatePicklistMaterialData,{
      where: {
        picklistId: el["picklistId"],
        serialNumber: el["barcodeSerial"]
      }
    });
  });

  if(req.body[0]["completedPicklistId"]){
    let updateData = {
      'isIssuedToProduction':true
    }
    var picklistUpdated = await Picklist.update(updateData,{
      where: {
        id: req.body[0]["completedPicklistId"]
      }
    });
  }

  req.issueToProductionData = issueToProductionData;
  req.responseData = issueToProductionData;
  next();
};

//Return from Production API
exports.returnFromProduction = async (req, res,next) => {
  var returnFromProductionData = [];
  var issueToProductionDataArray = req.body.map(async el => {
    const stock = {
      transactionTimestamp: Date.now(),
      materialInwardId:el["materialInwardId"],
      projectId: el["projectId"],
      performedBy:el["userId"],
      transactionType :"Return From Production",
      remarks:el["remarks"],
      quantity:el["quantity"],
      createdBy:req.user.username,
      updatedBy:req.user.username
    };
    let updateQuantity=0;
    var issuedData = await issueToProdFunction.getQuantityData(el["materialInwardId"],el["projectId"]);
    if(issuedData){
      updateQuantity = issuedData +parseInt(el["quantity"]);
    }

    var transactionData = await IssueToProductionTransaction.create(stock);
    returnFromProductionData.push(transactionData);
    let updateData = {
      'status':true,
      'eachPackQuantity':updateQuantity,
      'updatedBy':req.user.username
    }
    var updatedMaterialInward = await materialInwardUpdateFunction.updateMaterialInward(updateData,el["materialInwardId"]);
  });

  req.returnFromProductionData = returnFromProductionData;   
  next();
};

exports.findTransactionsBySearchQuery = async (req, res,next) => {
  var {createdAtStart,createdAtEnd,offset,limit,partNumber,barcodeSerial,transactionType,project} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;
  
  partNumber = (partNumber) ? partNumber:'';
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';
  transactionType = (transactionType) ? transactionType:'';
  project = (project) ? project:'';

  projectsWhereClause = new LikeQueryHelper()
  .clause(project, "name")
  .toJSON();

  var whereClause = {};
  if(createdAtStart && createdAtEnd){
    whereClause.transactionTimestamp = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(req.site, "siteId")
  .clause(partNumber, "partNumber")
  .clause(barcodeSerial, "barcodeSerial")
  .toJSON();

  if(transactionType){
    whereClause.transactionType ={
      [Op.like]: '%'+transactionType+'%'
    }
  }

  var issueToProductionTransactions = await IssueToProductionTransaction.findAll({
    where: whereClause,
    include: [{model: MaterialInward,
      required: true,
      where:materialInwardWhereClause
    },
    {model: Project,
      required: true,
      where:projectsWhereClause},
      {model: User,
        as: 'doneBy'},
        ],
        order: [
        ['id', 'DESC'],
        ],
        limit:limit,
        offset:offset
      });
  if (!issueToProductionTransactions[0]) {
    return next(HTTPError(400, "Issue To Production transactions not found"));
  }
  var responseData = [];
  responseData.push(issueToProductionTransactions);

  var total = await IssueToProductionTransaction.count({
    where: whereClause,
    include: [{model: MaterialInward,
      required: true,
      where:materialInwardWhereClause
    },
    {model: Project,
      required: true,
      where:projectsWhereClause}
      ]
    });

  let count = {
    'totalCount':total
  };
  let dataCount = [];
  dataCount.push(count);
  responseData.push(dataCount);
  req.responseData = responseData;
  next();
};
