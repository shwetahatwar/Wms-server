const db = require("../models");
const MaterialInward = db.materialinwards;
const Project = db.projects;
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const User = db.users;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

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

  var materialinwardsWhereClause = {};
  if(req.site){
    materialinwardsWhereClause.siteId = req.site;
  }
  else{
    materialinwardsWhereClause.siteId = {
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


// Retrieve all Issue To Production Transaction by date from the database.
exports.findByDate = (req, res) => {
	var queryString = req.query;
	var offset = 0;
	var limit = 100;

	if(req.query.offset != null || req.query.offset != undefined){
		offset = parseInt(req.query.offset)
	}
	if(req.query.limit != null || req.query.limit != undefined){
		limit = parseInt(req.query.limit)
	}
	delete queryString['offset'];
	delete queryString['limit'];

	console.log(offset);
	console.log(limit);
	let checkString = '%'+req.site+'%'
	if(req.site){
		checkString = req.site
	}
	IssueToProductionTransaction.findAll({ 
		where: {
			transactionTimestamp: {
				[Op.gte]: parseInt(req.query.createdAtStart),
				[Op.lt]: parseInt(req.query.createdAtEnd),
			}
		},
		include: [
		{model: MaterialInward,
			required:true,
			where: {
				siteId: {
					[Op.like]: checkString
				}
			},
		},
		{model: Project},
		{model: User,
			as: 'doneBy'},
			],
			order: [
			['id', 'DESC'],
			],
			offset:offset,
			limit:limit 
		})
	.then(data => {
		res.send(data);
	})
	.catch(err => {
		res.status(500).send({
			message:
			err.message || "Some error occurred while retrieving IssueToProductionTransaction."
		});
	});
};


exports.findTransactionsBySearchQuery = async (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  let checkString = '%'+req.site+'%'
  if(req.site){
  	checkString = req.site
  }
  var responseData = [];
  if(!req.query.partNumber){
    req.query.partNumber="";
  }
  if(!req.query.barcodeSerial){
    req.query.barcodeSerial="";
  }
  if(!req.query.transactionType){
    req.query.transactionType="";
  }
  await IssueToProductionTransaction.findAll({
    where: {
      transactionType:{
      	[Op.like]: '%'+req.query.transactionType+'%'
      }
    },
    include: [{model: MaterialInward,
      required: true,
      where:{
        partNumber: {
          [Op.like]: '%'+req.query.partNumber+'%'
        }, 
        barcodeSerial: {
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }, 
        siteId: {
          [Op.like]: checkString
        }
      }
    },
    {model: Project},
    {model: User,
      as: 'doneBy'},
     ],
     order: [
    ['id', 'DESC'],
    ]
  }).then(data => {
    
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PutawayTransaction count."
    });
  });
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.issueToProductionTransactionsList);
};