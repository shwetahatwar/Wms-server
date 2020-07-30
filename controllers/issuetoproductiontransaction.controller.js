const db = require("../models");
const MaterialInward = db.materialinwards;
const Project = db.projects;
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const User = db.users;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');
const PicklistPickingMaterialList = db.picklistpickingmateriallists;

// Retrieve all Issue To ProductionTransaction from the database.
exports.findAll =async (req, res,next) => {
  var { transactionTimestamp, performedBy, transactionType, quantity, remarks, materialInwardId, projectId, offset, limit } = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var whereClause = new WhereBuilder()
  .clause('transactionTimestamp', transactionTimestamp)
  .clause('performedBy', performedBy)
  .clause('materialInwardId', materialInwardId)
  .clause('quantity', quantity)
  .clause('projectId', projectId)
  .clause('remarks', remarks)
  .clause('transactionType', transactionType).toJSON();

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

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
    offset:newOffset,
    limit:newLimit 
  });

  if (!issueToProductionTransactions) {
    return next(HTTPError(400, "Issue To Production transactions not found"));
  }

  req.issueToProductionTransactionsList = issueToProductionTransactions.map ( el => { return el.get({ plain: true }) } );

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
  for(var i=0;i<req.body.length;i++){
    let updatePicklistMaterialData = {
      'isMaterialIssuedToProduction':true
    }
    var picklistMaterialUpdated = await PicklistPickingMaterialList.update(updatePicklistMaterialData,{
      where: {
        picklistId: req.body[i]["picklistId"],
        serialNumber: req.body[i]["barcodeSerial"]
      }
    });
  }
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
  res.send(issueToProductionData);
};

//Return from Production API
exports.returnFromProduction = async (req, res) => {
	for(var i=0; i < req.body.length; i++){
		var returnFromProductionData = [];
		const stock = {
			transactionTimestamp: Date.now(),
			materialInwardId:req.body[i]["materialInwardId"],
			projectId: req.body[i]["projectId"],
			performedBy:req.body[i]["userId"],
			transactionType :"Return From Production",
			remarks:req.body[i]["remarks"],
			quantity:req.body[i]["quantity"],
			createdBy:req.user.username,
			updatedBy:req.user.username
		};
		let updateQuantity=0;

    // how can we use modular code for this as this is in for loop
   //
   await IssueToProductionTransaction.findAll({
     where: {
       materialInwardId:req.body[i]["materialInwardId"],
       projectId: req.body[i]["projectId"]
     },
     include: [{
       model: MaterialInward
     }],
     order: [
     ['id', 'DESC'],
     ] 
   })
   .then(data => {
     updateQuantity = parseInt(data[0]["dataValues"]["materialinward"]["eachPackQuantity"])+parseInt(req.body[i]["quantity"]);
     console.log(updateQuantity);
   })
   .catch(err => {
     console.log(err.message)
   });
   await IssueToProductionTransaction.create(stock)
   .then(async data => {
     returnFromProductionData.push(data);
     let updateData = {
       'status':true,
       'eachPackQuantity':updateQuantity,
       'updatedBy':req.user.username
     }
     await  MaterialInward.update(updateData, {
       where: {
         id: req.body[i]["materialInwardId"]
       }
     }).then(num => {
       if (num == 1) {

       } else {
         res.send({
           message: `Some error occurred while updating MaterialInward!`
         });
       }
     })
     .catch(err => {
       res.status(500).send({
         message: "Some error occurred while updating MaterialInward"
       });
     })

   })
   .catch(err => {
     res.status(500).send({
       message: "Some error occurred while creating issueToProduction"
     });
   });
 }
 res.send(returnFromProductionData);
};

exports.findTransactionsBySearchQuery = async (req, res,next) => {
  var {createdAtStart,createdAtEnd,offset,limit,partNumber,barcodeSerial,transactionType} = req.query;

  var newOffset = 0;
  var newLimit = 100;

  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  else{
    materialInwardWhereClause.siteId = {
      [Op.like]:'%'+req.site+'%'
    };
  }

  if(!partNumber){
    partNumber="";
  }
  if(!barcodeSerial){
    barcodeSerial="";
  }
  if(!transactionType){
    transactionType="";
  }

  var whereClause = {};
  if(createdAtStart && createdAtEnd){
    whereClause.transactionTimestamp = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  if(partNumber){
    materialInwardWhereClause.partNumber = {
      [Op.like]:'%'+partNumber+'%'
    };
  }

  if(barcodeSerial){
    materialInwardWhereClause.barcodeSerial = {
      [Op.like]:'%'+barcodeSerial+'%'
    };
  }

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
    {model: Project},
    {model: User,
      as: 'doneBy'},
      ],
      order: [
      ['id', 'DESC'],
      ],
      offset:newOffset,
      limit:newLimit
    });

  if (!issueToProductionTransactions) {
    return next(HTTPError(400, "Issue To Production transactions not found"));
  }

  req.issueToProductionTransactionsList = issueToProductionTransactions.map ( el => { return el.get({ plain: true }) } );

  next();
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.issueToProductionTransactionsList);
};