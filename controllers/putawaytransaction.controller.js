const db = require("../models");
const MaterialInward = db.materialinwards;
const PutawayTransaction = db.putawaytransactions;
const Shelf = db.shelfs;
const Op = db.Sequelize.Op;

// Retrieve all Putaway Transaction from the database.
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

  PutawayTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward},
    {model: Shelf,
     as: 'prevLocation'},
     {model: Shelf,
     as: 'currentLocation'}],
    offset:offset,
    limit:limit 
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving PutawayTransaction."
      });
    });
};

// Find a single Putaway Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  PutawayTransaction.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving PutawayTransaction with id=" + id
      });
    });
};

//get Putaway Transaction by transaction date
exports.getByTransactionDate = (req, res) => {
  // console.log();
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.offset != null || req.query.offset != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  console.log("queryString",queryString);
  PutawayTransaction.findAll({ 
    where: {
      transactionTimestamp: {
        [Op.gte]: parseInt(req.query.createdAtStart),
        [Op.lt]: parseInt(req.query.createdAtEnd),
      }
    },
    include: [
    {model: MaterialInward},
    {model: Shelf,
     as: 'prevLocation'},
     {model: Shelf,
     as: 'currentLocation'}],
    order: [
            ['id', 'ASC'],
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
          err.message || "Some error occurred while retrieving PutawayTransaction data."
      });
    });
};

// get Putaway Transaction data by search query
exports.findPutawayTransactionBySearchQuery = async (req, res) => {
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
  if(req.query.barcodeSerial == undefined){
    req.query.barcodeSerial = "";
  }
  if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null && req.query.barcodeSerial != ""){
   await PutawayTransaction.findAll({
      include: [
      {
        model: MaterialInward,
        required: true,
        where:{
          barcodeSerial :
          {
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          }
        },
      },
      {model: Shelf,
        as: 'prevLocation'},
        {model: Shelf,
          as: 'currentLocation'},
         ],
         offset:offset,
         limit:limit
        }).then(data => {
          if(data.length != 0){
            responseData.push(data);
          }
        });
        let count = {
          'totalCount':responseData.length
        };
        let dataCount = [];
        dataCount.push(count);
        responseData.push(dataCount);
        res.send(responseData);
  }
  else if(req.query.partNumber != undefined && req.query.partNumber != null){
    await PutawayTransaction.findAll({
      include: [
      {
       model: MaterialInward,
       required: true,       
       where:{
          partNumber: {
              [Op.like]: '%'+req.query.partNumber+'%'
            },
        },
      },
      {model: Shelf,
        as: 'prevLocation'},
        {model: Shelf,
          as: 'currentLocation'},
          ],
          offset:offset,
          limit:limit
        }).then(data => {
          for(var a=0;a<data.length;a++){
            if(data.length != 0){
              responseData.push(data[a]["dataValues"]);
            }
          }
        }).catch(err => {
          console.log(err);
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
      console.log("IN part Search");
      res.send(dataList);
  };

// get count of all PutawayTransaction 
exports.countOfPutawayTransaction = (req, res) => {
  var total = 0
  PutawayTransaction.count({
  })
  .then(data => {
    total = data;
    var totalCount = {
      totalProjects : total 
    }
     res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PutawayTransaction count."
    });
  });
};

