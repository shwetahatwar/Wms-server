const db = require("../models");
const QCTransaction = db.qctransactions;
const MaterialInward = db.materialinwards;
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;

//Get All QC transactions
exports.getAll = (req,res) =>{
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

  QCTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      }}],
      offset:offset,
      limit:limit 
    })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving ScrapandRecover."
    });
  });
};

// Find a single QC Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  InventoryTransaction.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving InventoryTransaction with id=" + id
    });
  });
};

exports.findQCTransactionsBySearchQuery = async (req, res) => {
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
  if(!req.query.partNumber){
    req.query.partNumber="";
  }
  if(!req.query.barcodeSerial){
    req.query.barcodeSerial="";
  }
  console.log("QC status 67",req.query.QcStatus)
  await QCTransaction.findAll({
    where: {
      currentQCStatus:req.query.QcStatus
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
    }],
  }).then(data => {
    if(data.length != 0){
      responseData.push(data);
    }
    let count = {
      'totalCount':responseData.length
    };
    let dataCount = [];
    dataCount.push(count);
    responseData.push(dataCount);
    res.send(responseData);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PutawayTransaction count."
    });
  });
  // if(req.query.partNumber != undefined && req.query.partNumber != null){
  //  await MaterialInward.findAll({
  //     where: {
  //       partNumber: {
  //         [Op.or]: {
  //           [Op.eq]: ''+req.query.partNumber+'',
  //           [Op.iLike]: '%'+req.query.partNumber+'%'
  //         }
  //       },
  //       status : true, 
  //     }
  //   }).then(async data => {
  //     for(var i=0;i<data.length;i++){
  //       await QCTransaction.findAll({
  //         where: {
  //           materialInwardId: data[i]["dataValues"]["id"],
  //           currentQCStatus:req.query.QcStatus
  //         },
  //         include: [{model: MaterialInward}],
  //       }).then(data => {
  //         if(data.length != 0){
  //           responseData.push(data);
  //         }
  //       });
  //     }
  //     let count = {
  //       'totalCount':responseData.length
  //     };
  //     let dataCount = [];
  //     dataCount.push(count);
  //     responseData.push(dataCount);
  //     res.send(responseData);
  //   });
  // }
  //  else if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null){
  //  await MaterialInward.findAll({
  //     where: {
  //       barcodeSerial: {
  //         [Op.or]: {
  //           [Op.eq]: ''+req.query.barcodeSerial+'',
  //           [Op.iLike]: '%'+req.query.barcodeSerial+'%'
  //         }
  //       },
  //       status : true 
  //     }
  //   }).then(async data => {
  //     for(var i=0;i<data.length;i++){
  //       await QCTransaction.findAll({
  //         where: {
  //           materialInwardId: data[i]["dataValues"]["id"],
  //           currentQCStatus:req.query.QcStatus
  //         },
  //         include: [{model: MaterialInward}],
  //       }).then(data => {
  //         if(data.length != 0){
  //           responseData.push(data);
  //         }
  //       });
  //     }
  //     let count = {
  //       'totalCount':responseData.length
  //     };
  //     let dataCount = [];
  //     dataCount.push(count);
  //     responseData.push(dataCount);
  //     res.send(responseData);
  //   });
  // }
  // else{
  //   var partNumberId;
  //       await QCTransaction.findAll({
  //         where:{
  //           currentQCStatus:req.query.QcStatus
  //         },
  //         include: [{model: MaterialInward,
  //           required:true,
  //           where: {
  //             partNumber: {
  //                 [Op.iLike]: '%'+req.query.partNumber+'%'
  //               }
  //             },
  //         }],
  //         offset:offset,
  //         limit:limit 
  //       }).then(data => {
  //         for(var a=0;a<data.length;a++){
  //           if(data.length != 0){
  //             responseData.push(data[a]["dataValues"]);
  //           }
  //         }
  //       });
  //     let count = {
  //       'totalCount':responseData.length
  //     };
  //     let dataCount = [];
  //     let dataList = [];
  //     dataList.push(responseData);
  //     dataCount.push(count);
  //     dataList.push(dataCount);
  //     console.log("IN part Search");
  //     res.send(dataList);
  //     }
};