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

exports.materialInwardBulkUpload = async (req, res, next) => {

  if (!req.materialInward) {
    return res.status(500).send("No Material");
  }
  var materialInward = serialNumberHelper.getSerialNumbers(req.body,req.partNumber["partNumber"],req.materialInward,req.user.username);
  materialInward = await MaterialInward.bulkCreate(materialInward);
  req.materialInwardBulkUpload = materialInward.map ( el => { return el.get({ plain: true }) } );
  
  next();
}

exports.sendResponse = (req, res, next) => {
  return res.status(200).send(req.materialInwardBulkUpload)
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
      var putawayTransactionList = await createTransaction.createPutawayTransaction(materialInward,req.user.username);
      var inventoryTransactionList = await createTransaction.createInventoryTransaction(materialInward,req.user.username);

      }
  });
  if (!req.materialInwardBulkUploadResponse) {
    return next(HTTPError(400, "Material not inwarded"));
  }

  console.log("materialInwardBulkUploadResponse 67",req.materialInwardBulkUploadResponse)
  
  next();
}

exports.sendBulkUploadResponse = (req, res, next) => {
  return res.status(200).send(req.materialInwardBulkUploadResponse)
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

    var newOffset = 0;
    var newLimit = 100;

    if(offset){
      newOffset = parseInt(offset)
    }

    if(limit){
      newLimit = parseInt(limit)
    }

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
      order: [
      ['id', 'DESC'],
      ],
      offset:newOffset,
      limit:newLimit 
    });

    if (!materialinwards) {
      return next(HTTPError(400, "Material Inwards not found"));
    }

    req.materialInwardsList = materialinwards.map ( el => { return el.get({ plain: true }) } );

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
  next();
};


exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.materialInwardsList);
};

// Update a MaterialInward by the id in the request
exports.update = async (req, res,next) => {
  const id = req.params.id;

  var {partNumberId,shelfId,barcodeSerial,partNumber,eachPackQuantity,status,QCStatus,QCRemarks,
    materialStatus,
    siteId} = req.body;

    var whereClause = new WhereBuilder()
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
    console.log("whereClause",whereClause)
    var updatedMaterialInward;
    try {
      updatedMaterialInward = await MaterialInward.update(whereClause,{
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

//Update QC status & transaction of the same
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


exports.getCountByPending = async (req, res) => {
  var countTable=[];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  await MaterialInward.count({
    where:{
      status:1,
      materialStatus : "NA",
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    console.log(data);

    let singleData = {
      'total':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      materialStatus : "NA",
      QCStatus:1,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'ok':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      materialStatus : "NA",
      QCStatus:0,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'pending':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      materialStatus : "NA",
      QCStatus:2,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'rejected':data
    };
    countTable.push(singleData);
    res.status(200).send({
      countTable
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500);
    res.send(err);
  });

}
// get count by QC
exports.countByQcStatus = async (req, res) => {
  var countTable=[];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  await MaterialInward.count({
    where:{
      status:1,
      siteId: {
        [Op.like]: checkString
      }
      // materialStatus : "Available"
    }
  })
  .then(data => {
    console.log(data);

    let singleData = {
      'total':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:1,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'ok':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:0,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'pending':data
    };
    countTable.push(singleData);
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:2,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    let singleData = {
      'rejected':data
    };
    countTable.push(singleData);
    res.status(200).send({
      countTable
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500);
    res.send(err);
  });
};


//Get count
exports.countByQcStatusHHT = async (req, res) => {
  var countTable=[];
  var total = 0;
  var ok = 0;
  var pending = 0;
  var rejected = 0;

  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  await MaterialInward.count({
    where:{
      status:1,
      siteId: {
        [Op.like]: checkString
      }
      // materialStatus : "Available"
    }
  })
  .then(data => {
    console.log(data);
    total = data;
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:1,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    ok = data;
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:0,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    pending = data;
  })
  await MaterialInward.count({
    where:{
      status:1,
      // materialStatus : "Available",
      QCStatus:2,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    rejected = data;

    let QCStatus = {
      "ok":ok,
      "pending":pending,
      "rejected":rejected,
      "total":total
    }
    res.status(200).send({
      QCStatus :QCStatus
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500);
    res.send(err);
  });
};

exports.findPendingMaterialInwardsBySearchQuery= async (req, res) => {
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
  if(req.query.barcodeSerial == undefined){
    req.query.barcodeSerial='';
  }
  if(req.query.partNumber == undefined){
    req.query.partNumber='';
  }
  if(req.query.description == undefined){
    req.query.description='';
  }
  MaterialInward.findAll({ 
    where: {
      status:1,
      QCStatus:req.query.QCStatus,
      materialStatus:"NA",
      partNumber: {
        [Op.like]: '%'+req.query.partNumber+'%'
      },
      barcodeSerial: {
        [Op.like]: '%'+req.query.barcodeSerial+'%'
      },
      siteId: {
        [Op.like]: checkString
      }
    },
    include: [{
      model: PartNumber,
      required:true,
      where: {
        description: {
          [Op.like]: '%'+req.query.description+'%'
        }
      },
    },
    {
      model: Shelf
    }],
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  }).then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);
    console.log("responseData",responseData);
    var total = 0;
    await MaterialInward.count({ 
      where: {
        status:1,
        QCStatus:req.query.QCStatus,
        materialStatus:"NA",
        partNumber: {
          [Op.like]: '%'+req.query.partNumber+'%'
        },
        barcodeSerial: {
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      },
      include: [{
        model: PartNumber,
        required:true,
        where: {
          description: {
            [Op.like]: '%'+req.query.description+'%'
          }
        },
      },
      ]
    }).then(data => {
      total = data;
    }).catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving materialinward."
      });
    });
    var totalMaterials = {
      totalCount : total
    }
    countArray.push(totalMaterials);
    responseData.push(countArray);
    res.send(responseData);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
}

//get data by search query
exports.findMaterialInwardsBySearchQuery = async (req, res) => {
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

  if(req.query.barcodeSerial == undefined){
    req.query.barcodeSerial="";
  }
  if(req.query.partNumber == undefined){
    req.query.partNumber="";
  }
  if(!req.query.QCStatus){
    MaterialInward.findAll({ 
      where: {
        status:1,
        QCStatus:{
          [Op.ne]:2
        },
        partNumber: {
          [Op.or]: {
            [Op.eq]: ''+req.query.partNumber+'',
            [Op.like]: '%'+req.query.partNumber+'%'
          }
        },
        barcodeSerial: {
          [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      }
    },
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
  }).then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);
    console.log("responseData",responseData);
    var total = 0;
    await MaterialInward.count({ 
      where: {
        status:1,
        QCStatus:{
          [Op.ne]:2
        },
        siteId: {
          [Op.like]: checkString
        },
        partNumber: {
          [Op.or]: {
            [Op.eq]: ''+req.query.partNumber+'',
            [Op.like]: '%'+req.query.partNumber+'%'
          }
        },
        barcodeSerial: {
          [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }
      }
    },
  }).then(data => {
    total = data;
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);
  res.send(responseData);
}).catch(err => {
  res.status(500).send({
    message:
    err.message || "Some error occurred while retrieving materialinward."
  });
});
}
else if(req.query.partNumber != undefined && req.query.partNumber != null){
  var partNumberId;
    // await PartNumber.findAll({
    //   where: {
    //     partNumber: {
    //       [Op.or]: {
    //         [Op.eq]: ''+req.query.partNumber+'',
    //         [Op.like]: '%'+req.query.partNumber+'%'
    //       }
    //     },
    //     status:1
    //   }
    // }).then(data => {
    //   partNumberId = data[0]["dataValues"]["id"];
    // });
    console.log("In Part Search");

    if(req.query.partNumber != null && req.query.partNumber != undefined){
      MaterialInward.findAll({ 
        where: {
          status:1,
          QCStatus:req.query.QCStatus,
          partNumber: {
            [Op.or]: {
              [Op.eq]: ''+req.query.partNumber+'',
              [Op.like]: '%'+req.query.partNumber+'%'
            }
          },
          barcodeSerial: {
            [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      }
    },
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
  }).then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);
    console.log("responseData",responseData);
    var total = 0;
    await MaterialInward.count({ 
      where: {
        status:1,
        QCStatus:req.query.QCStatus,
        siteId: {
          [Op.like]: checkString
        },
        partNumber: {
          [Op.or]: {
            [Op.eq]: ''+req.query.partNumber+'',
            [Op.like]: '%'+req.query.partNumber+'%'
          }
        },
        barcodeSerial: {
          [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }
      }
    },
  }).then(data => {
    total = data;
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);
  res.send(responseData);
}).catch(err => {
  res.status(500).send({
    message:
    err.message || "Some error occurred while retrieving materialinward."
  });
});
}
}

else{
  MaterialInward.findAll({ 
    where: {
      status:1,
      QCStatus:req.query.QCStatus,
      siteId: {
        [Op.like]: checkString
      },
      barcodeSerial: {
        [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }
      }
    },
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
  }).then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    await MaterialInward.count({ 
      where: {
        status:1,
        QCStatus:req.query.QCStatus,
        barcodeSerial: {
          [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      }
    },
  }).then(data => {
    total = data;
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);
  res.send(responseData);
})
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
}
};

exports.findMaterialInwardsBySearchQueryStock = async (req, res) => {
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

  if(req.query.barcodeSerial == undefined){
    req.query.barcodeSerial="";
  }
  if(req.query.partNumber == undefined){
    req.query.partNumber="";
  }

  if(req.query.QCStatus != "All"){
    MaterialInward.findAll({ 
      where: {
        status:1,
        QCStatus:req.query.QCStatus,
        materialStatus:{
          [Op.or]: ["Available", "NA"]
        },
        partNumber: {
          [Op.like]: '%'+req.query.partNumber+'%'
        },
        barcodeSerial: {
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      },
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
    }).then(async data => {
      var countArray =[];
      var responseData =[];
      responseData.push(data);
      console.log("responseData",responseData);
      var total = 0;
      await MaterialInward.count({ 
        where: {
          status:1,
          QCStatus:req.query.QCStatus,
          materialStatus:{
            [Op.or]: ["Available", "NA"]
          },
          partNumber: {
            [Op.like]: '%'+req.query.partNumber+'%'
          },
          barcodeSerial: {
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          },
          siteId: {
            [Op.like]: checkString
          }
        },
      }).then(data => {
        total = data;
      }).catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving materialinward."
        });
      });
      var totalMaterials = {
        totalCount : total
      }
      countArray.push(totalMaterials);
      responseData.push(countArray);
      res.send(responseData);
    }).catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving materialinward."
      });
    });
  }

  else{
    MaterialInward.findAll({ 
      where: {
        status:1,
        materialStatus:{
          [Op.or]: ["Available", "NA"]
        },
        partNumber: {
          [Op.like]: '%'+req.query.partNumber+'%'
        },
        barcodeSerial: {
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        },
        siteId: {
          [Op.like]: checkString
        }
      },
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
    }).then(async data => {
      var countArray =[];
      var responseData =[];
      responseData.push(data);

      var total = 0;
      await MaterialInward.count({ 
        where: {
          status:1,
          materialStatus:{
            [Op.or]: ["Available", "NA"]
          },
          partNumber: {
            [Op.like]: '%'+req.query.partNumber+'%'
          },
          barcodeSerial: {
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          },
          siteId: {
            [Op.like]: checkString
          }
        },
      }).then(data => {
        total = data;
      })
      .catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving materialinward."
        });
      });
      var totalMaterials = {
        totalCount : total
      }
      countArray.push(totalMaterials);
      responseData.push(countArray);
      res.send(responseData);
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving materialinward."
      });
    });
  }
};

// Update a MaterialInward by the Barcode Serial in the request
exports.updateWithBarcode = async (req, res) => {
  const barcodeSerial = req.params.barcodeSerial;
  var netWeightOfPacks;
  var materialInwardId;
  var locationIds;
  var eachPackQty;
  await MaterialInward.findAll({
    where: { 
      barcodeSerial: barcodeSerial
    },
    include:{
      model: PartNumber
    },
  })
  .then(async data => {
    eachPackQty = data[0]["dataValues"]["eachPackQuantity"];
    materialInwardId = data[0]["dataValues"]["id"];
    locationIds = data[0]["dataValues"]["shelfId"];
    await PartNumber.findAll({
      where: { 
        id: data[0]["dataValues"]["partNumberId"]
      }
    })
    .then(data => {
      netWeightOfPacks = data[0]["dataValues"]["netWeight"];
      netWeightOfPacks = netWeightOfPacks * eachPackQty;
    })
    .catch(err => {

    });
  });
  let totalCapacity;
  if(req.body.shelfId != null && req.body.shelfId != undefined){
    let prevCapacityOfLocation = 0;
    await Shelf.findAll({
      where: {id : req.body.shelfId}
    })
    .then(data => {
      totalCapacity = data[0]["dataValues"]["capacity"];
      prevCapacityOfLocation = data[0]["dataValues"]["loadedCapacity"];
    });
    let netWeightOfPacksInTons = netWeightOfPacks/1000;
    netWeightOfPacksInTons = Math.round((netWeightOfPacksInTons + Number.EPSILON) * 100) / 100;
    let updateCapacity = prevCapacityOfLocation + netWeightOfPacksInTons;
    console.log("updateCapacity",updateCapacity,totalCapacity,netWeightOfPacksInTons);
    // if(updateCapacity <= totalCapacity){
      var updatedData = {
        'loadedCapacity': updateCapacity
      };
      await Shelf.update(updatedData, {
        where:{
          id:req.body.shelfId
        }
      })
      .then(async data => {
        await MaterialInward.update(req.body, {
          where: req.params
        })
        .then(async num => {
          if (num == 1) {
            const putwayTransaction = {
              transactionTimestamp: Date.now(),
              performedBy:req.user.username,
              materialInwardId:materialInwardId,
              prevLocationId :locationIds,
              currentLocationId :req.body.shelfId, 
              createdBy:req.user.username,
              updatedBy:req.user.username
            }
            await PutawayTransaction.create(putwayTransaction)
            .then(data => {
            })
            .catch(err => {
              console.log(err);
            });
            res.send({
              message: "MaterialInward was updated successfully."
            });
          } 
          else {
            res.send({
              message: `Cannot update MaterialInward with Barcode=${barcodeSerial}. Maybe MaterialInward was not found or req.body is empty!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating MaterialInward with Barcode=" + barcodeSerial
          });
        });
      })
      .catch(err => {
        console.log(err);
      });
  // }
  // else{
  //   res.status(500).send({
  //     message: "Material connot put to this location due to capacity is exceeding"
  //   });

  // }
}

};

//get inventory where count less than 10
exports.inventoryData = (req, res) => {
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  MaterialInward.findAll({
    where:{
      'QCStatus':1,
      'materialStatus': "Available",
      'status':1,
      'siteId': {
        [Op.like]: checkString
      }
    },
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
    [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber']
    }],
    having: Sequelize.where(Sequelize.literal('SUM(eachPackQuantity * 1)'), '<=', 10)
    // having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('partNumberId')), '<=', 10)
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    console.log("Error",err)
    res.status(500).send({
      message: "Error while retrieving inventory"
    });
  });
};


//get inventory Stock 
exports.inventoryStockData = async (req, res) => {
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
  if(req.query.partNumber != null && req.query.partNumber != undefined ||
    req.query.description != null && req.query.description != undefined){
    if(!req.query.partNumber){
      req.query.partNumber = "";
    }
    if(!req.query.description){
      req.query.description = "";
    }

    let checkString = '%'+req.site+'%'
    if(req.site){
      checkString = req.site
    }

    await MaterialInward.findAll({
      where:{
        'QCStatus':1,
        'materialStatus': "Available",
        'status':1,
        'siteId': {
          [Op.like]: checkString
        }
      },
      group: [ 'partNumberId' ],
      attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
      [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
      include: [{
        model: PartNumber,
        where:{
          description: {
            [Op.like]: '%'+req.query.description+'%'
          },
          partNumber: {
            [Op.like]: '%'+req.query.partNumber+'%'
          },
        },
        attributes: ['description','partNumber']
      }],
      limit:limit,
      offset:offset
    })
    .then(async data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error while retrieving inventory"
      });
    });
  }
  else{
    await MaterialInward.findAll({
      where:{
        'QCStatus':1,
        'materialStatus': "Available",
        'status':1,
        'siteId': {
          [Op.like]: checkString
        }
      },
      group: [ 'partNumberId' ],
      attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
      [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
      include: [{
        model: PartNumber,
        attributes: ['description','partNumber']
      }],
      limit:limit,
      offset:offset
    })
    .then(async data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err)
      res.status(500).send({
        message: "Error while retrieving inventory"
      });
    });
  }
};

//get data by search query for transfer Out
exports.findMaterialInwardsForTransferOut = async (req, res) => {
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

  if(req.query.partNumber != undefined && req.query.partNumber != null){
    var partNumberId;
    if(req.query.barcodeSerial == undefined){
      req.query.barcodeSerial="";
    }
    if(req.query.partNumber != null && req.query.partNumber != undefined){
      MaterialInward.findAll({ 
        where: {
          status:1,
          QCStatus:req.query.QCStatus,
          materialStatus:req.query.materialStatus,
          partNumber: {
            [Op.or]: {
              [Op.eq]: ''+req.query.partNumber+'',
              [Op.like]: '%'+req.query.partNumber+'%'
            }
          },
          barcodeSerial: {
            [Op.or]: {
              [Op.eq]: ''+req.query.barcodeSerial+'',
              [Op.like]: '%'+req.query.barcodeSerial+'%'
            },
            siteId: {
              [Op.like]: checkString
            }
          }
        },
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
      }).then(async data => {
        var countArray =[];
        var responseData =[];
        responseData.push(data);
        console.log("responseData",responseData);
        var total = 0;
        await MaterialInward.count({ 
          where: {
            status:1,
            QCStatus:req.query.QCStatus,
            materialStatus:req.query.materialStatus,
            partNumber: {
              [Op.or]: {
                [Op.eq]: ''+req.query.partNumber+'',
                [Op.like]: '%'+req.query.partNumber+'%'
              }
            },
            barcodeSerial: {
              [Op.or]: {
                [Op.eq]: ''+req.query.barcodeSerial+'',
                [Op.like]: '%'+req.query.barcodeSerial+'%'
              },
              siteId: {
                [Op.like]: checkString
              }
            }
          },
        }).then(data => {
          total = data;
        }).catch(err => {
          res.status(500).send({
            message:
            err.message || "Some error occurred while retrieving materialinward."
          });
        });
        var totalMaterials = {
          totalCount : total
        }
        countArray.push(totalMaterials);
        responseData.push(countArray);
        res.send(responseData);
      }).catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving materialinward."
        });
      });
    }
  }
  else{
    MaterialInward.findAll({ 
      where: {
        status:1,
        QCStatus:req.query.QCStatus,
        materialStatus:req.query.materialStatus,
        barcodeSerial: {
          [Op.or]: {
            [Op.eq]: ''+req.query.barcodeSerial+'',
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          }
        },
        siteId: {
          [Op.like]: checkString
        }
      },
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
    }).then(async data => {
      var countArray =[];
      var responseData =[];
      responseData.push(data);

      var total = 0;
      await MaterialInward.count({ 
        where: {
          status:1,
          QCStatus:req.query.QCStatus,
          materialStatus:req.query.materialStatus,
          barcodeSerial: {
            [Op.or]: {
          // [Op.like]: ''+req.query.barcodeSerial+'%',
          [Op.eq]: ''+req.query.barcodeSerial+'',
          [Op.like]: '%'+req.query.barcodeSerial+'%'
        }
      },
      siteId: {
        [Op.like]: checkString
      }
    },
  }).then(data => {
    total = data;
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinward."
    });
  });
  var totalMaterials = {
    totalCount : total
  }
  countArray.push(totalMaterials);
  responseData.push(countArray);
  res.send(responseData);
})
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving materialinward."
      });
    });
  }
};

exports.inventoryDataCount = (req, res) => {
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  MaterialInward.findAll({
    where:{
      'QCStatus':1,
      'materialStatus': "Available",
      'status':1,
      'siteId': {
        [Op.like]: checkString
      }
    },
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber']
    }],
    having: Sequelize.where(Sequelize.literal('SUM(eachPackQuantity * 1)'), '<=', 10)
  })
  .then(data => {
    let count = data.length;
    res.status(200).send({
      dataCount :count
    });
  })
  .catch(err => {
    res.status(500).send({
      message: "Error while retrieving inventory"
    });
  });
};

//get dashboard count for displaying pending for putaway & total inventory
exports.dashboardCountForPendingPutaway = async (req,res) =>{
  let responseData = [];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  await MaterialInward.findAll({
    where:{
      'QCStatus':1,
      'materialStatus': "Available",
      'status':1,
      'siteId': {
        [Op.like]: checkString
      }
    },
    attributes: [[Sequelize.fn('sum', Sequelize.col('eachPackQuantity')), 'count']],
  })
  .then(async data => {
    console.log(data[0]["dataValues"]);
    count = parseInt(data[0]["dataValues"]["count"])
  })
  .catch(err => {
    res.status(500).send({
      message: "Error while retrieving inventory"
    });
  });

  await MaterialInward.count({
    where:{
      status:1,
      materialStatus : "NA",
      QCStatus:1,
      siteId: {
        [Op.like]: checkString
      }
    }
  })
  .then(data => {
    responseData ={
      'pendingForPutaway':data,
      'totalInventory':count
    };
  })
  res.status(200).send({
    responseData
  });
};


// get Recent updated Material List
exports.findRecentTransactions = (req, res) => {
  if(req.site){
    req.query.siteId = req.site;
  }
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  console.log(req.query,req.query.siteId);
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  
  MaterialInward.findAll({ 
    where: queryString,
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
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving materialinwards."
    });
  });
};

exports.findRecentTransactionsWithoutMaterialId =async (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 20;
  let responseData = [];
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  // const materialId = req.params.id;
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  await InventoryTransaction.findAll({
    include: [{model: MaterialInward,
      required:true,
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
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
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
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
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
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
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
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
      where: {
        siteId: {
          [Op.like]: checkString
        }
      },
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
    where: {
      siteId: {
        [Op.like]: checkString
      }
    },
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
  res.status(200).send({
    responseData
  });
};  