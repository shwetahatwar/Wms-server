const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;


// Create all Stock transfer Transaction from the database.
exports.transferOut = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.materialInwardId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  
  var transferOutData = [];
  const stock = {
    transactionTimestamp: Date.now(),
    materialInwardId:req.body.materialInwardId,
    fromSiteId: req.body.siteId,
    transferOutUserId:req.body.userId,
    transactionType :"Transfer Out",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };
  
  await StockTransit.create(stock)
  .then(async data => {
    transferOutData.push(data);
    await StockTransaction.create(stock)
    .then(async data => {

    });
    var updateMaterial = {
      siteId : 1,
      materialStatus : "In Transit"
    };
    await MaterialInward.update(updateMaterial, {
      where: {
        id:req.body.materialInwardId
      }
    }).then(num => {
      if (num == 1) {

      } else {
        res.send({
          message: `Some error occurred while data updating!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Some error occurred while data updating"
      });
    });
    res.send(transferOutData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while stock transfering out"
    });
  });
};

exports.transferIn = async (req, res) => {
  console.log(req.body);
  if (!req.body.materialInwardId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  
  var transferOutData = [];
  const stock = {
    transactionTimestamp: Date.now(),
    materialInwardId:req.body.materialInwardId,
    toSiteId: req.body.locationId,
    transferInUserId:req.body.userId,
    transactionType :"Transfer In",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  var responseId= 0;
  await StockTransit.findAll({
    where: { 
      materialInwardId : req.body.materialInwardId,
      fromSiteId : 1,
    },
    limit:10,
    offset:0,
    order: [
    ['id', 'DESC'],
    ],
  })
  .then(async data => {
    console.log("Data On line 105",data);
    if(data[0] != null || data[0] != undefined){
      const stockTransitData = {
        toSiteId: req.body.siteId,
        transferInUserId:req.body.userId
      };
      await StockTransit.update(stockTransitData, {
        where: {
          id: data[0]["dataValues"]["id"]
        }
      }).then(num => {
        if (num == 1) {

        } else {
          res.send({
            message: `Some error occurred while data updating!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Some error occurred while data updating" 
        });
      });
    }
  }).catch(err=>{
    res.status(500).send({
      message:
      err.message || "Some error occurred while stock transfering out"
    });
  });
  
  await StockTransaction.create(stock)
  .then(async data => {
    transferOutData.push(data);
    var updateMaterial = {
      siteId : req.body.siteId,
      materialStatus : "Available"
    };
    await MaterialInward.update(updateMaterial, {
      where: {
        id: req.body.materialInwardId
      }
    }).then(num => {
      if (num == 1) {
        // res.send({
        //   message: "data was updated successfully."
        // });
      } else {
        res.send({
          message: `Some error occurred while data updating!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Some error occurred while data updating" 
      });
    });
    res.send(transferOutData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while stock transfering out"
    });
  });
};

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

  StockTransaction.findAll({ 
    where: req.query,
    include: [
    {model: MaterialInward},
    {model: Site},
    // {model: User},
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
      err.message || "Some error occurred while retrieving StockTransaction."
    });
  });
};

// Find a single Stock transfer Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  StockTransaction.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving StockTransaction with id=" + id
    });
  });
};

