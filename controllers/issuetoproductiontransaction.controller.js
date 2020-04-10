const db = require("../models");
const MaterialInward = db.materialinwards;
const Project = db.projects;
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const User = db.users;

// Retrieve all Stock transfer Transaction from the database.
exports.findAll = (req, res) => {
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

  IssueToProductionTransaction.findAll({ 
    where: req.query,
    include: [
    {model: MaterialInward},
    {model: Project},
    {model: User,
      as: 'doneBy'},
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

// Find a single IssueToProductionTransaction with an id
exports.findOne = (req, res) => {
	const id = req.params.id;

	IssueToProductionTransaction.findByPk(id)
	.then(data => {
		res.send(data);
	})
	.catch(err => {
		res.status(500).send({
			message: "Error retrieving IssueToProductionTransaction with id=" + id
		});
	});
};

//Issue to Production API
exports.issueToProduction = async (req, res) => {
	for(var i=0; i < req.body.length; i++){
		var issueToProductionData = [];
		const stock = {
			transactionTimestamp: Date.now(),
			materialInwardId:req.body[i]["materialInwardId"],
			projectId: req.body[i]["projectId"],
			performedBy:req.body[i]["userId"],
			transactionType :"Issue To Production",
			createdBy:req.user.username,
			updatedBy:req.user.username
		};

		await IssueToProductionTransaction.create(stock)
		.then(async data => {
			issueToProductionData.push(data);
			let updateData = {
				'status':false
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
			createdBy:req.user.username,
			updatedBy:req.user.username
		};

		await IssueToProductionTransaction.create(stock)
		.then(async data => {
			returnFromProductionData.push(data);
			let updateData = {
				'status':true
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