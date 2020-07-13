const db = require("../models");
const MaterialInward = db.materialinwards;
const PutawayTransaction = db.putawaytransactions;
const Shelf = db.shelfs;
const Op = db.Sequelize.Op;

//Create Putaway Transaction
exports.putawayTransaction = async (req,res,next) =>{
  if (!req.materialInwardBulkUpload) {
    return res.status(500).send("No Material Inwarded");
  }
  var { shelfId } = req.body;
  var putawayTransactMaterial = req.materialInwardBulkUpload.map(el => {
    return {
      transactionTimestamp: Date.now(),
        performedBy:req.user.username,
        materialInwardId:el["id"],
        currentLocationId :shelfId, 
        createdBy:req.user.username,
        updatedBy:req.user.username 
    }
  });

  var putawayTransactionsList = await PutawayTransaction.bulkCreate(putawayTransactMaterial);
  putawayTransactionsList = putawayTransactionsList.map ( el => { return el.get({ plain: true }) } );
  console.log(putawayTransactionsList);

  next();
}

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
  
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  PutawayTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward,
      required:true,
      where:{
        QCStatus:{
          [Op.ne]:2
        },
        status:1,
        siteId: {
          [Op.like]: checkString
        }
      }
    },
    {model: Shelf,
     as: 'prevLocation'},
     {model: Shelf,
     as: 'currentLocation'}],
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
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  console.log("queryString",queryString);
  PutawayTransaction.findAll({ 
    where: {
      transactionTimestamp: {
        [Op.gte]: parseInt(req.query.createdAtStart),
        [Op.lt]: parseInt(req.query.createdAtEnd),
      }
    },
    include: [
    {model: MaterialInward,
    required:true,
      where:{
        QCStatus:{
          [Op.ne]:2
        },
        status:1,
         siteId: {
          [Op.like]: checkString
        }
      }},
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
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  if(req.query.barcodeSerial == undefined){
    req.query.barcodeSerial = "";
  }
  let currentLocation = '';
  if(req.query.currentLocation){
    currentLocation = req.query.currentLocation;
  }
  if(req.query.currentLocation || req.query.barcodeSerial){
   console.log("In",req.body.currentLocation)
   await PutawayTransaction.findAll({
      include: [
      {
        model: MaterialInward,
        required: true,
        where:{
          barcodeSerial :
          {
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          },
           QCStatus:{
          [Op.ne]:2
        },
        siteId: {
          [Op.like]: checkString
        }
        },
      },
      {model: Shelf,
        as: 'prevLocation'},
        {model: Shelf,
          required:true,
           where: {
            name: {
              [Op.like]: '%'+currentLocation+'%'
            }
          },
          as: 'currentLocation'},
         ],
         offset:offset,
         limit:limit
        }).then(data => {
          console.log("Data",data)
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
         QCStatus:{
           [Op.ne]:2
         },
         siteId: {
          [Op.like]: checkString
        }

        },
      },
      {model: Shelf,
        as: 'prevLocation'},
        {model: Shelf,
           required:true,
           where: {
            name: {
              [Op.like]: '%'+currentLocation+'%'
            }
          },
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

// get count of all PutawayTransaction 
exports.countOfPutawayTransaction = (req, res) => {
  var total = 0;
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  PutawayTransaction.count({
    include: [
      {
       model: MaterialInward,
       required: true,       
       where:{
         siteId: {
          [Op.like]: checkString
        }

        },
      }]
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

