const db = require("../models");
const MaterialInward = db.materialinwards;
const Op = db.Sequelize.Op;
const PartNumber = db.partnumbers;
const Shelf = db.shelfs;
const InventoryTransaction = db.inventorytransactions;
const PutawayTransaction = db.putawaytransactions;
const QCTransaction = db.qctransactions;
const StockTransaction = db.stocktransactions;
const Sequelize = require("sequelize");
const Picklist = db.picklists;
const IssueToProductionTransaction = db.issuetoproductiontransactions;
const serialNumberHelper = require('../helpers/serialNumberHelper');
const serialNumberFinder = require('../functions/serialNumberFinder');
const createTransaction = require('../functions/materialTransaction');
var HTTPError = require('http-errors');

exports.materialInwardBulkUpload = async (req, res, next) => {

  // if (!req.materialInward) {
  //   return res.status(500).send("No Material");
  // }
  var serialNumberId = null;
  if(req.materialInward) {
    serialNumberId = req.materialInward["barcodeSerial"]
  }
  var materialInward = await serialNumberHelper.getSerialNumbers(req.body,req.partNumber["partNumber"],req.materialInward,req.user.username,serialNumberId);
  console.log("materialInwardConsole", materialInward);
  materialInward = await MaterialInward.bulkCreate(materialInward["materialInward"]);
  req.materialInwardBulkUpload = materialInward.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.materialInwardBulkUpload;
  next();
}

exports.bulkUpload = async (req,res,next)  =>{
  if (req.body.length == 0) {
    res.status(400).send({message: "Content can not be empty!"});
    return;
  }

  var partNumberArray = req.body;
  var dataArray = [];
  var serialNumberId;
  req.materialInwardBulkUploadResponse = [];
  var outputArray = await partNumberArray.map(async el => {
    if (el["matched"]) {
      
      var latestMaterial = await serialNumberFinder.getLatestSerialNumber();
      if (!serialNumberId) {
        serialNumberId = latestMaterial["barcodeSerial"]
      }
      materialInwardSerial = await serialNumberHelper.getSerialNumbers(el, el["partNumber"], latestMaterial, req.user.username, serialNumberId);
      
      serialNumberId = materialInwardSerial["serialNumberId"];
      var materialInward = await MaterialInward.bulkCreate(materialInwardSerial["materialInward"]);
      for(var j=0;j<materialInward.length;j++){
        req.materialInwardBulkUploadResponse.push(materialInward[j]["dataValues"])
      }

      // var putawayTransactionList = await createTransaction.createPutawayTransaction(materialInward,req.user.username);
      var inventoryTransactionList = await createTransaction.createInventoryTransaction(materialInward,req.user.username);

    }
  });
  if (!req.materialInwardBulkUploadResponse) {
    return next(HTTPError(400, "Material not inwarded"));
  }

  console.log("materialInwardBulkUploadResponse 67",req.materialInwardBulkUploadResponse)
  req.responseData = req.materialInwardBulkUploadResponse;
  next();
}

//   for(var a=0;a<req.body.length;a++){
//     const partNumbersId = req.body[a]["partNumberId"];
//     var materialInwardIds;  
//     if(req.body[a]["matched"]){
//       for(var i=0; i < req.body[a]["noOfPacks"]; i++){
//         console.log(req.body[a]["noOfPacks"]);
//         var serialNumberId;
//         await MaterialInward.findAll({
//           limit:1,
//           offset:0,
//           order: [
//           ['id', 'DESC'],
//           ],
//         })
//         .then(data => {
//           if(data[0] != null || data[0] != undefined){
//             serialNumberId = data[0]["dataValues"]["barcodeSerial"];
//             serialNumberId = (parseInt(serialNumberId) + 1).toString();
//             serialNumberId = '' + serialNumberId;
//             if(serialNumberId.toString().length > 10){
//               serialNumberId = serialNumberId.substring(1);
//             }
//           }
//           else{
//             serialNumberId ="1111111111";
//           }
//         })
//         .catch(err=>{
//           serialNumberId ="1111111111";
//         });
//         if(!req.body.siteId){
//           if(req.site){
//             req.body.siteId = req.site
//           }
//           else{
//             req.body.siteId = req.siteId
//           }
//         }
//         const materialinward = {
//           partNumberId: req.body[a]["partNumberId"],
//           batchNumber: req.body[a]["batchNumber"],
//           barcodeSerial: serialNumberId,
//           partNumber:req.body[a]["partNumber"],
//           eachPackQuantity: req.body[a]["eachPackQuantity"],
//           invoiceReferenceNumber: req.body[a]["invoice"],
//           inwardDate: Date.now(),
//           QCStatus: 0,
//           status:1,        
//           QCRemarks: "NA",
//           siteId : req.body.siteId,
//           materialStatus : "NA",
//           createdBy:req.user.username,
//           updatedBy:req.user.username
//         };

//     // Save MaterialInward in the database
//     await MaterialInward.create(materialinward)
//     .then(async data => {
//       dataArray.push(data);
//       materialInwardIds = data["id"];
//       const putwayTransaction = {
//         transactionTimestamp: Date.now(),
//         performedBy:req.user.username,
//         materialInwardId:materialInwardIds,
//         currentLocationId :req.body[a]["shelfId"], 
//         createdBy:req.user.username,
//         updatedBy:req.user.username
//       }
//       await PutawayTransaction.create(putwayTransaction)
//       .then(data => {
//       })
//       .catch(err => {
//         console.log(err);
//       });

//     // MaterialInward transaction entry in the database
//     const inventoryTransact = {
//       transactionTimestamp: Date.now(),
//       performedBy:req.user.username,
//       transactionType:"Inward",
//       materialInwardId:materialInwardIds,
//       batchNumber: req.body[a]["batchNumber"],
//       createdBy:req.user.username,
//       updatedBy:req.user.username
//     }
//     await InventoryTransaction.create(inventoryTransact)
//     .then(data => {
//       console.log("data on line 94");
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   }).catch(err => {
//     res.status(500).send({
//       message:
//       err.message || "Some error occurred while creating the MaterialInward."
//     });
//   });
// }
// }
// // }
// res.send(dataArray);

// };

// Retrieve all Inventory Transaction from the database.
exports.findAll =async (req, res,next) => {
  if(req.site){
    req.query.siteId = req.site;
  }

  var {partNumberId,shelfId,barcodeSerial,partNumber,status,QCStatus,QCRemarks,
    materialStatus,
    siteId,offset,limit} = req.query;

    limit = (limit) ? parseInt(limit) : 100;
    offset = (offset) ? parseInt(offset) : 0;

    var whereClause = new WhereBuilder()
    .clause('partNumberId', partNumberId)
    .clause('shelfId', shelfId)
    .clause('barcodeSerial', barcodeSerial)
    .clause('partNumber', partNumber)
    .clause('QCStatus', QCStatus)
    .clause('status', status)
    .clause('QCRemarks', QCRemarks)
    .clause('siteId', siteId)
    .clause('materialStatus', materialStatus).toJSON();

    var materialinwards;
    materialinwards = await MaterialInward.findAll({ 
      where:whereClause,
      include: [{
        model: PartNumber
      },
      {
        model: Shelf
      }],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit 
    });

    if (!materialinwards) {
      return next(HTTPError(400, "Material Inwards not found"));
    }

    req.materialInwardsList = materialinwards.map ( el => { return el.get({ plain: true }) } );
    req.responseData = req.materialInwardsList;
    next();
    
  };

// Find a single Inventory Transaction with an id
exports.findOne =async (req, res,next) => {
  const id = req.params.id;
  var materialinward = await MaterialInward.findByPk(id);
  if (!materialinward) {
    return next(HTTPError(500, "Material Inward not found with id=" + id))
  }
  req.materialInwardsList = materialinward;
  req.responseData = req.materialInwardsList;
  next();
};

// Update a MaterialInward by the id in the request
exports.update = async (req, res,next) => {
  const id = req.params.id;

  var {partNumberId,shelfId,barcodeSerial,partNumber,eachPackQuantity,status,QCStatus,QCRemarks,
    materialStatus,
    siteId} = req.body;

    var updateData = new WhereBuilder()
    .clause('partNumberId', partNumberId)
    .clause('shelfId', shelfId)
    .clause('barcodeSerial', barcodeSerial)
    .clause('partNumber', partNumber)
    .clause('QCStatus', QCStatus)
    .clause('status', status)
    .clause('QCRemarks', QCRemarks)
    .clause('siteId', siteId)
    .clause('eachPackQuantity', eachPackQuantity)
    .clause('materialStatus', materialStatus).toJSON();

    var updatedMaterialInward;
    try {
      updatedMaterialInward = await MaterialInward.update(updateData,{
        where: {
          id: id
        }
      });
      console.log("updatedMaterialInward",updatedMaterialInward)
      if (!updatedMaterialInward) {
        return next(HTTPError(500, "Material Inward not updated"))
      }
    }catch (err) {
      if(err["errors"]){
        return next(HTTPError(500,err["errors"][0]["message"]))
      }
      else{
        return next(HTTPError(500,"Internal error has occurred, while updating the Site."))
      }
    }

    req.updatedMaterialInward = updatedMaterialInward;
    next();
  };

  exports.sendCreateResponse = async (req, res, next) => {
    res.status(200).send({message: "success"});
  };

//Update QC status & transaction of the same *currently not in use
exports.updateQcStatus = (req, res) => {
  console.log(req.body);
  MaterialInward.update(req.body, {
    where: { id: req.params.id }
  })
  .then(num => {
    if (num == 1) {
      const statusChange = {
        transactionTimestamp :Date.now(), 
        materialInwardId: req.params.id,
        prevQCStatus:req.body.prevQCStatus,
        currentQCStatus:req.body.currentQCStatus,
        performedBy:req.user.username,
        createdBy:req.user.username,
        updatedBy:req.user.username,
      };
        // Save Transaction of QC in the database
        QCTransaction.create(statusChange)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
            err.message || "Some error occurred while creating the QCTransaction."
          });
        });
      } 
      else {
        res.send({
          message: `Cannot update QC Status with id=${req.body.id}. Maybe Material was not found or req.body is empty!`
        });
      }
    })
  .catch(err => {
    res.status(500).send({
      message: "Error updating QC status with id=" + req.body.id
    });
  });
}; 


exports.getCountByPending = async (req, res,next) => {
  var countTable=[];
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  materialInwardWhereClause.status=true;
  materialInwardWhereClause.materialStatus="NA"
  
  var totalData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!totalData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  let singleData = {
    'total': totalData
  };
  countTable.push(singleData);

  materialInwardWhereClause.QCStatus =1;
  var qcOkData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcOkData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'ok':qcOkData
  };
  countTable.push(singleData);
  
  materialInwardWhereClause.QCStatus =0;
  var qcPendingData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcPendingData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'pending':qcPendingData
  };
  countTable.push(singleData);

  materialInwardWhereClause.QCStatus =2;
  var qcRejectedData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcRejectedData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'rejected':qcRejectedData
  };
  countTable.push(singleData);

  req.responseData =countTable;
  next();
};

// get count by QC
exports.countByQcStatus = async (req, res,next) => {
  var countTable=[];
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  materialInwardWhereClause.status=true;
  var total = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!totalData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  let singleData = {
    'total':total
  };
  countTable.push(singleData);

  materialInwardWhereClause.QCStatus=1;  
  var okData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcOkData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'ok':okData
  };
  countTable.push(singleData);

  materialInwardWhereClause.QCStatus=0;    
  var pendingData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcPendingData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'pending':pendingData
  };
  countTable.push(singleData);
  
  materialInwardWhereClause.QCStatus=2;
  var rejectedData = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!qcRejectedData) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  singleData = {
    'rejected':rejectedData
  };
  countTable.push(singleData);
  req.responseData = countTable;
  next();
};

//Get count
exports.countByQcStatusHHT = async (req, res,next) => {
  var countTable=[];
  var total = 0;
  var ok = 0;
  var pending = 0;
  var rejected = 0;

  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  materialInwardWhereClause.status=true;

  total = await MaterialInward.count({
    where:materialInwardWhereClause
  });

  materialInwardWhereClause.QCStatus=1;  
  ok = await MaterialInward.count({
    where:materialInwardWhereClause
  });

  materialInwardWhereClause.QCStatus=0;    
  pending = await MaterialInward.count({
    where:materialInwardWhereClause
  });

  materialInwardWhereClause.QCStatus=2;
  rejected = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  if (!total) {
    return next(HTTPError(500, "Internal error has occurred, while retrieving count"));
  }
  let QCStatus = {
    "ok":ok,
    "pending":pending,
    "rejected":rejected,
    "total":total
  }
  res.status(200).send({
    QCStatus :QCStatus
  });
};

exports.findPendingMaterialInwardsBySearchQuery= async (req, res) => {
  var {offset , limit ,barcodeSerial , partNumber , description , QCStatus} = req.query
  
  partNumber = (partNumber) ? partNumber:'';
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';
  description = (description) ? description:'';

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(barcodeSerial, "barcodeSerial")
  .clause(partNumber, "partNumber")
  .toJSON();

  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  materialInwardWhereClause.status = true;

  partNumberWhereClause = new LikeQueryHelper()
  .clause(description, "description")
  .toJSON();

  if(QCStatus){
    materialInwardWhereClause.QCStatus = QCStatus
  }

  materialInwardWhereClause.materialStatus="NA";

  var data =await MaterialInward.findAll({ 
    where: materialInwardWhereClause,
    include: [{
      model: PartNumber,
      required:true,
      where: partNumberWhereClause,
    },
    {
      model: Shelf
    }],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });
  if (!data) {
    return next(HTTPError(500, "Searched data not found"));
  }
  var countArray =[];
  var responseData =[];
  responseData.push(data);
  var total = 0;
  total =  await MaterialInward.count({ 
    where: materialInwardWhereClause,
    include: [{
      model: PartNumber,
      required:true,
      where: partNumberWhereClause,
    },
    ]
  });

  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);

  req.responseData = responseData;
  next();
};

//get data by search query
exports.findMaterialInwardsBySearchQuery = async (req, res,next) => {
  var {offset , limit ,barcodeSerial , partNumber , QCStatus} = req.query
  
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';
  partNumber = (partNumber) ? partNumber:'';

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(barcodeSerial, "barcodeSerial")
  .clause(partNumber, "partNumber")
  .toJSON();

  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  materialInwardWhereClause.status = true;

  // if(barcodeSerial){
  //   materialInwardWhereClause.barcodeSerial = {
  //     [Op.like]:'%'+barcodeSerial+'%'
  //   };
  // }
  // if(partNumber){
  //   materialInwardWhereClause.partNumber = {
  //     [Op.like]:'%'+partNumber+'%'
  //   };
  // }
  
  if(!QCStatus){
    materialInwardWhereClause.QCStatus = {
      [Op.ne]:2
    };

    var data = await MaterialInward.findAll({ 
      where: materialInwardWhereClause,
      include: [{
        model: PartNumber
      },
      {
        model: Shelf
      }],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });
    if (!data) {
      return next(HTTPError(500, "Searched data not found"));
    }
    var countArray =[];
    var responseData =[];
    responseData.push(data);
    console.log("responseData",responseData);
    var total = 0;
    total = await MaterialInward.count({ 
      where: materialInwardWhereClause
    });

    var totalMaterials = {
      totalCount : total
    }
    countArray.push(totalMaterials);
    responseData.push(countArray);

    req.responseData = responseData;
    next();
  }
  else {
    materialInwardWhereClause.QCStatus = QCStatus;
    var data = await MaterialInward.findAll({ 
      where: materialInwardWhereClause,
      include: [{
        model: PartNumber
      },
      {
        model: Shelf
      }],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });
    if (!data) {
      return next(HTTPError(500, "Searched data not found"));
    }
    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    total = await MaterialInward.count({ 
      where: materialInwardWhereClause
    });

    var totalMaterials = {
      totalCount : total
    }
    countArray.push(totalMaterials);
    responseData.push(countArray);

    req.responseData = responseData;
    next();
  }
};

exports.findMaterialInwardsBySearchQueryStock = async (req, res,next) => {
  var {offset , limit ,barcodeSerial , partNumber , QCStatus} = req.query
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';
  partNumber = (partNumber) ? partNumber:'';

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(barcodeSerial, "barcodeSerial")
  .clause(partNumber, "partNumber")
  .toJSON();

  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  materialInwardWhereClause.status = true;
  materialInwardWhereClause.materialStatus = {
    [Op.or]: ["Available", "NA"]
  };

  if(req.query.QCStatus != "All"){
    materialInwardWhereClause.QCStatus = QCStatus;
    var data = await MaterialInward.findAll({ 
      where: materialInwardWhereClause,
      include: [{
        model: PartNumber
      },
      {
        model: Shelf
      }],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });
    if (!data) {
      return next(HTTPError(500, "Searched data not found"));
    }
    var countArray =[];
    var responseData =[];
    responseData.push(data);
    var total = 0;
    total = await MaterialInward.count({ 
      where: materialInwardWhereClause,
    });

    var totalMaterials = {
      totalCount : total
    }
    countArray.push(totalMaterials);
    responseData.push(countArray);

    req.responseData = responseData;
    next();
  }
  else{
    var data = await MaterialInward.findAll({ 
      where: materialInwardWhereClause,
      include: [{
        model: PartNumber
      },
      {
        model: Shelf
      }],
      order: [
      ['id', 'DESC'],
      ],
      offset:offset,
      limit:limit
    });

    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    total = await MaterialInward.count({ 
      where: materialInwardWhereClause,
    });

    var totalMaterials = {
      totalCount : total
    }
    countArray.push(totalMaterials);
    responseData.push(countArray);

    req.responseData = responseData;
    next();
  }
};

// Update a MaterialInward by the Barcode Serial in the request
exports.updateWithBarcode = async (req, res,next) => {
  var isMaterialInwardUpdated = 0;
  const barcodeSerial = req.params.barcodeSerial;
  var netWeightOfPacks;
  var materialInwardId;
  var locationIds;
  var eachPackQty;
  var data = await MaterialInward.findAll({
    where: { 
      barcodeSerial: barcodeSerial,
      QCStatus : {
        [Op.ne]:2
      }
    },
    include:{
      model: PartNumber
    },
  });
  if(!data[0]){
    return next(HTTPError(500, "Material not found with barcode serial= "+barcodeSerial))
  }
  isMaterialInwardUpdated=1;
  eachPackQty = data[0]["dataValues"]["eachPackQuantity"];
  materialInwardId = data[0]["dataValues"]["id"];
  locationIds = data[0]["dataValues"]["shelfId"];
  var partNumberData = await PartNumber.findAll({
    where: { 
      id: data[0]["dataValues"]["partNumberId"]
    }
  });
  netWeightOfPacks = partNumberData[0]["dataValues"]["netWeight"];
  netWeightOfPacks = netWeightOfPacks * eachPackQty;

  let totalCapacity;
  if(req.body.shelfId != null && req.body.shelfId != undefined){
    let prevCapacityOfLocation = 0;
    var locationData = await Shelf.findAll({
      where: {
        id : req.body.shelfId
      }
    });

    totalCapacity = locationData[0]["dataValues"]["capacity"];
    prevCapacityOfLocation = locationData[0]["dataValues"]["loadedCapacity"];

    let netWeightOfPacksInTons = netWeightOfPacks;
    netWeightOfPacksInTons = Math.round((netWeightOfPacksInTons + Number.EPSILON) * 100) / 100;
    let updateCapacity = prevCapacityOfLocation + netWeightOfPacksInTons;
    console.log("updateCapacity",updateCapacity,totalCapacity,netWeightOfPacksInTons);
    // if(updateCapacity <= totalCapacity){
      var updatedData = {
        'loadedCapacity': updateCapacity
      };
      var shelfData = await Shelf.update(updatedData, {
        where:{
          id:req.body.shelfId
        }
      });

      var updatedData = await MaterialInward.update(req.body, {
        where: req.params
      });

      if(updatedData){
        const putwayTransaction = {
          transactionTimestamp: Date.now(),
          performedBy:req.user.username,
          materialInwardId:materialInwardId,
          prevLocationId :locationIds,
          currentLocationId :req.body.shelfId, 
          createdBy:req.user.username,
          updatedBy:req.user.username
        }
        var putawayData = await PutawayTransaction.create(putwayTransaction);
      }
    }
    if(isMaterialInwardUpdated){
      res.status(200).send({message:"MaterialInward was updated successfully"})
    }
    else{
      res.status(500).send({message:"Internal server error occurred while updating material inward"})
    }

  };

//get inventory where count less than 10
exports.inventoryData = async (req, res,next) => {
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  materialInwardWhereClause.QCStatus = 1;
  materialInwardWhereClause.materialStatus = "Available";
  materialInwardWhereClause.status = true;

  var data = await MaterialInward.findAll({
    where: materialInwardWhereClause,
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
    [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber']
    }],
    having: Sequelize.where(Sequelize.literal('SUM(eachPackQuantity * 1)'), '<=', 10)
    // having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('partNumberId')), '<=', 10)
  });

  if(!data){
    return next(HTTPError(500, "Error occurred while retrieving inventory stock"));
  }

  req.responseData = data;
  next();
};


//get inventory Stock 
exports.inventoryStockData = async (req, res,next) => {
  var {offset , limit , partNumber , description } = req.query
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  partNumber = (partNumber) ? partNumber:'';
  description = (description) ? description:'';

  partNumberWhereClause = new LikeQueryHelper()
  .clause(partNumber, "partNumber")
  .clause(description, "description")
  .toJSON();

  materialInwardWhereClause.QCStatus = 1;
  materialInwardWhereClause.materialStatus = "Available";
  materialInwardWhereClause.status = true;

  if(partNumber || description){
    var data = await MaterialInward.findAll({
      where:materialInwardWhereClause,
      group: [ 'partNumberId' ],
      attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
      [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
      include: [{
        model: PartNumber,
        where:partNumberWhereClause,
        attributes: ['description','partNumber']
      }],
      limit:limit,
      offset:offset
    });
    if(!data){
      return next(HTTPError(500, "Inventory data not found"));
    }

    req.responseData = data;
    next();
  }
  else{
    var data =  await MaterialInward.findAll({
      where:materialInwardWhereClause,
      group: [ 'partNumberId' ],
      attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
      [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
      include: [{
        model: PartNumber,
        attributes: ['description','partNumber']
      }],
      limit:limit,
      offset:offset
    });

    if(!data){
      return next(HTTPError(500, "Inventory data not found"));
    }

    req.responseData = data;
    next();
  }
};

//get data by search query for transfer Out
exports.findMaterialInwardsForTransferOut = async (req, res,next) => {
  var {offset , limit ,barcodeSerial ,materialStatus , partNumber , QCStatus} = req.query
  partNumber = (partNumber) ? partNumber:'';
  barcodeSerial = (barcodeSerial) ? barcodeSerial:'';

  materialInwardWhereClause = new LikeQueryHelper()
  .clause(barcodeSerial, "barcodeSerial")
  .clause(partNumber, "partNumber")
  .toJSON();

  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;
  materialInwardWhereClause.status = true;
  
  if(QCStatus){
    materialInwardWhereClause.QCStatus = QCStatus
  }
  if(materialStatus){
    materialInwardWhereClause.materialStatus = materialStatus
  }
  var data = await MaterialInward.findAll({ 
    where: materialInwardWhereClause,
    include: [{
      model: PartNumber
    },
    {
      model: Shelf
    }],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });
  if(!data){
    return next(HTTPError(500, "Searhed data not found"));
  }
  var countArray =[];
  var responseData =[];
  responseData.push(data);
  var total = 0;
  total = await MaterialInward.count({ 
    where: materialInwardWhereClause,
  });
  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);

  req.responseData =responseData;
  next();

};

exports.inventoryDataCount = async (req, res,next) => {
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  materialInwardWhereClause.QCStatus = 1;
  materialInwardWhereClause.materialStatus = "Available";
  materialInwardWhereClause.status = true;

  var data = await MaterialInward.findAll({
    where:materialInwardWhereClause,
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber']
    }],
    having: Sequelize.where(Sequelize.literal('SUM(eachPackQuantity * 1)'), '<=', 10)
  });
  if(!data){
    return next(HTTPError(500, "Error while retrieving inventory"));
  }
  let count = data.length;
  res.status(200).send({
    dataCount :count
  });

};

//get dashboard count for displaying pending for putaway & total inventory
exports.dashboardCountForPendingPutaway = async (req,res,next) =>{
  let responseData = [];
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  materialInwardWhereClause.QCStatus = 1;
  materialInwardWhereClause.materialStatus = "Available";
  materialInwardWhereClause.status = true;

  var data = await MaterialInward.findAll({
    where:materialInwardWhereClause,
    attributes: [[Sequelize.fn('sum', Sequelize.col('eachPackQuantity')), 'count']],
  });
  if(!data){
    return next(HTTPError(500, "Error while retrieving inventory"));
  }
  count = parseInt(data[0]["dataValues"]["count"]);

  materialInwardWhereClause.materialStatus = "NA";
  var dataCount = 0;
  dataCount = await MaterialInward.count({
    where:materialInwardWhereClause
  });
  
  var totalData = 0;
  var totalWhereClause={};
  totalWhereClause.status=true;
  totalWhereClause.QCStatus=1;
  if(req.site){
    totalWhereClause.siteId = req.site;
  }
  totalData = await MaterialInward.count({
    where:totalWhereClause
  });

  responseData ={
    'pendingForPutaway':dataCount,
    'totalInventory':count,
    'totalData':totalData
  };
  req.responseData = responseData;
  next();
};


// get Recent updated Material List
exports.findRecentTransactions = async (req, res,next) => {
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  
  var {siteId,offset,limit} = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;
  
  var data = await MaterialInward.findAll({ 
    where: materialInwardWhereClause,
    include: [{
      model: PartNumber
    },
    {
      model: Shelf
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });
  if(!data){
    return next(HTTPError(500, "Error while retrieving recent transaction"));
  }
  req.responseData = data;
  next();
};

exports.findPartNumbersForPicklist = async (req,res,next) => {
var {offset , limit , partNumber , description } = req.query
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;
  
  materialInwardWhereClause.QCStatus = 1;
  materialInwardWhereClause.materialStatus = "Available";
  materialInwardWhereClause.status = true;
  var data =  await MaterialInward.findAll({
    where:materialInwardWhereClause,
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
    [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber','UOM'],
    }],
    limit:limit,
    offset:offset
  });

  if(!data){
    return next(HTTPError(500, "Inventory data not found"));
  }

  let responseData = [];
  for(var i=0;i<data.length;i++){
    let item = {
      "partNumber":data[i]["partnumber"]["partNumber"],
      "description":data[i]["partnumber"]["description"],
      "UOM":data[i]["partnumber"]["UOM"],
    }
    responseData.push(item);
  }
  req.responseData = responseData;
  next();
};

exports.findRecentTransactionsWithoutMaterialId =async (req, res,next) => {
  var materialInwardWhereClause = {};
  if(req.site){
    materialInwardWhereClause.siteId = req.site;
  }
  
  var {offset,limit} = req.query;
  limit = (limit) ? parseInt(limit) : 20;
  offset = (offset) ? parseInt(offset) : 0;

  let responseData = [];

  await InventoryTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause,
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["materialinward"]["partNumber"],
        'transactionType':"Material Inward",
        'materialInwardId':data[i]["dataValues"]["materialInwardId"],
        'barcodeSerial':data[i]["dataValues"]["materialinward"]["barcodeSerial"],
        'performedBy':data[i]["dataValues"]["performedBy"]
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  await PutawayTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause,
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["materialinward"]["partNumber"],
        'transactionType':"Material Putaway",
        'materialInwardId':data[i]["dataValues"]["materialInwardId"],
        'barcodeSerial':data[i]["dataValues"]["materialinward"]["barcodeSerial"],
        'performedBy':data[i]["dataValues"]["performedBy"]
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  await QCTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause,
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["materialinward"]["partNumber"],
        'transactionType':"Material QC Check",
        'materialInwardId':data[i]["dataValues"]["materialInwardId"],
        'barcodeSerial':data[i]["dataValues"]["materialinward"]["barcodeSerial"],
        'performedBy':data[i]["dataValues"]["performedBy"]
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  await IssueToProductionTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause,
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["materialinward"]["partNumber"],
        'transactionType':data[i]["dataValues"]["transactionType"],
        'materialInwardId':data[i]["dataValues"]["materialInwardId"],
        'barcodeSerial':data[i]["dataValues"]["materialinward"]["barcodeSerial"],
        'performedBy':data[i]["dataValues"]["updatedBy"]
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  await StockTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: materialInwardWhereClause,
    }],
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["materialinward"]["partNumber"],
        'transactionType':"Stock Transfer",
        'materialInwardId':data[i]["dataValues"]["materialInwardId"],
        'barcodeSerial':data[i]["dataValues"]["materialinward"]["barcodeSerial"],
        'performedBy':data[i]["dataValues"]["createdBy"]
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  await Picklist.findAll({
    where: materialInwardWhereClause,
    order: [
    ['updatedAt', 'DESC'],
    ],
    offset:offset,
    limit:limit, 
  })
  .then(data => {
    for(var i=0;i<data.length;i++){
      let picklistStatus = "Picklist Created";
      let owner = data[i]["dataValues"]["createdBy"];
      if(data[i]["dataValues"]["picklistStatus"]=="Completed"){
        picklistStatus = "Picklist Completed";
        owner = data[i]["dataValues"]["updatedBy"]
      }
      let singleJson = {
        'transactionTimestamp': data[i]["dataValues"]["createdAt"],
        'partNumber':data[i]["dataValues"]["picklistName"],
        'transactionType':picklistStatus,
        'performedBy':owner
      }
      responseData.push(singleJson);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving InventoryTransaction."
    });
  });

  responseData.sort(function(a,b){
    return new Date(b.transactionTimestamp) - new Date(a.transactionTimestamp)
  })

  responseData = responseData.slice(0,50);
  req.responseData = responseData;
  next();
};  


exports.updateQcStatusHHT = async (req, res,next) => {
  var notUpdatedList = [];
  for(var i=0;i<req.body.length;i++){
   await MaterialInward.update(req.body[i], {
      where: { 
        barcodeSerial: req.body[i]["barcodeSerial"] 
      }
    })
    .then(async num => {
      console.log(num)
      if (num == 1) {
        const statusChange = {
          transactionTimestamp :Date.now(), 
          materialInwardId: req.body[i]["id"],
          prevQCStatus:req.body[i]["prevQCStatus"],
          currentQCStatus:req.body[i]["QCStatus"],
          performedBy:req.user.username,
          createdBy:req.user.username,
          updatedBy:req.user.username,
        };
       await QCTransaction.create(statusChange)
      }
      else{
        notUpdatedList.push(req.body[i]);
      }
    }).catch(err => {
      notUpdatedList.push(req.body[i]);
    });
  }
  console.log(req.body.length,notUpdatedList.length)
  if(req.body.length == notUpdatedList.length){
    res.status(500).send({
      message: "Error updating QC status "
    });
  }
  else{
    next();
  }   
}; 