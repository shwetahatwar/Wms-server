const db = require("../models");
const Picklist = db.picklists;
const PicklistMaterialList = db.picklistmateriallists;
const PicklistPickingMaterialList = db.picklistpickingmateriallists;
const MaterialInward = db.materialinwards;
const Op = db.Sequelize.Op;
const PartNumber = db.partnumbers;
const Sequelize = require("sequelize");
var sequelize = require('../config/db.config.js');
  

// Create and Save a new Picklist
exports.create = async (req, res) => {
  if (!req.body.material) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  } 

  var responseData;
  var canCreate = 0; 
  for(var i=0;i<req.body.material.length;i++){
    var checkMaterialQty = await MaterialInward.count({
      where:{
        'partNumber':req.body.material[i].partNumber,
        'QCStatus':1,
      }
    });
    if(checkMaterialQty >= req.body.material[i].numberOfPacks){
      canCreate =1;
    }
  }

  if(canCreate == 1){

  var picklistId;
  const picklistData = {
    picklistName: req.body.picklistName,
    status:true,
    picklistStatus:"Pending",
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  await Picklist.create(picklistData)
  .then(data => {
    responseData = data;
    picklistId = data["dataValues"]["id"]
  })
  .catch(err => {
     res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the picklist."
      });
  });
  for(var i=0;i<req.body.material.length;i++){
    var checkMaterialQty;
    checkMaterialQty = await MaterialInward.count({
      where:{
        'partNumber':req.body.material[i].partNumber,
        'QCStatus':1,
      }
    })
    .then(async data=>{
      if(data != null && data !=undefined){
        checkMaterialQty = data;
      }
      if(checkMaterialQty !=0 && checkMaterialQty !=undefined){
      if(checkMaterialQty >= req.body.material[i].numberOfPacks){
        var getBatchCode = await MaterialInward.findAll({
          where: {
            'partNumber':req.body.material[i].partNumber,
            'QCStatus':1,
          },
          order: [
          ['createdAt', 'ASC'],
          ],
        });
        counter = req.body.material[i]["numberOfPacks"];
        var dups = [];
        var arr = getBatchCode.filter(function(el) {
          // If it is not a duplicate, return true
          if (dups.indexOf(el["batchNumber"]) == -1) {
            dups.push(el["batchNumber"]);
            return true;
          }
          return false;
        });
        for(var s=0;s<dups.length;s++){
          if(counter != 0 && counter > 0){
            var batchQuantity = await MaterialInward.count({
              where:{
                'partNumber':req.body.material[i].partNumber,
                'batchNumber':dups[s],
                'QCStatus':1,
              }
            });
            console.log("Line 96 batchQuantity :",batchQuantity);
            console.log("Line 97 counter :",counter);
            var partDescription;
            await PartNumber.findAll({ 
              where:
              {
                partNumber:req.body.material[i]["partNumber"]
              }
            }).then(data => {
              if(data.length !=0){
                partDescription = data[0]["dataValues"]["description"];
              }
            })
            .catch(err => {
              res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving materials."
              });
            });

            if(batchQuantity >= counter){
              console.log("Line 95",req.body.material[i]["partNumber"]);
              const picklistMaterialListData = {
                picklistId: picklistId,
                batchNumber: dups[s],
                numberOfPacks:counter,
                purchaseOrderNumber:req.body.material[i]["purchaseOrderNumber"],
                partNumber:req.body.material[i]["partNumber"],
                partDescription:partDescription,
                createdBy:req.user.username,
                updatedBy:req.user.username
              }
              console.log("Data on line 126",picklistMaterialListData)
             await PicklistMaterialList.create(picklistMaterialListData)
              .then(picklistMaterialList=>{
                console.log("Data on line 129",picklistMaterialList);
              })
              .catch(err=>{
                console.log("Error on line 132",err);
              });
              counter = counter - counter;
              console.log("Line 116 counter :",counter);
              break;
            }
            else{
              const picklistMaterialListData = {
                picklistId: picklistId,
                batchNumber: dups[s],
                numberOfPacks:batchQuantity,
                partNumber:req.body.material[i]["partNumber"],
                purchaseOrderNumber:req.body.material[i]["purchaseOrderNumber"],
                partDescription:partDescription,
                createdBy:req.user.username,
                updatedBy:req.user.username
              }
              PicklistMaterialList.create(picklistMaterialListData)
              .then(picklistMaterialList=>{
              })
              .catch(err=>{
                console.log(err);
                t.rollback();
              });
              counter = counter - batchQuantity;
            }
          }
        }
      }
    }
    })
    .catch(err=>{

    })
  }
  res.send(responseData);
  }
  else{
    res.status(500).send({
      message:
      "Picklist not created due to insufficient quantity ."
    });
  }
  
};

// Get all Picklists from the database.
exports.findAll = (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  console.log("Line 51", req.query);
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.offset != null || req.query.offset != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  
  Picklist.findAll({ 
    where: queryString,
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
      err.message || "Some error occurred while retrieving picklists."
    });
  });
};

exports.getCountForPicklist = async(req,res) =>{
  let responseData =[];
  for(var i=0;i<req.body.length;i++){
    var checkMaterialQty = await MaterialInward.count({
      where:{
        'partNumber':req.body[i].partNumber,
        'QCStatus':1,
      }
    });
    let item = {
      "partNumber":req.body[i].partNumber,
      "quantity":checkMaterialQty
    }
    responseData.push(item);
  }
  console.log(responseData);
  res.send(responseData);
}

// Find a single Picklist with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Picklist.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Picklist with id=" + id
    });
  });
};

// Update a Picklist by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Picklist.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Picklist with id=${id}. Maybe Picklist was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist with id=" + id
    });
  });
};

// Delete a Picklist with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Picklist.destroy({
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Picklist with id=${id}. Maybe Picklist was not found!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete Picklist with id=" + id
    });
  });
};

// Delete all Picklists from the database.
exports.deleteAll = (req, res) => {
  Picklist.destroy({
    where: {},
    truncate: false
  })
  .then(nums => {
    res.send({ message: `${nums} Picklists were deleted successfully!` });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all Picklists."
    });
  });
};

//Get Picklist Material List
exports.getPicklistMaterialLists = (req, res) => {  
  PicklistMaterialList.findAll({ 
    where: req.params
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklists."
    });
  });
};

//Create Picklist Material List
exports.postPicklistMaterialLists = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.picklistId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  console.log(req.body.material.length);
  for(var i=0;i<req.body.material.length;i++){
    if(req.body.material[i].serialNumber){
      req.body.material[i].serialNumber = req.body.material[i].serialNumber.trim();
    }
    const picklistpickingmateriallist = {
      picklistId: req.params.picklistId,
      userId:req.body.userId,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:req.body.material[i].partNumber,
      batchNumber:req.body.material[i].batchNumber,
      serialNumber:req.body.material[i].serialNumber
    };

    await PicklistMaterialList.create(picklistpickingmateriallist)
    .then(data => {
      console.log("Picklist created",data);
    })
    .catch(err => {
      console.log("Erro while picklistpickingmateriallist",err);
    });
  }
  res.status(200).send({
    message:
      "Completed Successfully."
  });
  
};

//Get Picklist Material List
exports.getPicklistMaterialList = (req, res) => {

  PicklistMaterialList.findAll({ 
    where: req.params
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Material List."
    });
  });
};

//Update Picklist Material List
exports.putPicklistMaterialList = (req, res) => {
  const id = req.params.id;

  PicklistMaterialList.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist Material List was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Picklist Material List with id=${id}. Maybe Picklist Material List was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist Material List with id=" + id
    });
  });
};


//Picking 
//Get Picklist Picking Material List
exports.getPicklistPickingMaterialLists = (req, res) => {

  PicklistPickingMaterialList.findAll({ 
    where: req.params
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Picking Material List."
    });
  });
};

//Create Picklist Picking Material List
exports.postPicklistPickingMaterialLists = async (req, res) => {
  console.log(req.body.materials.length);
  for(var i=0;i<req.body.materials.length;i++){
    console.log(req.body.materials[i]);

     if(req.body.materials[i].serialNumber){
      req.body.materials[i].serialNumber = req.body.materials[i].serialNumber.trim();
    }
    const picklistpickingmateriallist = {
      picklistId: req.params.picklistId,
      userId:1,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:req.body.materials[i].partNumber,
      batchNumber:req.body.materials[i].batchNumber,
      serialNumber:req.body.materials[i].serialNumber
    };

    // Save materials of picklist in the database
    await PicklistPickingMaterialList.create(picklistpickingmateriallist)
    .then(data => {
      console.log("PicklistPickingMaterialList",data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Picklist Picking Material List."
      });
    });
  }
  //updated picklist
  var updatedPicklist = {
    picklistStatus: "Completed"
  }
  await Picklist.update(updatedPicklist, {
    where: {
      id: req.params.picklistId
    }
  })
  .then(num => {
    if (num == 1) {
      console.log("Picklist updated",req.params.picklistId);
    } 
    else {
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist with id=" + id
    });
  });
  res.status(200).send({
    message:
      "Completed Successfully."
  });
  
};

//Get Picklist Picking Material List
exports.getPicklistPickingMaterialList = (req, res) => {

  PicklistPickingMaterialList.findAll({ 
    where: req.params
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Picking Material List."
    });
  });
};

//Update Picklist Picking Material List
exports.putPicklistPickingMaterialList = (req, res) => {
  const id = req.params.id;

  PicklistPickingMaterialList.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist Picking Material List was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Picklist Picking Material List with id=${id}. Maybe Picklist Picking Material List was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist Picking Material List with id=" + id
    });
  });
};


//Get Count of Picklist for Dashboard
exports.getPicklistCountDashboard = async (req, res) => {
  var d = new Date();
  var newDay = d.getDate();
  if(newDay.toString().length == 1)
    newDay = "0" + newDay;
  var newMonth = d.getMonth();
  newMonth = newMonth +1;
  if(newMonth.toString().length == 1)
    newMonth = "0" + newMonth;
  var newYear = d.getFullYear();
  var newDateTimeNow = newYear + "-" + newMonth + "-" + newDay;

  var query = "SELECT * FROM wms.picklists where createdAt like '%" + newDateTimeNow + "%';";
  await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
  .then(function(picklists) {
    console.log(picklists);
    var pending = 0;
    var inProgress = 0;
    var completed = 0;
    var total = picklists.length;
    for(var i = 0; i < picklists.length; i++){
      console.log("Line 660",picklists[i]["picklistStatus"]);
      if(picklists[i]["picklistStatus"] == "In Progress"){
        inProgress++;
      }
      else if(picklists[i]["picklistStatus"] == "Pending"){
        pending++;
      }
      else if(picklists[i]["picklistStatus"] == "Completed"){
        completed++;
      }
    }
    var picklistCount = {
      inProgress: inProgress,
      pending: pending,
      completed:completed,
      total:total
    }
    res.send(picklistCount);
  })
  .catch(function(err){
    res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving count."
      });
  });
};

//Get Picklist Between Dates
exports.getPicklistByDate = (req, res) => {
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
  Picklist.findAll({ 
    where: {
      createdAt: {
        [Op.gte]: parseInt(req.query.createdAtStart),
        [Op.lt]: parseInt(req.query.createdAtEnd),
      }
    },
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
          err.message || "Some error occurred while retrieving picklists."
      });
    });
};

//get by picklist name
exports.findPicklistByName = async (req, res) => {
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
  Picklist.findAll({ 
    where: {
      picklistName: {
        [Op.or]: {
          [Op.eq]: ''+req.query.picklistName+'',
          [Op.like]: '%'+req.query.picklistName+'%'
        }
      }
    },
    order: [
    ['id', 'ASC'],
    ],
    offset:offset,
    limit:limit
  }).then(async data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklists."
    });
  });
}