const db = require("../models");
const MaterialInward = db.materialinwards;
const Op = db.Sequelize.Op;
const PartNumber = db.partnumbers;
const Location = db.locations;
const InventoryTransaction = db.inventorytransactions;
const QCTransaction = db.qctransactions;

// Create and Save a new MaterialInward
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.partNumberId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  var dataArray = [];
  var partsBarcode;
  const partNumbersId = req.body.partNumberId;

  await PartNumber.findAll({
    where: {id: partNumbersId}
  })
  .then(data => {
    partsBarcode = data[0]["dataValues"]["partNumber"];
  });
  console.log("Part number:",partsBarcode);
  for(var i=0; i < req.body.quantity; i++){

    if(partsBarcode != null && partsBarcode !=undefined){
      var serialNumberId;
      await MaterialInward.findAll({
        where: { 
          partNumberId: req.body.partNumberId
        },
        order: [
        ['id', 'DESC'],
        ],
      })
      .then(data => {
        console.log("Data On line 43",data);
        if(data[0] != null || data[0] != undefined){
          serialNumberId = data[0]["dataValues"]["barcodeSerial"];
          serialNumberId = serialNumberId.substring(serialNumberId.length -7, serialNumberId.length);
          serialNumberId = (parseInt(serialNumberId) + 1).toString();
          var str = '' + serialNumberId;
          while (str.length < 7) {
            str = '0' + str;
          }
          serialNumberId = partsBarcode + "#" + str;
          console.log("Line 50 Serial Number", str);
        }
        else{
          serialNumberId = partsBarcode + "#" + "0000001";
        }
      })
      .catch(err=>{
        serialNumberId = partsBarcode + "#" + "0000001";
      });
      const materialinward = {
        partNumberId: req.body.partNumberId,
        locationId: req.body.locationId,
        batchNumber: req.body.batchNumber,
        barcodeSerial: serialNumberId,
        eachPackQuantity: req.body.eachPackQuantity,
        invoiceReferenceNumber: req.body.invoiceReferenceNumber,
        inwardDate: req.body.inwardDate,
        QCStatus: 0,
        status:true,
        materialStatus:false,
        createdBy:req.user.username,
        updatedBy:req.user.username
      };
      console.log("Line 74",materialinward);
    // Save MaterialInward in the database
    await MaterialInward.create(materialinward)
    .then(async data => {
      dataArray.push(data);

    // MaterialInward transaction entry in the database
    const inventoryTransact = {
      transactionTimestamp: Date.now(),
      performedBy:req.user.username,
      transactionType:"Inward",
      materialInwardId:data["id"],
      batchNumber: req.body.batchNumber,
      createdBy:req.user.username,
      updatedBy:req.user.username
    }
    await InventoryTransaction.create(inventoryTransact)
    .then(data => {
          console.log("data on line 94");
        })
    .catch(err => {
      console.log(err);
    });
    
  })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while creating the MaterialInward."
      });
    });
  }
  else{
    res.status(400).send({
      message: "Part Number not found in database!"
    });
    
  }
}
res.send(dataArray);

};

// Retrieve all MaterialInwards from the database.
exports.findAll = (req, res) => {
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
  
  MaterialInward.findAll({ 
    where: queryString,
    include: [{
      model: PartNumber,
      model: Location
    }],
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
      err.message || "Some error occurred while retrieving materialinwards."
    });
  });
};

// Find a single MaterialInward with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  MaterialInward.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving MaterialInward with id=" + id
    });
  });
};

// Update a MaterialInward by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  MaterialInward.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "MaterialInward was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update MaterialInward with id=${id}. Maybe MaterialInward was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating MaterialInward with id=" + id
    });
  });
};

// Delete a MaterialInward with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  MaterialInward.destroy({
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "MaterialInward was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete MaterialInward with id=${id}. Maybe MaterialInward was not found!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete MaterialInward with id=" + id
    });
  });
};

// Delete all MaterialInwards from the database.
exports.deleteAll = (req, res) => {
  MaterialInward.destroy({
    where: {},
    truncate: false
  })
  .then(nums => {
    res.send({ message: `${nums} MaterialInwards were deleted successfully!` });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all materialinwards."
    });
  });
};

//Update QC status & transaction of the same
exports.updateQcStatus = (req, res) => {
  console.log(req.body);
  MaterialInward.update(req.body, {
    where: { id: req.body.id }
  })
  .then(num => {
    if (num == 1) {
      const statusChange = {
        materialInwardId: req.body.id,
        prevQCStatus:req.body.prevQCStatus,
        currentQCStatus:req.body.prevQCStatus,
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