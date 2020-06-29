const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const PartNumber = db.partnumbers;
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
    toSiteId:req.body.toSiteId,
    status:true,
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
    toSiteId: req.body.siteId,
    transferInUserId:req.body.userId,
    transactionType :"Transfer In",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  var responseId= 0;
  await StockTransit.findAll({
    where: { 
      materialInwardId : req.body.materialInwardId,
      toSiteId: req.body.siteId,
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
        transferInUserId:req.body.userId,
        status:false,
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
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  StockTransaction.findAll({ 
    where: req.query,
    include: [
    {model: MaterialInward,
    required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
    },
    {model: Site,
      as: 'fromSite'},
      {model: Site,
        as: 'toSite'},
        {model: User,
      as: 'transferOutUser'},
      {model: User,
        as: 'transferInUser'}],
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

// Find a Stock transfer Transaction date wise
exports.findAllDatewise = (req, res) => {
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

  StockTransaction.findAll({ 
    where: {
      createdAt: {
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
    {model: Site,
      as: 'fromSite'},
      {model: Site,
        as: 'toSite'},
        {model: User,
      as: 'transferOutUser'},
      {model: User,
        as: 'transferInUser'}],
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

exports.findBySearchQuery = async (req, res) => {
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
  var responseData = [];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null && 
    req.query.partNumber != undefined && req.query.partNumber != null){
        await StockTransaction.findAll({
          include: [
          {model: MaterialInward,
            where: {
              barcodeSerial: {
                  [Op.like]: '%'+req.query.barcodeSerial+'%'
                },
                siteId: {
          [Op.like]: checkString
        }
              },
              required:true
            },
          {model: Site,
            as: 'fromSite'},
            {model: Site,
              as: 'toSite'},
              {model: User,
                as: 'transferOutUser'},
                {model: User,
                  as: 'transferInUser'}],
        }).then(data => {
          if(data.length != 0){
            for(var a=0;a<data.length;a++){
              responseData.push(data[a]["dataValues"]);
            }
          }
        });

      let count = {
        'totalCount':responseData.length
      };
      let dataCount = [];
      let dataList = [];
      dataList.push(responseData);
      dataCount.push(count);
      dataList.push(dataCount);
      console.log("IN barcodeSerial & PartNumber Search");
      res.send(dataList);
  }
  else if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null){
    await MaterialInward.findAll({
      where: {
        barcodeSerial: {
          [Op.or]: {
            [Op.eq]: ''+req.query.barcodeSerial+'',
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          }
        },
        status : 1,
        siteId: {
          [Op.like]: checkString
        } 
      },
      offset:offset,
      limit:limit 
    }).then(async data => {
      for(var i=0;i<data.length;i++){
        await StockTransaction.findAll({
          where: {
            materialInwardId: data[i]["dataValues"]["id"]
          },
          include: [
          {model: MaterialInward},
          {model: Site,
            as: 'fromSite'},
            {model: Site,
              as: 'toSite'},
              {model: User,
                as: 'transferOutUser'},
                {model: User,
                  as: 'transferInUser'}],
        }).then(data => {
          if(data.length != 0){
            if(data.length != 0){
              for(var a=0;a<data.length;a++){
                responseData.push(data[a]["dataValues"]);
              }
            }
          }
        });
      }
      let count = {
        'totalCount':responseData.length
      };
      let dataCount = [];
      let dataList = [];
      dataList.push(responseData);
      dataCount.push(count);
      dataList.push(dataCount);
      console.log("IN barcodeSerial Search");
      res.send(dataList);
    });
  }
  else if(req.query.partNumber != undefined && req.query.partNumber != null){
    await StockTransaction.findAll({
      include: [
      {model: MaterialInward,
        where: {
          partNumber: {
            [Op.like]: '%'+req.query.partNumber+'%'
          },
          siteId: {
          [Op.like]: checkString
        }
        },
        required:true
      },
      {model: Site,
        as: 'fromSite'},
        {model: Site,
          as: 'toSite'},
          {model: User,
            as: 'transferOutUser'},
            {model: User,
              as: 'transferInUser'}],
              offset:offset,
              limit:limit
            }).then(data => {
              if(data.length != 0){
                for(var a=0;a<data.length;a++){
                  responseData.push(data[a]["dataValues"]);
                }
              }
            });

            let count = {
              'totalCount':responseData.length
            };
            let dataCount = [];
            let dataList = [];
            dataList.push(responseData);
            dataCount.push(count);
            dataList.push(dataCount);
            console.log("IN part Search");
            res.send(dataList);
          }
};

